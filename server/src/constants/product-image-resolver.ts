import fs from "fs";
import path from "path";
import { LADIES_FASHION_CATALOG_SKUS } from "./catalog-skus";
import {
  isMappedProductImageSku,
  PRODUCT_IMAGE_FILE_BY_SKU,
} from "./product-image-map";

const PRODUCTS_REL = path.join("public", "products");

/** Files live under `server/public/products/` (see `PRODUCT_IMAGE_FILE_BY_SKU`). */
export function productImagesDir(): string {
  return path.join(process.cwd(), PRODUCTS_REL);
}

/** First catalog sku found in `text` that has an image map entry (case-insensitive). */
export function detectCatalogSkuInText(text: string): string | null {
  const upper = text.toUpperCase();
  for (const sku of LADIES_FASHION_CATALOG_SKUS) {
    if (!upper.includes(sku)) continue;
    if (isMappedProductImageSku(sku)) return sku;
  }
  return null;
}

/** Mapped filename if the file exists on disk, else null. */
export function resolveProductImageFilename(sku: string): string | null {
  if (!isMappedProductImageSku(sku)) return null;
  const name = PRODUCT_IMAGE_FILE_BY_SKU[sku];
  const full = path.join(productImagesDir(), name);
  return fs.existsSync(full) ? name : null;
}

/**
 * Public URL for WhatsApp `image.link`. Use your deployed **HTTPS** `BACKEND_BASE_URL`
 * (or ngrok) so Meta can fetch the file.
 */
export function buildProductImagePublicUrl(
  sku: string,
  backendBaseUrl: string,
): string | null {
  const file = resolveProductImageFilename(sku);
  if (!file) return null;
  const root = backendBaseUrl.replace(/\/$/, "");
  return `${root}/products/${encodeURIComponent(file)}`;
}
