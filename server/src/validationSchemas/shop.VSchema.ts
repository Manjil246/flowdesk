import { z } from "zod";

export const reverseGeocodeQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type ReverseGeocodeQuery = z.infer<typeof reverseGeocodeQuerySchema>;

const objectIdHex = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createWebOrderBodySchema = z.object({
  firstName: z.string().min(1).max(80).transform((s) => s.trim()),
  lastName: z.string().min(1).max(80).transform((s) => s.trim()),
  email: z.string().email().max(200).transform((s) => s.trim().toLowerCase()),
  phone: z
    .string()
    .regex(/^9\d{9}$/, "Phone must be a 10-digit Nepal mobile number starting with 9"),
  street: z.string().min(1).max(2000).transform((s) => s.trim()),
  city: z.string().min(1).max(200).transform((s) => s.trim()),
  district: z.string().max(200).optional().default("").transform((s) => s.trim()),
  province: z.string().min(1).max(100).transform((s) => s.trim()),
  zipCode: z.string().max(20).optional().default("").transform((s) => s.trim()),
  notes: z.string().max(2000).optional().default("").transform((s) => s.trim()),
  deliveryLocationLat: z.number().optional().nullable(),
  deliveryLocationLng: z.number().optional().nullable(),
  locationVerified: z.boolean(),
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

export type CreateWebOrderBody = z.infer<typeof createWebOrderBodySchema>;

export const trackWebOrderQuerySchema = z.object({
  orderReference: z
    .string()
    .min(4)
    .max(40)
    .transform((s) => s.trim().toUpperCase()),
  email: z.string().email().max(200).transform((s) => s.trim().toLowerCase()),
});

export type TrackWebOrderQuery = z.infer<typeof trackWebOrderQuerySchema>;
