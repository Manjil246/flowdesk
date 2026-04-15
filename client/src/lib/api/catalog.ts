const base = () =>
  (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function parseErr(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  const errObj = data.error;
  if (
    errObj &&
    typeof errObj === "object" &&
    "message" in errObj &&
    typeof (errObj as { message: unknown }).message === "string"
  ) {
    return (errObj as { message: string }).message;
  }
  return `HTTP ${res.status}`;
}

export type CategoryDto = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductDto = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  occasions: string[];
  fabric: string;
  basePrice: number;
  currency: string;
  allowedSizes: string[];
  active: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductColorDto = {
  id: string;
  productId: string;
  colorName: string;
  colorNameEn: string;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type VariantStockDto = {
  id: string;
  variantId: string;
  productId: string;
  size: string;
  /** `null` = inherit product base price. */
  price: number | null;
  stock: number;
  isAvailable: boolean;
  lowStockThreshold: number | null;
  sku: string | null;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductColorWithStockDto = ProductColorDto & {
  stock: VariantStockDto[];
};

export type ProductDetailDto = {
  product: ProductDto;
  colors: ProductColorWithStockDto[];
};

export async function fetchCategories(params?: {
  active?: "true" | "false" | "all";
}): Promise<CategoryDto[]> {
  const q = new URLSearchParams();
  if (params?.active) q.set("active", params.active);
  const url = `${base()}/api/v1/categories${q.toString() ? `?${q}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { categories: CategoryDto[] };
  return data.categories ?? [];
}

export async function createCategory(body: {
  name: string;
  description?: string;
  active?: boolean;
}): Promise<CategoryDto> {
  const res = await fetch(`${base()}/api/v1/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { category: CategoryDto };
  return data.category;
}

export async function updateCategory(
  id: string,
  body: Partial<{
    name: string;
    description: string;
    active: boolean;
  }>,
): Promise<CategoryDto> {
  const res = await fetch(
    `${base()}/api/v1/categories/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { category: CategoryDto };
  return data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(
    `${base()}/api/v1/categories/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(await parseErr(res));
}

export async function fetchProducts(params?: {
  categoryId?: string;
  active?: "true" | "false" | "all";
  search?: string;
}): Promise<ProductDto[]> {
  const q = new URLSearchParams();
  if (params?.categoryId) q.set("categoryId", params.categoryId);
  if (params?.active) q.set("active", params.active);
  if (params?.search?.trim()) q.set("search", params.search.trim());
  const url = `${base()}/api/v1/products${q.toString() ? `?${q}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { products: ProductDto[] };
  return data.products ?? [];
}

export async function fetchProductDetail(
  productId: string,
): Promise<ProductDetailDto> {
  const res = await fetch(
    `${base()}/api/v1/products/${encodeURIComponent(productId)}/detail`,
  );
  if (!res.ok) throw new Error(await parseErr(res));
  return (await res.json()) as ProductDetailDto;
}

export type CloudinaryCatalogSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
};

export async function fetchCloudinaryCatalogSignature(): Promise<CloudinaryCatalogSignature> {
  const res = await fetch(
    `${base()}/api/v1/uploads/cloudinary/catalog-image`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(await parseErr(res));
  return (await res.json()) as CloudinaryCatalogSignature;
}

/** Request signed params, then POST multipart to Cloudinary; returns HTTPS URL. */
export async function uploadCatalogImageToCloudinary(
  file: File,
): Promise<string> {
  const sig = await fetchCloudinaryCatalogSignature();
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("signature", sig.signature);
  fd.append("folder", sig.folder);
  fd.append("public_id", sig.publicId);
  const res = await fetch(sig.uploadUrl, { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err =
      typeof data.error === "object" &&
      data.error &&
      "message" in data.error &&
      typeof (data.error as { message: unknown }).message === "string"
        ? (data.error as { message: string }).message
        : typeof data.error === "string"
          ? data.error
          : `Upload failed (${res.status})`;
    throw new Error(err);
  }
  const url = data.secure_url;
  if (typeof url !== "string" || !url)
    throw new Error("Cloudinary response missing secure_url");
  return url;
}

export type ProductCreateFullPayload = {
  categoryId: string;
  name: string;
  description?: string;
  occasions?: string[];
  fabric?: string;
  basePrice: number;
  currency?: string;
  allowedSizes: string[];
  active?: boolean;
  sortOrder?: number;
  colors: Array<{
    clientKey: string;
    colorName: string;
    colorNameEn?: string;
    imageUrl: string;
    active?: boolean;
  }>;
  combinations: Array<{
    colorClientKey: string;
    size: string;
    price: number;
    stock?: number;
    isAvailable?: boolean;
    lowStockThreshold?: number | null;
    sku?: string | null;
    active?: boolean;
  }>;
};

export async function createProductFull(
  body: ProductCreateFullPayload,
): Promise<ProductDetailDto> {
  const res = await fetch(`${base()}/api/v1/products/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErr(res));
  return (await res.json()) as ProductDetailDto;
}

export async function createProduct(body: {
  categoryId: string;
  name: string;
  description?: string;
  occasions?: string[];
  fabric?: string;
  basePrice: number;
  currency?: string;
  allowedSizes?: string[];
  active?: boolean;
  sortOrder?: number;
}): Promise<ProductDto> {
  const res = await fetch(`${base()}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { product: ProductDto };
  return data.product;
}

export async function updateProduct(
  id: string,
  body: Partial<{
    categoryId: string;
    name: string;
    description: string;
    occasions: string[];
    fabric: string;
    basePrice: number;
    currency: string;
    allowedSizes: string[];
    active: boolean;
    sortOrder: number;
  }>,
): Promise<ProductDto> {
  const res = await fetch(
    `${base()}/api/v1/products/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { product: ProductDto };
  return data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${base()}/api/v1/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await parseErr(res));
}

export async function deleteProductColor(
  productId: string,
  colorId: string,
): Promise<void> {
  const res = await fetch(
    `${base()}/api/v1/products/${encodeURIComponent(productId)}/colors/${encodeURIComponent(colorId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(await parseErr(res));
}

export async function createProductColor(
  productId: string,
  body: {
    colorName: string;
    colorNameEn?: string;
    imageUrl: string;
    active?: boolean;
    sortOrder?: number;
  },
): Promise<ProductColorDto> {
  const res = await fetch(
    `${base()}/api/v1/products/${encodeURIComponent(productId)}/colors`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { color: ProductColorDto };
  return data.color;
}

export async function updateProductColor(
  productId: string,
  colorId: string,
  body: Partial<{
    colorName: string;
    colorNameEn: string;
    imageUrl: string;
    active: boolean;
    sortOrder: number;
  }>,
): Promise<ProductColorDto> {
  const res = await fetch(
    `${base()}/api/v1/products/${encodeURIComponent(productId)}/colors/${encodeURIComponent(colorId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { color: ProductColorDto };
  return data.color;
}

export async function replaceVariantStock(
  productId: string,
  colorId: string,
  items: Array<{
    size: string;
    price?: number | null;
    stock: number;
    isAvailable: boolean;
    lowStockThreshold?: number | null;
    sku?: string | null;
    active?: boolean;
  }>,
): Promise<VariantStockDto[]> {
  const res = await fetch(
    `${base()}/api/v1/products/${encodeURIComponent(productId)}/colors/${encodeURIComponent(colorId)}/stock`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    },
  );
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { stock: VariantStockDto[] };
  return data.stock ?? [];
}
