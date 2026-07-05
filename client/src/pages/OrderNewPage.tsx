import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ColorVariantSelect } from "@/components/catalog/ColorVariantSelect";
import { ProductPicker } from "@/components/catalog/ProductPicker";
import { fetchProductPickerOptions } from "@/lib/catalog-picker";
import { maxDeliveryChargeForProducts } from "@/lib/delivery-charge";
import { fetchProductDetail, type ProductDetailDto } from "@/lib/api/catalog";
import { createAdminOrder } from "@/lib/api/orders";
import { cn } from "@/lib/utils";
import { NEPAL_PROVINCES } from "@/user/lib/checkout-location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LineDraft = {
  key: string;
  productId: string;
  colorId: string;
  size: string;
  quantity: string;
};

function newLine(): LineDraft {
  return {
    key: crypto.randomUUID(),
    productId: "",
    colorId: "",
    size: "",
    quantity: "1",
  };
}

function computeLineTotal(
  detail: ProductDetailDto | undefined,
  line: LineDraft,
): number {
  if (!detail || !line.colorId || !line.size) return 0;
  const qty = Number(line.quantity) || 0;
  if (qty <= 0) return 0;
  const color = detail.colors.find((c) => c.id === line.colorId);
  const stockRow = color?.stock.find((s) => s.size === line.size);
  const unit =
    stockRow?.price != null ? stockRow.price : detail.product.sellingPrice;
  return unit * qty;
}

function computeDeliveryCharge(details: ProductDetailDto[]): number {
  const seen = new Set<string>();
  const products: Array<{ freeDelivery: boolean; deliveryCharge: number }> = [];

  for (const detail of details) {
    if (seen.has(detail.product.id)) continue;
    seen.add(detail.product.id);
    products.push({
      freeDelivery: detail.product.freeDelivery,
      deliveryCharge: detail.product.deliveryCharge,
    });
  }

  return maxDeliveryChargeForProducts(products);
}

function availableStockForLine(
  line: LineDraft,
  lines: LineDraft[],
  detail: ProductDetailDto | undefined,
): { stock: number; isAvailable: boolean } | null {
  if (!detail || !line.colorId || !line.size) return null;
  const color = detail.colors.find((c) => c.id === line.colorId);
  const stockRow = color?.stock.find((s) => s.size === line.size);
  if (!stockRow) return null;

  const usedElsewhere = lines
    .filter(
      (l) =>
        l.key !== line.key &&
        l.productId === line.productId &&
        l.colorId === line.colorId &&
        l.size === line.size,
    )
    .reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);

  return {
    stock: Math.max(0, stockRow.stock - usedElsewhere),
    isAvailable: stockRow.isAvailable,
  };
}

function validateOrderStock(
  lines: LineDraft[],
  detailByProductId: Record<string, ProductDetailDto>,
): string | null {
  const claimed = new Map<string, number>();

  for (const line of lines) {
    if (!line.productId || !line.colorId || !line.size) continue;
    const detail = detailByProductId[line.productId];
    if (!detail) continue;

    const qty = Number(line.quantity) || 0;
    if (qty < 1) return "Quantity must be at least 1";

    const color = detail.colors.find((c) => c.id === line.colorId);
    const stockRow = color?.stock.find((s) => s.size === line.size);
    const label = `${detail.product.name} / ${color?.colorName ?? "variant"} / ${line.size}`;

    if (!stockRow || !stockRow.isAvailable) {
      return `${label} is not available`;
    }

    const key = `${line.productId}::${line.colorId}::${line.size}`;
    const totalForVariant = (claimed.get(key) ?? 0) + qty;
    claimed.set(key, totalForVariant);

    if (totalForVariant > stockRow.stock) {
      return `Only ${stockRow.stock} in stock for ${label}`;
    }
  }

  return null;
}

export default function OrderNewPage() {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [notes, setNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([newLine()]);

  const { data: productOptions = [], isLoading: pickerLoading } = useQuery({
    queryKey: ["productPickerOptions"],
    queryFn: fetchProductPickerOptions,
  });

  const selectedProductIds = useMemo(
    () => [...new Set(lines.map((l) => l.productId).filter(Boolean))],
    [lines],
  );

  const detailQueries = useQueries({
    queries: selectedProductIds.map((productId) => ({
      queryKey: ["productDetail", productId],
      queryFn: () => fetchProductDetail(productId),
    })),
  });

  const detailByProductId = useMemo(() => {
    const map: Record<string, ProductDetailDto> = {};
    selectedProductIds.forEach((id, index) => {
      const data = detailQueries[index]?.data;
      if (data) map[id] = data;
    });
    return map;
  }, [selectedProductIds, detailQueries]);

  const detailLoadingByProductId = useMemo(() => {
    const map: Record<string, boolean> = {};
    selectedProductIds.forEach((id, index) => {
      map[id] = detailQueries[index]?.isLoading ?? false;
    });
    return map;
  }, [selectedProductIds, detailQueries]);

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const onProductChange = (key: string, productId: string) => {
    updateLine(key, { productId, colorId: "", size: "" });
  };

  const onColorChange = (key: string, colorId: string, productId: string) => {
    const detail = detailByProductId[productId];
    const color = detail?.colors.find((c) => c.id === colorId);
    const firstSize = color?.stock[0]?.size ?? detail?.product.allowedSizes[0] ?? "";
    updateLine(key, { colorId, size: firstSize });
  };

  const totals = useMemo(() => {
    const usedDetails: ProductDetailDto[] = [];
    let itemsSubtotal = 0;
    for (const line of lines) {
      if (!line.productId) continue;
      const detail = detailByProductId[line.productId];
      if (detail && !usedDetails.some((d) => d.product.id === detail.product.id)) {
        usedDetails.push(detail);
      }
      itemsSubtotal += computeLineTotal(detail, line);
    }
    const deliveryCharge = computeDeliveryCharge(usedDetails);
    const currency =
      usedDetails[0]?.product.currency ??
      productOptions.find((p) => p.id === lines.find((l) => l.productId)?.productId)
        ?.currency ??
      "NPR";
    return {
      itemsSubtotal,
      deliveryCharge,
      grandTotal: itemsSubtotal + deliveryCharge,
      currency,
    };
  }, [lines, detailByProductId, productOptions]);

  const createMutation = useMutation({
    mutationFn: () => {
      const items = lines
        .filter((l) => l.productId && l.colorId && l.size)
        .map((l) => ({
          productId: l.productId,
          colorId: l.colorId,
          size: l.size,
          quantity: Number(l.quantity) || 1,
        }));
      if (items.length === 0) {
        throw new Error("Add at least one product with color and size");
      }
      const missingDetail = items.some((item) => !detailByProductId[item.productId]);
      if (missingDetail) {
        throw new Error("Still loading product details — try again in a moment");
      }
      if (!customerName.trim()) throw new Error("Customer name is required");
      if (!/^9\d{9}$/.test(phone.trim())) {
        throw new Error("Phone must be a 10-digit Nepal mobile number starting with 9");
      }
      if (!street.trim() || !city.trim() || !province.trim()) {
        throw new Error("Street, city, and province are required");
      }
      const stockError = validateOrderStock(lines, detailByProductId);
      if (stockError) throw new Error(stockError);
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return createAdminOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        street: street.trim(),
        city: city.trim(),
        district: district.trim(),
        province: province.trim(),
        zipCode: zipCode.trim(),
        notes: notes.trim(),
        adminNotes: adminNotes.trim(),
        tags,
        items,
      });
    },
    onSuccess: (order) => {
      toast.success(`Order ${order.orderReference} created`);
      navigate(`/admin/orders/${order.orderId}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="w-fit -ml-2 gap-1" asChild>
          <Link to="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
            Orders
          </Link>
        </Button>
        <p className="font-body text-sm text-muted-foreground">
          Manually enter orders from Meta ads, phone, or other channels.
        </p>
      </div>

      <Card className="card-shadow border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="on-customer-name">Full name</Label>
            <Input
              id="on-customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="on-phone">Phone</Label>
            <Input
              id="on-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98XXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="on-email">Email (optional)</Label>
            <Input
              id="on-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="For track-order page"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Delivery address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="on-street">Street / area</Label>
            <Input
              id="on-street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="on-city">City</Label>
            <Input id="on-city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="on-district">District</Label>
            <Input
              id="on-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Province</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {NEPAL_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="on-zip">Zip code</Label>
            <Input
              id="on-zip"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="on-notes">Customer notes</Label>
            <Textarea
              id="on-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pickerLoading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading products…
            </p>
          )}
          {lines.map((line) => {
            const detail = line.productId ? detailByProductId[line.productId] : undefined;
            const detailLoading = line.productId
              ? detailLoadingByProductId[line.productId]
              : false;
            const pickerProduct = productOptions.find((p) => p.id === line.productId);
            const colors =
              detail?.colors
                .filter((c) => c.active)
                .map((c) => ({
                  id: c.id,
                  colorName: c.colorName,
                  hexCode: c.hexCode,
                  imageUrl: c.imageUrl,
                })) ?? [];
            const selectedColor = colors.find((c) => c.id === line.colorId);
            const stockRowsForColor =
              detail?.colors.find((c) => c.id === line.colorId)?.stock ?? [];
            const sizes =
              stockRowsForColor.length > 0
                ? stockRowsForColor.map((s) => s.size)
                : (detail?.product.allowedSizes ?? []);
            const stockInfo = availableStockForLine(line, lines, detail);
            const qtyNum = Number(line.quantity) || 0;
            const exceedsStock =
              stockInfo != null &&
              stockInfo.isAvailable &&
              stockInfo.stock > 0 &&
              qtyNum > stockInfo.stock;
            const lineTotal = computeLineTotal(detail, line);
            const previewImage =
              selectedColor?.imageUrl || pickerProduct?.imageUrl || "";

            return (
              <div
                key={line.key}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0 flex-1">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt=""
                        className="h-20 w-20 rounded-md object-cover border border-border shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-md border border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center text-xs text-muted-foreground text-center px-1 shrink-0">
                        Preview
                      </div>
                    )}
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-medium truncate">
                        {detail?.product.name ?? pickerProduct?.name ?? "Product"}
                      </p>
                      {line.productId && detailLoading ? (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Loading variants…
                        </p>
                      ) : line.productId && detail ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {selectedColor?.colorName ?? "Select color"}
                          {line.size ? ` · ${line.size}` : ""}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Select a product below
                        </p>
                      )}
                    </div>
                  </div>
                  {lines.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() =>
                        setLines((prev) => prev.filter((l) => l.key !== line.key))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Product</Label>
                    <ProductPicker
                      products={productOptions}
                      value={line.productId}
                      disabled={pickerLoading}
                      onValueChange={(v) => onProductChange(line.key, v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <ColorVariantSelect
                      colors={colors}
                      value={line.colorId}
                      disabled={
                        !line.productId || detailLoading || colors.length === 0
                      }
                      onValueChange={(v) =>
                        onColorChange(line.key, v, line.productId)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Select
                      value={line.size}
                      disabled={
                        !line.colorId || detailLoading || sizes.length === 0
                      }
                      onValueChange={(v) => updateLine(line.key, { size: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockRowsForColor.length > 0
                          ? stockRowsForColor
                              .filter((row) => row.active)
                              .map((row) => (
                                <SelectItem key={row.size} value={row.size}>
                                  {row.size}
                                  {row.isAvailable
                                    ? ` · ${row.stock} in stock`
                                    : " · not offered"}
                                </SelectItem>
                              ))
                          : sizes.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    {stockInfo && line.colorId && line.size ? (
                      <p
                        className={cn(
                          "text-xs",
                          !stockInfo.isAvailable || stockInfo.stock === 0
                            ? "text-destructive"
                            : exceedsStock
                              ? "text-destructive"
                              : "text-muted-foreground",
                        )}
                      >
                        {!stockInfo.isAvailable
                          ? "This size is not offered"
                          : stockInfo.stock === 0
                            ? "Out of stock"
                            : `${stockInfo.stock} available for this order`}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`qty-${line.key}`}>Quantity</Label>
                    <Input
                      id={`qty-${line.key}`}
                      type="number"
                      min={1}
                      max={
                        stockInfo?.isAvailable && stockInfo.stock > 0
                          ? stockInfo.stock
                          : 999
                      }
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, { quantity: e.target.value })
                      }
                    />
                    {exceedsStock ? (
                      <p className="text-xs text-destructive">
                        Quantity exceeds available stock ({stockInfo?.stock})
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-medium tabular-nums">
                      {totals.currency} {lineTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={() => setLines((prev) => [...prev, newLine()])}
            disabled={pickerLoading}
          >
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </CardContent>
      </Card>

      <Card className="card-shadow border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Internal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="on-tags">Tags (comma-separated)</Label>
            <Input
              id="on-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="meta-ads, instagram"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="on-admin-notes">Admin notes</Label>
            <Textarea
              id="on-admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              placeholder="How the customer reached you, payment method, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-border/60">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 text-sm">
            <p>
              Subtotal:{" "}
              <span className="font-medium tabular-nums">
                {totals.currency} {totals.itemsSubtotal.toLocaleString()}
              </span>
            </p>
            <p>
              Delivery:{" "}
              <span className="font-medium tabular-nums">
                {totals.currency} {totals.deliveryCharge.toLocaleString()}
              </span>
            </p>
            <p className="text-base font-semibold">
              Total:{" "}
              <span className="tabular-nums">
                {totals.currency} {totals.grandTotal.toLocaleString()}
              </span>
            </p>
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || pickerLoading}
          >
            {createMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Create order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
