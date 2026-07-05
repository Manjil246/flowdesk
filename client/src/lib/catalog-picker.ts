import { apiBaseUrl } from "@/lib/api/base";

const base = apiBaseUrl;

export type ProductPickerOption = {
  id: string;
  name: string;
  sellingPrice: number;
  mrp: number;
  currency: string;
  imageUrl: string;
  sortOrder: number;
};

type ProductPickerDto = {
  id: string;
  name: string;
  sellingPrice: number;
  mrp: number;
  currency: string;
  thumbnailUrl: string;
  sortOrder: number;
};

/** One lightweight call: product names, prices, and thumbnail for the picker dropdown. */
export async function fetchProductPickerOptions(): Promise<ProductPickerOption[]> {
  const res = await fetch(`${base()}/api/v1/products/picker?active=true`);
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || `Failed to load products (${res.status})`);
  }
  const data = (await res.json()) as { products: ProductPickerDto[] };
  return (data.products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    sellingPrice: p.sellingPrice,
    mrp: p.mrp,
    currency: p.currency,
    imageUrl: p.thumbnailUrl,
    sortOrder: p.sortOrder,
  }));
}
