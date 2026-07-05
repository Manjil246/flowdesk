import { z } from "zod";

export const contactCreateBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(200),
  phone: z.string().trim().max(20).optional().default(""),
  subject: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export type ContactCreateBody = z.infer<typeof contactCreateBodySchema>;

export const contactListQuerySchema = z.object({
  status: z.enum(["new", "read", "archived"]).optional(),
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ContactListQuery = z.infer<typeof contactListQuerySchema>;

export const contactIdParamsSchema = z.object({
  inquiryId: z.string().trim().min(1),
});

export type ContactIdParams = z.infer<typeof contactIdParamsSchema>;

export const contactPatchBodySchema = z.object({
  status: z.enum(["new", "read", "archived"]),
});

export type ContactPatchBody = z.infer<typeof contactPatchBodySchema>;
