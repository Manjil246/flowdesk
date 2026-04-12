import { z } from "zod";
import { LADIES_FASHION_CATALOG_SKUS } from "../constants/catalog-skus";

/** Arguments for `send_product_image` — sku must be a known catalogue id. */
export const sendProductImageToolArgsSchema = z.object({
  sku: z.enum(LADIES_FASHION_CATALOG_SKUS),
});

/** Arguments for `send_whatsapp_text` — non-empty after trim. */
export const sendWhatsappTextToolArgsSchema = z.object({
  text: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1)),
});

export type SendProductImageToolArgs = z.infer<typeof sendProductImageToolArgsSchema>;
export type SendWhatsappTextToolArgs = z.infer<typeof sendWhatsappTextToolArgsSchema>;
