import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createProductFull,
  fetchCategories,
  uploadCatalogImageToCloudinary,
} from "@/lib/api/catalog";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

type ColorDraft = {
  clientKey: string;
  colorName: string;
  imageUrl: string;
};

type CellDraft = {
  price: string;
  stock: string;
  isAvailable: boolean;
};

function newColor(): ColorDraft {
  return {
    clientKey: crypto.randomUUID(),
    colorName: "",
    imageUrl: "",
  };
}

export default function ProductNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories({ active: "all" }),
  });

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("");
  const [basePrice, setBasePrice] = useState("0");
  const [currency, setCurrency] = useState("NPR");
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [customSize, setCustomSize] = useState("");
  const [colors, setColors] = useState<ColorDraft[]>([]);
  const [cells, setCells] = useState<Record<string, CellDraft>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId && categories[0]?.id) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    setCells((prev) => {
      const next = { ...prev };
      const defaultPrice =
        basePrice.trim() === "" || Number.isNaN(Number(basePrice))
          ? "0"
          : basePrice.trim();
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
  }, [colors, sizes, basePrice]);

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!categoryId) throw new Error("Select a category");
      if (!name.trim()) throw new Error("Product name is required");
      const bp = Number(basePrice);
      if (Number.isNaN(bp) || bp < 0) throw new Error("Invalid base price");
      if (sizes.length === 0) throw new Error("Add at least one size");
      if (colors.length === 0) throw new Error("Add at least one color");
      for (const c of colors) {
        if (!c.colorName.trim()) throw new Error("Each color needs a name");
        if (!c.imageUrl.trim()) throw new Error(`Upload an image for “${c.colorName.trim() || "color"}”`);
      }
      const combinations = colors.flatMap((c) =>
        sizes.map((size) => {
          const k = `${c.clientKey}::${size}`;
          const cell = cells[k] ?? {
            price: String(bp),
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
        basePrice: bp,
        currency: currency.trim() || "NPR",
        allowedSizes: sizes,
        active: true,
        colors: colors.map((c) => ({
          clientKey: c.clientKey,
          colorName: c.colorName.trim(),
          colorNameEn: "",
          imageUrl: c.imageUrl.trim(),
          active: true,
        })),
        combinations,
      });
    },
    onSuccess: (detail) => {
      toast.success("Product created");
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate(`/products/${detail.product.id}`);
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
    <div className="space-y-6 p-4 md:p-6 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-fit -ml-2 gap-1" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
              Products
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
          <p className="text-sm text-muted-foreground">
            Add sizes and colors, set prices per size for each color, upload one
            image per color (Cloudinary), then save once.
          </p>
        </div>
      </div>

      {categories.length === 0 && (
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
                  {categories.map((c) => (
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pn-bp">Base price</Label>
                <Input
                  id="pn-bp"
                  type="number"
                  min={0}
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
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
                placeholder="e.g. Free size"
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
        <h2 className="text-lg font-medium">Colors &amp; variants</h2>

      {colors.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
          No colors yet. Use the button below to add each shade and its photo.
        </p>
      ) : (
        <div className="space-y-6">
          {colors.map((c, idx) => (
            <Card key={c.clientKey} className="card-shadow border-border/60">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label>Color name</Label>
                  <Input
                    value={c.colorName}
                    onChange={(e) =>
                      setColors((prev) =>
                        prev.map((x) =>
                          x.clientKey === c.clientKey
                            ? { ...x, colorName: e.target.value }
                            : x,
                        ),
                      )
                    }
                    placeholder={`Color ${idx + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() =>
                    setColors((prev) =>
                      prev.filter((x) => x.clientKey !== c.clientKey),
                    )
                  }
                  aria-label="Remove color"
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
                          price: basePrice,
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

        <div
          className={`flex justify-center pt-4 ${colors.length > 0 ? "border-t border-border/60" : ""}`}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setColors((prev) => [...prev, newColor()])}
          >
            <Plus className="h-4 w-4" />
            Add color
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-end pt-2">
        <Button variant="outline" asChild>
          <Link to="/products">Cancel</Link>
        </Button>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || categories.length === 0}
        >
          {saveMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Save product
        </Button>
      </div>
    </div>
  );
}
