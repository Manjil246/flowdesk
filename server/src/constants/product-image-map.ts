/**
 * Sku → image file name under `server/public/products/`.
 */
export const PRODUCT_IMAGE_FILE_BY_SKU = {
  "KURTA-01": "KURTA-01.jpg",
  "KURTA-02": "KURTA-02.jpg",
  "DRESS-01": "DRESS-01.jpg",
  "DRESS-02": "DRESS-02.jpg",
  "SAREE-01": "SAREE-01.jpg",
  "SAREE-02": "SAREE-02.jpg",
  "LEH-01": "LEH-01.jpg",
  "COORD-01": "COORD-01.jpg",
  "DOLL-01": "DOLL-01.jpg",
  "DUP-01": "DUP-01.jpg",
} as const satisfies Record<string, string>;

export type ProductImageMappedSku = keyof typeof PRODUCT_IMAGE_FILE_BY_SKU;

export function isMappedProductImageSku(sku: string): sku is ProductImageMappedSku {
  return Object.hasOwn(PRODUCT_IMAGE_FILE_BY_SKU, sku);
}
