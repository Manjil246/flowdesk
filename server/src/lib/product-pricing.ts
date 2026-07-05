import type { ProductLean } from "../repositories/product.repository";

/** Resolve mrp + sellingPrice from current or legacy Mongo field names. */
export function resolveProductPricing(row: ProductLean): {
  mrp: number;
  sellingPrice: number;
} {
  const legacy = row as ProductLean & {
    basePrice?: number;
    compareAtPrice?: number | null;
  };

  let sellingPrice = row.sellingPrice ?? legacy.basePrice ?? 0;
  let mrp = row.mrp ?? legacy.compareAtPrice ?? sellingPrice;

  if (!Number.isFinite(sellingPrice) || sellingPrice < 0) sellingPrice = 0;
  if (!Number.isFinite(mrp) || mrp < sellingPrice) mrp = sellingPrice;

  return { mrp, sellingPrice };
}
