import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createProductColor,
  deleteProductColor,
  fetchCategories,
  fetchProductDetail,
  replaceVariantStock,
  updateProduct,
  updateProductColor,
  type ProductColorWithStockDto,
  type VariantStockDto,
} from "@/lib/api/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StockRowDraft = {
  /** Empty → inherit product base price (`null` on save). */
  price: string;
  stock: string;
  isAvailable: boolean;
  sku: string;
  /** Empty string → null (no threshold). */
  lowStock: string;
};

function stockDraftFrom(
  sizes: string[],
  existing: VariantStockDto[],
): Record<string, StockRowDraft> {
  const bySize = new Map(existing.map((r) => [r.size, r]));
  const out: Record<string, StockRowDraft> = {};
  for (const size of sizes) {
    const e = bySize.get(size);
    out[size] = {
      price:
        e != null && e.price != null && Number.isFinite(e.price)
          ? String(e.price)
          : "",
      stock: e ? String(e.stock) : "0",
      isAvailable: e?.isAvailable ?? true,
      sku: e?.sku ?? "",
      lowStock:
        e?.lowStockThreshold != null && e.lowStockThreshold !== undefined
          ? String(e.lowStockThreshold)
          : "",
    };
  }
  return out;
}

export default function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories({ active: "all" }),
  });

  const detailQuery = useQuery({
    queryKey: ["productDetail", productId],
    queryFn: () => fetchProductDetail(productId!),
    enabled: Boolean(productId),
  });

  const p = detailQuery.data?.product;
  const colors = detailQuery.data?.colors ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("");
  const [occasionsStr, setOccasionsStr] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [currency, setCurrency] = useState("NPR");
  const [allowedSizesStr, setAllowedSizesStr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (!p) return;
    setName(p.name);
    setDescription(p.description);
    setFabric(p.fabric);
    setOccasionsStr(p.occasions.join(", "));
    setBasePrice(String(p.basePrice));
    setCurrency(p.currency);
    setAllowedSizesStr(p.allowedSizes.join(", "));
    setCategoryId(p.categoryId);
    setActive(p.active);
    setSortOrder(String(p.sortOrder));
  }, [p]);

  const allowedSizes = useMemo(
    () =>
      allowedSizesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [allowedSizesStr],
  );

  const [stockOpenId, setStockOpenId] = useState<string | null>(null);
  const [stockDrafts, setStockDrafts] = useState<
    Record<string, Record<string, StockRowDraft>>
  >({});

  const syncStockDraft = useCallback(
    (color: ProductColorWithStockDto) => {
      setStockDrafts((prev) => ({
        ...prev,
        [color.id]: stockDraftFrom(allowedSizes, color.stock),
      }));
    },
    [allowedSizes],
  );

  useEffect(() => {
    if (!colors.length || !allowedSizes.length) return;
    setStockDrafts((prev) => {
      const next = { ...prev };
      for (const c of colors) {
        if (!next[c.id]) {
          next[c.id] = stockDraftFrom(allowedSizes, c.stock);
        }
      }
      return next;
    });
  }, [colors, allowedSizes]);

  const updateProductMutation = useMutation({
    mutationFn: () => {
      if (!productId) throw new Error("Missing product");
      const price = Number(basePrice);
      if (Number.isNaN(price) || price < 0) throw new Error("Invalid price");
      const occasions = occasionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return updateProduct(productId, {
        categoryId,
        name: name.trim(),
        description: description.trim(),
        fabric: fabric.trim(),
        occasions,
        basePrice: price,
        currency: currency.trim() || "NPR",
        allowedSizes,
        active,
        sortOrder: Number(sortOrder) || 0,
      });
    },
    onSuccess: () => {
      toast.success("Product saved");
      qc.invalidateQueries({ queryKey: ["productDetail", productId] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [colorDialog, setColorDialog] = useState(false);
  const [colorEditingId, setColorEditingId] = useState<string | null>(null);
  const [cn, setCn] = useState("");
  const [cnEn, setCnEn] = useState("");
  const [cImg, setCImg] = useState("");
  const [cActive, setCActive] = useState(true);
  const [cSort, setCSort] = useState("0");

  const saveColorMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error("Missing product");
      if (!cn.trim() || !cImg.trim()) {
        throw new Error("Color name and image URL are required");
      }
      const sortOrder = Number(cSort) || 0;
      if (colorEditingId) {
        return updateProductColor(productId, colorEditingId, {
          colorName: cn.trim(),
          colorNameEn: cnEn.trim(),
          imageUrl: cImg.trim(),
          active: cActive,
          sortOrder,
        });
      }
      return createProductColor(productId, {
        colorName: cn.trim(),
        colorNameEn: cnEn.trim(),
        imageUrl: cImg.trim(),
        active: cActive,
        sortOrder,
      });
    },
    onSuccess: () => {
      toast.success(colorEditingId ? "Color updated" : "Color added");
      qc.invalidateQueries({ queryKey: ["productDetail", productId] });
      setColorDialog(false);
      setColorEditingId(null);
      setCn("");
      setCnEn("");
      setCImg("");
      setCActive(true);
      setCSort("0");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteColorMutation = useMutation({
    mutationFn: ({ colorId }: { colorId: string }) => {
      if (!productId) throw new Error("Missing product");
      return deleteProductColor(productId, colorId);
    },
    onSuccess: () => {
      toast.success("Color removed");
      qc.invalidateQueries({ queryKey: ["productDetail", productId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveStockMutation = useMutation({
    mutationFn: (colorId: string) => {
      if (!productId) throw new Error("Missing product");
      const draft = stockDrafts[colorId];
      if (!draft) throw new Error("Open stock editor first");
      const items = allowedSizes.map((size) => {
        const row = draft[size] ?? {
          price: "",
          stock: "0",
          isAvailable: true,
          sku: "",
          lowStock: "",
        };
        const stock = Math.max(0, Math.floor(Number(row.stock) || 0));
        const pt = row.price?.trim() ?? "";
        let price: number | null = null;
        if (pt !== "") {
          const n = Number(pt);
          if (!Number.isFinite(n) || n < 0) {
            throw new Error(`Invalid price for size ${size}`);
          }
          price = n;
        }
        const lt = row.lowStock?.trim() ?? "";
        let lowStockThreshold: number | null = null;
        if (lt !== "") {
          const n = parseInt(lt, 10);
          if (Number.isFinite(n) && n >= 0) lowStockThreshold = n;
        }
        return {
          size,
          price,
          stock,
          isAvailable: row.isAvailable,
          sku: row.sku.trim() || null,
          lowStockThreshold,
          active: true,
        };
      });
      return replaceVariantStock(productId, colorId, items);
    },
    onSuccess: () => {
      toast.success("Stock saved");
      qc.invalidateQueries({ queryKey: ["productDetail", productId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!productId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Invalid product link.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {p?.name ?? "Product"}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{productId}</p>
        </div>
      </div>

      {detailQuery.isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading product…
        </div>
      )}
      {detailQuery.error && (
        <p className="text-destructive text-sm">
          {(detailQuery.error as Error).message}
        </p>
      )}

      {p && (
        <>
          <Card className="card-shadow border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Product details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe-name">Name</Label>
                  <Input
                    id="pe-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pe-desc">Description</Label>
                  <Textarea
                    id="pe-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe-fabric">Fabric</Label>
                  <Input
                    id="pe-fabric"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe-occ">Occasions (comma-separated)</Label>
                  <Input
                    id="pe-occ"
                    value={occasionsStr}
                    onChange={(e) => setOccasionsStr(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe-price">Base price</Label>
                  <Input
                    id="pe-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe-cur">Currency</Label>
                  <Input
                    id="pe-cur"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pe-sizes">
                    Allowed sizes (comma-separated)
                  </Label>
                  <Input
                    id="pe-sizes"
                    value={allowedSizesStr}
                    onChange={(e) => setAllowedSizesStr(e.target.value)}
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe-sort">Sort order</Label>
                  <Input
                    id="pe-sort"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 h-fit self-end">
                  <Label htmlFor="pe-active">Active</Label>
                  <Switch
                    id="pe-active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                </div>
              </div>
              <Button
                onClick={() => updateProductMutation.mutate()}
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Save product
              </Button>
            </CardContent>
          </Card>

          <Card className="card-shadow border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Colors &amp; images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {colors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No colors yet. Add each color with an image URL (e.g. a
                  Cloudinary{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    https://
                  </code>{" "}
                  link).
                </p>
              ) : (
                colors.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-border p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex gap-4 min-w-0 flex-1">
                        <div className="h-28 w-28 shrink-0 rounded-md border border-border bg-muted overflow-hidden">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground px-1 text-center">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="font-medium">{c.colorName}</p>
                          <p
                            className="text-xs text-muted-foreground font-mono truncate"
                            title={c.id}
                          >
                            {c.id}
                          </p>
                          {c.imageUrl ? (
                            <a
                              href={c.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-block truncate max-w-[min(100%,280px)]"
                              title={c.imageUrl}
                            >
                              Open full size
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setColorEditingId(c.id);
                            setCn(c.colorName);
                            setCnEn(c.colorNameEn);
                            setCImg(c.imageUrl);
                            setCActive(c.active);
                            setCSort(String(c.sortOrder));
                            setColorDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (
                              confirm(
                                "Delete this color and all its stock rows?",
                              )
                            ) {
                              deleteColorMutation.mutate({ colorId: c.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Collapsible
                      open={stockOpenId === c.id}
                      onOpenChange={(open) => {
                        setStockOpenId(open ? c.id : null);
                        if (open) syncStockDraft(c);
                      }}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="secondary" size="sm" className="gap-2">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${stockOpenId === c.id ? "rotate-180" : ""}`}
                          />
                          Stock by size
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4 space-y-3">
                        {allowedSizes.length === 0 ? (
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            Set allowed sizes on the product above, then save
                            the product, before editing stock.
                          </p>
                        ) : (
                          <>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {allowedSizes.map((size) => {
                                const row = stockDrafts[c.id]?.[size] ?? {
                                  price: "",
                                  stock: "0",
                                  isAvailable: true,
                                  sku: "",
                                  lowStock: "",
                                };
                                return (
                                  <div
                                    key={size}
                                    className="rounded-md border border-border/80 p-3 space-y-2"
                                  >
                                    <p className="text-sm font-medium">
                                      {size}
                                    </p>
                                    <div className="flex gap-2 items-center">
                                      <Label className="text-xs w-20 shrink-0">
                                        Price
                                      </Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className="h-8"
                                        placeholder={basePrice.trim() || "Base"}
                                        value={row.price}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          setStockDrafts((prev) => ({
                                            ...prev,
                                            [c.id]: {
                                              ...(prev[c.id] ?? {}),
                                              [size]: { ...row, price: v },
                                            },
                                          }));
                                        }}
                                      />
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <Label className="text-xs w-14">
                                        Stock
                                      </Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        className="h-8"
                                        value={row.stock}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          setStockDrafts((prev) => ({
                                            ...prev,
                                            [c.id]: {
                                              ...(prev[c.id] ?? {}),
                                              [size]: { ...row, stock: v },
                                            },
                                          }));
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <Label className="text-xs">
                                        Available
                                      </Label>
                                      <Switch
                                        checked={row.isAvailable}
                                        onCheckedChange={(checked) => {
                                          setStockDrafts((prev) => ({
                                            ...prev,
                                            [c.id]: {
                                              ...(prev[c.id] ?? {}),
                                              [size]: {
                                                ...row,
                                                isAvailable: checked,
                                              },
                                            },
                                          }));
                                        }}
                                      />
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <Label className="text-xs w-14">
                                        SKU
                                      </Label>
                                      <Input
                                        className="h-8"
                                        value={row.sku}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          setStockDrafts((prev) => ({
                                            ...prev,
                                            [c.id]: {
                                              ...(prev[c.id] ?? {}),
                                              [size]: { ...row, sku: v },
                                            },
                                          }));
                                        }}
                                      />
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <Label className="text-xs shrink-0 w-24">
                                        Low stock
                                      </Label>
                                      <Input
                                        className="h-8"
                                        type="number"
                                        min={0}
                                        placeholder="—"
                                        value={row.lowStock}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          setStockDrafts((prev) => ({
                                            ...prev,
                                            [c.id]: {
                                              ...(prev[c.id] ?? {}),
                                              [size]: { ...row, lowStock: v },
                                            },
                                          }));
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => saveStockMutation.mutate(c.id)}
                              disabled={saveStockMutation.isPending}
                            >
                              {saveStockMutation.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              )}
                              Save stock for this color
                            </Button>
                          </>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))
              )}
              <div
                className={`flex justify-center pt-4 ${colors.length > 0 ? "border-t border-border/60 mt-2" : ""}`}
              >
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setColorEditingId(null);
                    setCn("");
                    setCnEn("");
                    setCImg("");
                    setCActive(true);
                    setCSort("0");
                    setColorDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add color
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog
        open={colorDialog}
        onOpenChange={(open) => {
          setColorDialog(open);
          if (!open) setColorEditingId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {colorEditingId ? "Edit color" : "Add color"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Color name (display)</Label>
              <Input value={cn} onChange={(e) => setCn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Color name (English, optional)</Label>
              <Input value={cnEn} onChange={(e) => setCnEn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={cImg}
                onChange={(e) => setCImg(e.target.value)}
                placeholder="https://res.cloudinary.com/…/image/upload/…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-sort">Sort order</Label>
              <Input
                id="c-sort"
                type="number"
                min={0}
                value={cSort}
                onChange={(e) => setCSort(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="c-active">Active</Label>
              <Switch
                id="c-active"
                checked={cActive}
                onCheckedChange={setCActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setColorDialog(false);
                setColorEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveColorMutation.mutate()}
              disabled={saveColorMutation.isPending}
            >
              {saveColorMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {colorEditingId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
