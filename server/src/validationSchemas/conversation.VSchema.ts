import { z } from "zod";

const objectIdParam = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid conversation id");

export const conversationListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

export type ConversationListQuery = z.infer<typeof conversationListQuerySchema>;

export const conversationMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(200),
  skip: z.coerce.number().int().min(0).default(0),
});

export type ConversationMessagesQuery = z.infer<
  typeof conversationMessagesQuerySchema
>;

export const conversationIdParamsSchema = z.object({
  conversationId: objectIdParam,
});

export type ConversationIdParams = z.infer<typeof conversationIdParamsSchema>;

export const conversationSendTextBodySchema = z.object({
  text: z.string().trim().min(1).max(4096),
  senderRole: z.enum(["admin", "bot"]).default("admin"),
});

export type ConversationSendTextBody = z.infer<
  typeof conversationSendTextBodySchema
>;
