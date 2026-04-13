import fs from "fs";
import path from "path";
import {
  isMappedProductImageSku,
  PRODUCT_IMAGE_FILE_BY_SKU,
} from "./product-image-map";

const PRODUCTS_REL = path.join("public", "products");

/** Files live under `server/public/products/` (see `PRODUCT_IMAGE_FILE_BY_SKU`). */
export function productImagesDir(): string {
  return path.join(process.cwd(), PRODUCTS_REL);
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
