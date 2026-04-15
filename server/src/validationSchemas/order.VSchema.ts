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
  trackingReference: z.string().max(500).nullable().optional(),
  dispatchNotes: z.string().max(4000).nullable().optional(),
  paymentNotes: z.string().max(4000).nullable().optional(),
  adminNotes: z.string().max(4000).nullable().optional(),
});

export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type OrderPatchBody = z.infer<typeof orderPatchBodySchema>;
