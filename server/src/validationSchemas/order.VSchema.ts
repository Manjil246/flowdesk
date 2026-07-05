import { z } from "zod";

const orderStatuses = [
  "order_placed",
  "payment_confirmed",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

export const orderIdParamsSchema = z.object({
  orderId: z.string().min(1),
});

export const orderListQuerySchema = z.object({
  status: z.enum(orderStatuses).optional(),
  skip: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export const orderPatchBodySchema = z.object({
  status: z.enum(orderStatuses).optional(),
  tags: z.array(z.string().max(80)).max(20).optional(),
  itemsSubtotal: z.coerce.number().min(0).max(1e9).optional(),
  deliveryCharge: z.coerce.number().min(0).max(1e9).optional(),
  grandTotal: z.coerce.number().min(0).max(1e9).optional(),
  trackingReference: z.string().max(500).nullable().optional(),
  dispatchNotes: z.string().max(4000).nullable().optional(),
  paymentNotes: z.string().max(4000).nullable().optional(),
  adminNotes: z.string().max(4000).nullable().optional(),
});

export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type OrderPatchBody = z.infer<typeof orderPatchBodySchema>;

const objectIdHex = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createAdminOrderBodySchema = z.object({
  customerName: z.string().min(1).max(160).transform((s) => s.trim()),
  phone: z
    .string()
    .regex(/^9\d{9}$/, "Phone must be a 10-digit Nepal mobile number starting with 9"),
  email: z
    .string()
    .email()
    .max(200)
    .optional()
    .transform((s) => s?.trim().toLowerCase()),
  street: z.string().min(1).max(2000).transform((s) => s.trim()),
  city: z.string().min(1).max(200).transform((s) => s.trim()),
  district: z.string().max(200).optional().default("").transform((s) => s.trim()),
  province: z.string().min(1).max(100).transform((s) => s.trim()),
  zipCode: z.string().max(20).optional().default("").transform((s) => s.trim()),
  notes: z.string().max(2000).optional().default("").transform((s) => s.trim()),
  adminNotes: z.string().max(4000).optional().default("").transform((s) => s.trim()),
  tags: z.array(z.string().trim().max(80)).max(20).optional().default([]),
  items: z
    .array(
      z.object({
        productId: objectIdHex,
        colorId: objectIdHex,
        size: z.string().min(1).max(64).transform((s) => s.trim()),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1),
});

export type CreateAdminOrderBody = z.infer<typeof createAdminOrderBodySchema>;
