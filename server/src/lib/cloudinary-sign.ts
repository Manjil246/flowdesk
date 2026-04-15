import crypto from "crypto";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_CATALOG_FOLDER,
} from "../config/imports";
import { BadRequestError } from "../errors/service.errors";

export type CloudinaryCatalogUploadPayload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
};

function assertConfigured(): void {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new BadRequestError(
      "Cloudinary is not configured (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)",
    );
  }
}

/** Cloudinary v1 upload auth: SHA1 of sorted `k=v&…` + API secret. */
function signParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const keys = Object.keys(params).sort();
  const toSign = keys.map((k) => `${k}=${params[k]}`).join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

/**
 * One-shot signed upload params for dashboard → Cloudinary `image/upload`.
 * Frontend POSTs multipart `file`, `api_key`, `timestamp`, `signature`, `folder`, `public_id`.
 */
export function createCatalogImageUploadPayload(): CloudinaryCatalogUploadPayload {
  assertConfigured();
  const apiSecret = CLOUDINARY_API_SECRET;
  const folder = CLOUDINARY_CATALOG_FOLDER.replace(/^\/+|\/+$/g, "");
  const publicId = crypto.randomUUID();
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    folder,
    public_id: publicId,
    timestamp,
  };
  const signature = signParams(params, apiSecret);
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder,
    publicId,
    uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
  };
}
