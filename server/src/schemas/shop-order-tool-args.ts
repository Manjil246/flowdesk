import { z } from "zod";

const objectIdHex = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

/** Arguments for `save_shop_order` — server recomputes prices from the catalog. */
export const saveShopOrderToolArgsSchema = z.object({
  customerOrderPhone: z
    .string()
    .min(6)
    .max(40)
    .transform((s) => s.trim()),
  deliveryLocation: z
    .string()
    .min(2)
    .max(2000)
    .transform((s) => s.trim()),
  locationVerified: z.boolean(),
  items: z
    .array(
      z.object({
        productId: objectIdHex,
        colorId: objectIdHex,
        size: z.string().min(1).max(64).transform((s) => s.trim()),
        quantity: z.number().int().min(1).max(999),
        productName: z.string().max(500).optional(),
        colorName: z.string().max(200).optional(),
      }),
    )
    .min(1),
  currency: z.literal("NPR").optional().default("NPR"),
});

export type SaveShopOrderToolArgs = z.infer<typeof saveShopOrderToolArgsSchema>;

/** Arguments for `get_shop_order_status` — same WhatsApp number as when the order was placed. */
export const getShopOrderStatusToolArgsSchema = z.object({
  orderReference: z
    .string()
    .min(8)
    .max(40)
    .transform((s) => s.trim().toUpperCase()),
});

export type GetShopOrderStatusToolArgs = z.infer<
  typeof getShopOrderStatusToolArgsSchema
>;
