import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createProductColor,
  deleteProductColor,
  fetchCategories,
  fetchColorPresets,
  fetchProductDetail,
  replaceVariantStock,
  updateProduct,
  updateProductColor,
  uploadCatalogImageToCloudinary,
  type ProductColorWithStockDto,
  type VariantStockDto,
  type ColorPresetDto,
} from "@/lib/api/catalog";
import { DEFAULT_SELECTED_SIZES, PRESET_SIZES } from "@/lib/product-sizes";
import {
  colorNameMatches,
  isValidHexCode,
  normalizeHexCode,
} from "@/lib/color-utils";
import { ColorVariantPicker } from "@/components/catalog/ColorVariantPicker";
import { LockedColorDisplay } from "@/components/catalog/LockedColorDisplay";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_DELIVERY_CHARGE = 150;
const SAVE_REQUIRES_VARIANT_MSG =
  "Please add at least one color variant to save the product.";

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

  const { data: colorPresets = [] } = useQuery({
    queryKey: ["colorPresets"],
    queryFn: fetchColorPresets,
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
  const [mrp, setMrp] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currency, setCurrency] = useState("NPR");
  const [allowedSizes, setAllowedSizes] = useState<string[]>([
    ...DEFAULT_SELECTED_SIZES,
  ]);
  const [customSize, setCustomSize] = useState("");
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(
    String(DEFAULT_DELIVERY_CHARGE),
  );
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (!p) return;
    setName(p.name);
    setDescription(p.description);
    setFabric(p.fabric);
    setOccasionsStr(p.occasions.join(", "));
    setMrp(String(p.mrp));
    setSellingPrice(String(p.sellingPrice));
    setCurrency(p.currency);
    setAllowedSizes(
      p.allowedSizes.length > 0 ? [...p.allowedSizes] : [...DEFAULT_SELECTED_SIZES],
    );
    setFreeDelivery(p.freeDelivery);
    setDeliveryCharge(
      p.freeDelivery
        ? String(DEFAULT_DELIVERY_CHARGE)
        : String(p.deliveryCharge || DEFAULT_DELIVERY_CHARGE),
    );
    setCategoryId(p.categoryId);
    setActive(p.active);
    setSortOrder(String(p.sortOrder));
  }, [p]);

  const togglePresetSize = (sz: string) => {
    setAllowedSizes((prev) => {
      if (prev.includes(sz)) {
        if (prev.length <= 1) {
          toast.error("Keep at least one size");
          return prev;
        }
        return prev.filter((s) => s !== sz);
      }
      const rank = (s: string) => {
        const i = (PRESET_SIZES as readonly string[]).indexOf(s);
        return i === -1 ? 100 + s.charCodeAt(0) : i;
      };
      return [...prev, sz].sort((a, b) => {
        const d = rank(a) - rank(b);
        return d !== 0 ? d : a.localeCompare(b);
      });
    });
  };

  const addCustomSize = () => {
    const s = customSize.trim();
    if (!s) return;
    if (allowedSizes.includes(s)) {
      toast.message("Size already added");
      return;
    }
    setAllowedSizes((prev) => [...prev, s]);
    setCustomSize("");
  };

  const removeSize = (sz: string) => {
    setAllowedSizes((prev) => {
      if (prev.length <= 1) {
        toast.error("Keep at least one size");
        return prev;
      }
      return prev.filter((s) => s !== sz);
    });
  };

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
      const mrpVal = Number(mrp);
      const sp = Number(sellingPrice);
      if (Number.isNaN(mrpVal) || mrpVal < 0) throw new Error("Invalid MRP");
      if (Number.isNaN(sp) || sp < 0) throw new Error("Invalid selling price");
      if (sp > mrpVal) throw new Error("Selling price cannot exceed MRP");
      const occasions = occasionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      let deliveryAmount = 0;
      if (!freeDelivery) {
        deliveryAmount = Number(deliveryCharge);
        if (Number.isNaN(deliveryAmount) || deliveryAmount <= 0) {
          throw new Error(
            "Enter a delivery charge greater than 0, or select free delivery",
          );
        }
      }
      if (colors.length === 0) throw new Error(SAVE_REQUIRES_VARIANT_MSG);
      return updateProduct(productId, {
        categoryId,
        name: name.trim(),
        description: description.trim(),
        fabric: fabric.trim(),
        occasions,
        mrp: mrpVal,
        sellingPrice: sp,
        currency: currency.trim() || "NPR",
        allowedSizes,
        freeDelivery,
        deliveryCharge: freeDelivery ? 0 : deliveryAmount,
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
  const [variantPresetActive, setVariantPresetActive] = useState(false);
  const [cn, setCn] = useState("");
  const [cHex, setCHex] = useState("#888888");
  const [cImg, setCImg] = useState("");
  const [cActive, setCActive] = useState(true);
  const [cSort, setCSort] = useState("0");
  const [uploadingColorId, setUploadingColorId] = useState<string | null>(null);

  const uploadColorImage = async (
    file: File | null,
    onUrl: (url: string) => void,
    uploadKey: string,
  ) => {
    if (!file) return;
    setUploadingColorId(uploadKey);
    try {
      const url = await uploadCatalogImageToCloudinary(file);
      onUrl(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingColorId(null);
    }
  };

  const replaceColorImageMutation = useMutation({
    mutationFn: async ({
      colorId,
      file,
    }: {
      colorId: string;
      file: File;
    }) => {
      if (!productId) throw new Error("Missing product");
      setUploadingColorId(colorId);
      const url = await uploadCatalogImageToCloudinary(file);
      return updateProductColor(productId, colorId, { imageUrl: url });
    },
    onSuccess: () => {
      toast.success("Image updated");
      qc.invalidateQueries({ queryKey: ["productDetail", productId] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setUploadingColorId(null),
  });

  const openAddVariantDialog = () => {
    setColorEditingId(null);
    setVariantPresetActive(false);
    setCn("");
    setCHex("#888888");
    setCImg("");
    setCActive(true);
    setCSort("0");
    setColorDialog(true);
  };

  const selectVariantPreset = (preset: ColorPresetDto) => {
    setVariantPresetActive(true);
    setCn(preset.name);
    setCHex(normalizeHexCode(preset.hexCode));
  };

  const openEditColorDialog = (color: ProductColorWithStockDto) => {
    setColorEditingId(color.id);
    setVariantPresetActive(false);
    setCn(color.colorName);
    setCHex(color.hexCode || "#888888");
    setCImg(color.imageUrl);
    setCActive(color.active);
    setCSort(String(color.sortOrder));
    setColorDialog(true);
  };

  const saveColorMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error("Missing product");
      if (!cn.trim() || !cImg.trim()) {
        throw new Error("Color name and image are required");
      }
      if (!isValidHexCode(cHex)) {
        throw new Error("Invalid color hex");
      }
      if (
        !colorEditingId &&
        colors.some((c) => colorNameMatches(c.colorName, cn))
      ) {
        throw new Error("This color is already on the product");
      }
      const hexCode = normalizeHexCode(cHex);
      const sortOrder = Number(cSort) || 0;
      if (colorEditingId) {
        return updateProductColor(productId, colorEditingId, {
          imageUrl: cImg.trim(),
          active: cActive,
          sortOrder,
        });
      }
      return createProductColor(productId, {
        colorName: cn.trim(),
        hexCode,
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
      setVariantPresetActive(false);
      setCn("");
      setCHex("#888888");
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="admin-display-title text-2xl tracking-tight">
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
                  <Label htmlFor="pe-mrp">MRP (रू)</Label>
                  <Input
                    id="pe-mrp"
                    type="number"
                    min={0}
                    step="0.01"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pe-sp">Selling price (रू)</Label>
                  <Input
                    id="pe-sp"
                    type="number"
                    min={0}
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
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
                <div className="space-y-3 sm:col-span-2 rounded-lg border border-border px-4 py-3">
                  <Label>Delivery</Label>
                  <RadioGroup
                    value={freeDelivery ? "free" : "charge"}
                    onValueChange={(value) => setFreeDelivery(value === "free")}
                    className="gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="free" id="pe-del-free" />
                      <Label
                        htmlFor="pe-del-free"
                        className="font-normal cursor-pointer"
                      >
                        Free delivery
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="charge" id="pe-del-charge" />
                      <Label
                        htmlFor="pe-del-charge"
                        className="font-normal cursor-pointer"
                      >
                        Delivery charge
                      </Label>
                    </div>
                  </RadioGroup>
                  {!freeDelivery && (
                    <div className="space-y-2 max-w-xs">
                      <Label htmlFor="pe-del-amt">
                        Amount ({currency.trim() || "NPR"})
                      </Label>
                      <Input
                        id="pe-del-amt"
                        type="number"
                        min={0}
                        step="0.01"
                        value={deliveryCharge}
                        onChange={(e) => setDeliveryCharge(e.target.value)}
                        placeholder={String(DEFAULT_DELIVERY_CHARGE)}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Label>Allowed sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_SIZES.map((sz) => (
                      <Badge
                        key={sz}
                        variant={
                          allowedSizes.includes(sz) ? "default" : "outline"
                        }
                        className="cursor-pointer gap-1 pr-1 font-normal"
                        onClick={() => togglePresetSize(sz)}
                      >
                        {sz}
                        {allowedSizes.includes(sz) && (
                          <X className="h-3 w-3 opacity-70" aria-hidden />
                        )}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="pe-csz">Custom size</Label>
                      <Input
                        id="pe-csz"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="e.g. 3XL"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomSize();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addCustomSize}
                    >
                      Add size
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">
                      Active sizes:
                    </span>
                    {allowedSizes.map((sz) => (
                      <Badge
                        key={sz}
                        variant="secondary"
                        className="gap-1 font-normal"
                      >
                        {sz}
                        <button
                          type="button"
                          className="rounded-sm hover:bg-muted-foreground/20 p-0.5"
                          aria-label={`Remove ${sz}`}
                          onClick={() => removeSize(sz)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
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
              {colors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {SAVE_REQUIRES_VARIANT_MSG}
                </p>
              )}
              <Button
                onClick={() => {
                  if (colors.length === 0) {
                    toast.error(SAVE_REQUIRES_VARIANT_MSG);
                    return;
                  }
                  updateProductMutation.mutate();
                }}
                disabled={updateProductMutation.isPending || colors.length === 0}
              >
                {updateProductMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Save product
              </Button>
            </CardContent>
          </Card>

          <Card className="card-shadow border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-3">
              <CardTitle className="text-base">Colors &amp; images</CardTitle>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2 shrink-0"
                onClick={openAddVariantDialog}
              >
                <Plus className="h-4 w-4" />
                Add color variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {colors.length === 0 ? (
                <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
                  No variants yet. Click &ldquo;Add color variant&rdquo; to pick a color and upload its image.
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
                        <div className="min-w-0 space-y-2">
                          <LockedColorDisplay
                            colorName={c.colorName}
                            hexCode={c.hexCode}
                            size="sm"
                          />
                          <div className="space-y-1">
                            <Label htmlFor={`replace-img-${c.id}`}>
                              Replace image
                            </Label>
                            <Input
                              id={`replace-img-${c.id}`}
                              type="file"
                              accept="image/*"
                              className="max-w-xs"
                              disabled={uploadingColorId === c.id}
                              onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                if (f) {
                                  replaceColorImageMutation.mutate({
                                    colorId: c.id,
                                    file: f,
                                  });
                                }
                                e.target.value = "";
                              }}
                            />
                            {uploadingColorId === c.id ? (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Uploading…
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditColorDialog(c)}
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
                                        placeholder={
                                          sellingPrice.trim() || "Default"
                                        }
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
            </CardContent>
          </Card>
        </>
      )}

      <Dialog
        open={colorDialog}
        onOpenChange={(open) => {
          setColorDialog(open);
          if (!open) {
            setColorEditingId(null);
            setVariantPresetActive(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {colorEditingId ? "Edit color variant" : "Add color variant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {colorEditingId ? (
              <>
                <LockedColorDisplay colorName={cn || "—"} hexCode={cHex} />
                <p className="text-xs text-muted-foreground">
                  Color name and hex are fixed. Delete this variant and add again to change.
                </p>
              </>
            ) : (
              <ColorVariantPicker
                presets={colorPresets}
                usedColorNames={colors.map((c) => c.colorName)}
                colorName={cn}
                hexCode={cHex}
                presetActive={variantPresetActive}
                onPresetSelect={selectVariantPreset}
                onCustomColorNameChange={(value) => {
                  setVariantPresetActive(false);
                  setCn(value);
                }}
                onCustomHexChange={(value) => {
                  setVariantPresetActive(false);
                  setCHex(value);
                }}
                nameId="pe-variant-color-name"
                hexId="pe-variant-color-hex"
              />
            )}
            <div className="space-y-2">
              <Label htmlFor="pe-variant-image">
                {colorEditingId ? "Replace image" : "Image (this color)"}
              </Label>
              <Input
                id="pe-variant-image"
                type="file"
                accept="image/*"
                disabled={uploadingColorId === "dialog"}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  void uploadColorImage(f, setCImg, "dialog");
                  e.target.value = "";
                }}
              />
              {uploadingColorId === "dialog" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading…
                </p>
              )}
              {cImg ? (
                <img
                  src={cImg}
                  alt=""
                  className="h-24 w-24 rounded-md object-cover border border-border"
                />
              ) : (
                <div className="h-24 w-24 rounded-md border border-dashed border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground text-center px-1">
                  No image yet
                </div>
              )}
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
                setVariantPresetActive(false);
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
              {colorEditingId ? "Save" : "Add variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
