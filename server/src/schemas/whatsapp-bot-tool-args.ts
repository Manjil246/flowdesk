import { z } from "zod";

/** browse_categories — no required fields. */
export const browseCategoriesToolArgsSchema = z.object({}).passthrough();
export type BrowseCategoriesToolArgs = z.infer<typeof browseCategoriesToolArgsSchema>;

/** browse_products — accepts a small integer (the numbered menu item). */
export const browseProductsToolArgsSchema = z.object({
  categoryNumber: z.coerce.number().int().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).optional().default(25),
});
export type BrowseProductsToolArgs = z.infer<typeof browseProductsToolArgsSchema>;

/** select_product — picks a product by its numbered menu position. */
export const selectProductToolArgsSchema = z.object({
  productNumber: z.coerce.number().int().min(1).max(100),
});
export type SelectProductToolArgs = z.infer<typeof selectProductToolArgsSchema>;

/** select_size — the size string from the displayed list. */
export const selectSizeToolArgsSchema = z.object({
  size: z
    .string()
    .min(1)
    .max(64)
    .transform((s) => s.trim()),
});
export type SelectSizeToolArgs = z.infer<typeof selectSizeToolArgsSchema>;

/** select_color — picks a color by its numbered menu position. */
export const selectColorToolArgsSchema = z.object({
  colorNumber: z.coerce.number().int().min(1).max(50),
});
export type SelectColorToolArgs = z.infer<typeof selectColorToolArgsSchema>;

/** send_product_image — optional colorNumber for preview before formal selection. */
export const sendProductImageToolArgsSchema = z.object({
  colorNumber: z.coerce.number().int().min(1).max(50).optional(),
});
export type SendProductImageToolArgs = z.infer<typeof sendProductImageToolArgsSchema>;

export const addToCartToolArgsSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});
export type AddToCartToolArgs = z.infer<typeof addToCartToolArgsSchema>;

export const viewCartToolArgsSchema = z.object({}).passthrough();
export type ViewCartToolArgs = z.infer<typeof viewCartToolArgsSchema>;

export const removeFromCartToolArgsSchema = z.object({
  itemNumber: z.coerce.number().int().min(1),
});
export type RemoveFromCartToolArgs = z.infer<typeof removeFromCartToolArgsSchema>;

export const initiateCheckoutToolArgsSchema = z.object({}).passthrough();
export type InitiateCheckoutToolArgs = z.infer<typeof initiateCheckoutToolArgsSchema>;

export const setCheckoutLocationToolArgsSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  raw: z.string(),
  isManual: z.boolean(),
});
export type SetCheckoutLocationToolArgs = z.infer<typeof setCheckoutLocationToolArgsSchema>;

export const setCheckoutPhoneToolArgsSchema = z.object({
  phone: z.string().min(1),
});
export type SetCheckoutPhoneToolArgs = z.infer<typeof setCheckoutPhoneToolArgsSchema>;

/** place_order — reads checkout data from session, no arguments required. */
export const placeOrderToolArgsSchema = z.object({}).passthrough();
export type PlaceOrderToolArgs = z.infer<typeof placeOrderToolArgsSchema>;

/** get_order_status — human-readable order reference. */
export const getOrderStatusToolArgsSchema = z.object({
  orderReference: z
    .string()
    .min(8)
    .max(40)
    .transform((s) => s.trim().toUpperCase()),
});
export type GetOrderStatusToolArgs = z.infer<typeof getOrderStatusToolArgsSchema>;

/** restart_shopping / change_product — no required fields. */
export const restartShoppingToolArgsSchema = z.object({}).passthrough();
export type RestartShoppingToolArgs = z.infer<typeof restartShoppingToolArgsSchema>;

export const changeProductToolArgsSchema = z.object({}).passthrough();
export type ChangeProductToolArgs = z.infer<typeof changeProductToolArgsSchema>;
