/**
 * Sku → image file name under `server/public/products/`.
 * Aligned with internal catalog SS-* codes in `ladies-fashion-bot-system-prompt.ts`.
 */
export const PRODUCT_IMAGE_FILE_BY_SKU = {
  "SS-K01": "SS-K01.jpg",
  "SS-K02": "SS-K02.jpg",
  "SS-S01": "SS-S01.jpg",
  "SS-S02": "SS-S02.jpg",
  "SS-D01": "SS-D01.jpg",
  "SS-D02": "SS-D02.jpg",
} as const satisfies Record<string, string>;

export type ProductImageMappedSku = keyof typeof PRODUCT_IMAGE_FILE_BY_SKU;

export function isMappedProductImageSku(sku: string): sku is ProductImageMappedSku {
  return Object.hasOwn(PRODUCT_IMAGE_FILE_BY_SKU, sku);
}
