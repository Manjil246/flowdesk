import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createProductFull,
  fetchCategories,
  fetchColorPresets,
  uploadCatalogImageToCloudinary,
} from "@/lib/api/catalog";
import type { ColorPresetDto } from "@/lib/api/catalog";
import { DEFAULT_SELECTED_SIZES, PRESET_SIZES } from "@/lib/product-sizes";
import {
  colorNameMatches,
  isValidHexCode,
  normalizeHexCode,
} from "@/lib/color-utils";
import { ColorVariantPicker } from "@/components/catalog/ColorVariantPicker";
import { LockedColorDisplay } from "@/components/catalog/LockedColorDisplay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

type ColorDraft = {
  clientKey: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
};

type CellDraft = {
  price: string;
  stock: string;
  isAvailable: boolean;
};

function newColor(hexCode = "#888888"): ColorDraft {
  return {
    clientKey: crypto.randomUUID(),
    colorName: "",
    hexCode,
    imageUrl: "",
  };
}

export default function ProductNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories({ active: "all" }),
  });

  const categoryList = categories ?? [];
  const noCategoriesYet =
    !categoriesLoading && !categoriesError && categoryList.length === 0;

  const { data: colorPresets = [] } = useQuery({
    queryKey: ["colorPresets"],
    queryFn: fetchColorPresets,
  });

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("");
  const [mrp, setMrp] = useState("0");
  const [sellingPrice, setSellingPrice] = useState("0");
  const [currency, setCurrency] = useState("NPR");
  const [sizes, setSizes] = useState<string[]>([...DEFAULT_SELECTED_SIZES]);
  const [customSize, setCustomSize] = useState("");
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(
    String(DEFAULT_DELIVERY_CHARGE),
  );
  const [colors, setColors] = useState<ColorDraft[]>([]);
  const [cells, setCells] = useState<Record<string, CellDraft>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantColorName, setVariantColorName] = useState("");
  const [variantHex, setVariantHex] = useState("#888888");
  const [variantPresetActive, setVariantPresetActive] = useState(false);

  useEffect(() => {
    if (!categoryId && categoryList[0]?.id) {
      setCategoryId(categoryList[0].id);
    }
  }, [categoryList, categoryId]);

  useEffect(() => {
    setCells((prev) => {
      const next = { ...prev };
      const defaultPrice =
        sellingPrice.trim() === "" || Number.isNaN(Number(sellingPrice))
          ? "0"
          : sellingPrice.trim();
      for (const c of colors) {
        for (const s of sizes) {
          const k = `${c.clientKey}::${s}`;
          if (!next[k]) {
            next[k] = {
              price: defaultPrice,
              stock: "0",
              isAvailable: true,
            };
          }
        }
      }
      const valid = new Set(
        colors.flatMap((c) => sizes.map((s) => `${c.clientKey}::${s}`)),
      );
      for (const key of Object.keys(next)) {
        if (!valid.has(key)) delete next[key];
      }
      return next;
    });
  }, [colors, sizes, sellingPrice]);

  const togglePresetSize = (sz: string) => {
    setSizes((prev) => {
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
    if (sizes.includes(s)) {
      toast.message("Size already added");
      return;
    }
    setSizes((prev) => [...prev, s]);
    setCustomSize("");
  };

  const removeSize = (sz: string) => {
    setSizes((prev) => {
      if (prev.length <= 1) {
        toast.error("Keep at least one size");
        return prev;
      }
      return prev.filter((s) => s !== sz);
    });
  };

  const openAddVariantDialog = () => {
    setVariantColorName("");
    setVariantHex("#888888");
    setVariantPresetActive(false);
    setVariantDialogOpen(true);
  };

  const selectVariantPreset = (preset: ColorPresetDto) => {
    setVariantPresetActive(true);
    setVariantColorName(preset.name);
    setVariantHex(normalizeHexCode(preset.hexCode));
  };

  const confirmAddVariant = () => {
    const name = variantColorName.trim();
    if (!name) {
      toast.error("Select a preset or enter a color name");
      return;
    }
    if (!isValidHexCode(variantHex)) {
      toast.error("Enter a valid hex color (#RRGGBB)");
      return;
    }
    const hexCode = normalizeHexCode(variantHex);
    if (colors.some((c) => colorNameMatches(c.colorName, name))) {
      toast.message(`${name} is already added`);
      return;
    }
    setColors((prev) => [
      ...prev,
      { ...newColor(hexCode), colorName: name, hexCode },
    ]);
    setVariantDialogOpen(false);
    setVariantColorName("");
    setVariantHex("#888888");
    setVariantPresetActive(false);
  };

  const removeColor = (clientKey: string) => {
    setColors((prev) => prev.filter((c) => c.clientKey !== clientKey));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!categoryId) throw new Error("Select a category");
      if (!name.trim()) throw new Error("Product name is required");
      const mrpVal = Number(mrp);
      const sp = Number(sellingPrice);
      if (Number.isNaN(mrpVal) || mrpVal < 0) throw new Error("Invalid MRP");
      if (Number.isNaN(sp) || sp < 0) throw new Error("Invalid selling price");
      if (sp > mrpVal) throw new Error("Selling price cannot exceed MRP");
      if (sizes.length === 0) throw new Error("Add at least one size");
      if (colors.length === 0) throw new Error(SAVE_REQUIRES_VARIANT_MSG);
      let deliveryAmount = 0;
      if (!freeDelivery) {
        deliveryAmount = Number(deliveryCharge);
        if (Number.isNaN(deliveryAmount) || deliveryAmount <= 0) {
          throw new Error("Enter a delivery charge greater than 0, or select free delivery");
        }
      }
      for (const c of colors) {
        if (!c.colorName.trim()) throw new Error("Each color needs a name");
        if (!isValidHexCode(c.hexCode)) {
          throw new Error(`Enter a valid hex color for “${c.colorName.trim()}”`);
        }
        if (!c.imageUrl.trim()) throw new Error(`Upload an image for “${c.colorName.trim() || "color"}”`);
      }
      const combinations = colors.flatMap((c) =>
        sizes.map((size) => {
          const k = `${c.clientKey}::${size}`;
          const cell = cells[k] ?? {
            price: String(sp),
            stock: "0",
            isAvailable: true,
          };
          const rowPrice = Number(cell.price);
          if (Number.isNaN(rowPrice) || rowPrice < 0) {
            throw new Error(`Invalid price for ${c.colorName} / ${size}`);
          }
          const stock = Math.max(0, Math.floor(Number(cell.stock) || 0));
          return {
            colorClientKey: c.clientKey,
            size,
            price: rowPrice,
            stock,
            isAvailable: cell.isAvailable,
          };
        }),
      );
      return createProductFull({
        categoryId,
        name: name.trim(),
        description: description.trim(),
        fabric: fabric.trim(),
        mrp: mrpVal,
        sellingPrice: sp,
        currency: currency.trim() || "NPR",
        allowedSizes: sizes,
        freeDelivery,
        deliveryCharge: freeDelivery ? 0 : deliveryAmount,
        active: true,
        colors: colors.map((c) => ({
          clientKey: c.clientKey,
          colorName: c.colorName.trim(),
          hexCode: normalizeHexCode(c.hexCode),
          imageUrl: c.imageUrl.trim(),
          active: true,
        })),
        combinations,
      });
    },
    onSuccess: (detail) => {
      toast.success("Product created");
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate(`/admin/products/${detail.product.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onImageSelected = async (clientKey: string, file: File | null) => {
    if (!file) return;
    setUploadingKey(clientKey);
    try {
      const url = await uploadCatalogImageToCloudinary(file);
      setColors((prev) =>
        prev.map((c) =>
          c.clientKey === clientKey ? { ...c, imageUrl: url } : c,
        ),
      );
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-fit -ml-2 gap-1" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              Products
            </Link>
          </Button>
          <p className="font-body text-sm text-muted-foreground">
            Add sizes and colors, set prices per size for each color, upload one
            image per color (Cloudinary), then save once.
          </p>
        </div>
      </div>

      {categoriesLoading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading categories…
        </p>
      )}

      {categoriesError && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          Could not load categories. Refresh the page or check the API connection.
        </p>
      )}

      {noCategoriesYet && (
        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          Create a category first, then return here.
        </p>
      )}

      <Card className="card-shadow border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pn-name">Name</Label>
              <Input
                id="pn-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Silk kurta"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pn-desc">Description</Label>
            <Textarea
              id="pn-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pn-fabric">Fabric</Label>
              <Input
                id="pn-fabric"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pn-mrp">MRP (रू)</Label>
                <Input
                  id="pn-mrp"
                  type="number"
                  min={0}
                  step="0.01"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pn-sp">Selling price (रू)</Label>
                <Input
                  id="pn-sp"
                  type="number"
                  min={0}
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pn-cur">Currency</Label>
                <Input
                  id="pn-cur"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-border px-4 py-3">
            <Label>Delivery</Label>
            <RadioGroup
              value={freeDelivery ? "free" : "charge"}
              onValueChange={(value) => setFreeDelivery(value === "free")}
              className="gap-3"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="free" id="pn-del-free" />
                <Label htmlFor="pn-del-free" className="font-normal cursor-pointer">
                  Free delivery
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="charge" id="pn-del-charge" />
                <Label htmlFor="pn-del-charge" className="font-normal cursor-pointer">
                  Delivery charge
                </Label>
              </div>
            </RadioGroup>
            {!freeDelivery && (
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="pn-del-amt">Amount ({currency.trim() || "NPR"})</Label>
                <Input
                  id="pn-del-amt"
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
        </CardContent>
      </Card>

      <Card className="card-shadow border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Sizes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_SIZES.map((sz) => (
              <Badge
                key={sz}
                variant={sizes.includes(sz) ? "default" : "outline"}
                className="cursor-pointer gap-1 pr-1 font-normal"
                onClick={() => togglePresetSize(sz)}
              >
                {sz}
                {sizes.includes(sz) && (
                  <X className="h-3 w-3 opacity-70" aria-hidden />
                )}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="pn-csz">Custom size</Label>
              <Input
                id="pn-csz"
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
            <Button type="button" variant="secondary" onClick={addCustomSize}>
              Add size
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active sizes:</span>
            {sizes.map((sz) => (
              <Badge key={sz} variant="secondary" className="gap-1 font-normal">
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium">Colors &amp; variants</h2>
          <Button type="button" variant="secondary" className="gap-2" onClick={openAddVariantDialog}>
            <Plus className="h-4 w-4" />
            Add color variant
          </Button>
        </div>

      {colors.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
          No variants yet. Click &ldquo;Add color variant&rdquo; to pick a color, then upload a photo for each one.
        </p>
      ) : (
        <div className="space-y-6">
          {colors.map((c) => (
            <Card key={c.clientKey} className="card-shadow border-border/60">
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                <LockedColorDisplay colorName={c.colorName} hexCode={c.hexCode} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() => removeColor(c.clientKey)}
                  aria-label={`Remove ${c.colorName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                  <div className="space-y-2">
                    <Label htmlFor={`img-${c.clientKey}`}>Image (this color)</Label>
                    <Input
                      id={`img-${c.clientKey}`}
                      type="file"
                      accept="image/*"
                      disabled={uploadingKey === c.clientKey}
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        void onImageSelected(c.clientKey, f);
                        e.target.value = "";
                      }}
                    />
                    {uploadingKey === c.clientKey && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading…
                      </p>
                    )}
                  </div>
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="h-24 w-24 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-md border border-dashed border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground text-center px-1">
                      No image
                    </div>
                  )}
                </div>

                <div className="rounded-md border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Size</TableHead>
                        <TableHead>Price ({currency.trim() || "NPR"})</TableHead>
                        <TableHead className="w-[120px]">Stock</TableHead>
                        <TableHead className="w-[100px] text-center">
                          Offered
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sizes.map((size) => {
                        const k = `${c.clientKey}::${size}`;
                        const row = cells[k] ?? {
                          price: sellingPrice,
                          stock: "0",
                          isAvailable: true,
                        };
                        return (
                          <TableRow key={size}>
                            <TableCell className="font-medium">{size}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                className="h-8 max-w-[140px]"
                                value={row.price}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setCells((prev) => ({
                                    ...prev,
                                    [k]: { ...row, price: v },
                                  }));
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                className="h-8 max-w-[100px]"
                                value={row.stock}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setCells((prev) => ({
                                    ...prev,
                                    [k]: { ...row, stock: v },
                                  }));
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={row.isAvailable}
                                onCheckedChange={(checked) => {
                                  setCells((prev) => ({
                                    ...prev,
                                    [k]: { ...row, isAvailable: checked },
                                  }));
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      <div className="flex flex-col items-end gap-2 pt-2">
        {colors.length === 0 && (
          <p className="text-sm text-muted-foreground">{SAVE_REQUIRES_VARIANT_MSG}</p>
        )}
        <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" asChild>
          <Link to="/admin/products">Cancel</Link>
        </Button>
        <Button
          onClick={() => {
            if (colors.length === 0) {
              toast.error(SAVE_REQUIRES_VARIANT_MSG);
              return;
            }
            saveMutation.mutate();
          }}
          disabled={
            saveMutation.isPending ||
            categoriesLoading ||
            noCategoriesYet ||
            colors.length === 0
          }
        >
          {saveMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Save product
        </Button>
        </div>
      </div>

      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add color variant</DialogTitle>
          </DialogHeader>
          <ColorVariantPicker
            presets={colorPresets}
            usedColorNames={colors.map((c) => c.colorName)}
            colorName={variantColorName}
            hexCode={variantHex}
            presetActive={variantPresetActive}
            onPresetSelect={selectVariantPreset}
            onCustomColorNameChange={(value) => {
              setVariantPresetActive(false);
              setVariantColorName(value);
            }}
            onCustomHexChange={(value) => {
              setVariantPresetActive(false);
              setVariantHex(value);
            }}
            nameId="pn-variant-color-name"
            hexId="pn-variant-color-hex"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddVariant}>Add variant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

