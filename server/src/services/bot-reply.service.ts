import { LADIES_FASHION_BOT_SYSTEM_PROMPT } from "../constants/ladies-fashion-bot-system-prompt";
import { LADIES_FASHION_WHATSAPP_TOOLS } from "../constants/whatsapp-bot-tools";
import {
  BACKEND_BASE_URL,
  BOT_AUTO_REPLY_ENABLED,
  BOT_REPLY_HISTORY_LIMIT,
  OPENAI_API_KEY,
} from "../config/imports";
import { buildProductImagePublicUrl } from "../constants/product-image-resolver";
import {
  sendProductImageToolArgsSchema,
  sendWhatsappTextToolArgsSchema,
} from "../schemas/whatsapp-bot-tool-args";
import type {
  BotReplyAfterInboundInput,
  IBotReplyService,
} from "../interfaces/bot-reply.service.interface";
import type { IMessageRepository } from "../interfaces/message.repository.interface";
import type { IOpenAIService } from "../interfaces/openai.service.interface";
import type { IWhatsAppService } from "../interfaces/whatsapp.service.interface";

export class BotReplyService implements IBotReplyService {
  constructor(
    private readonly openAIService: IOpenAIService,
    private readonly whatsAppService: IWhatsAppService,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async maybeReplyAfterInbound(
    input: BotReplyAfterInboundInput,
  ): Promise<void> {
    if (!BOT_AUTO_REPLY_ENABLED) return;
    if (!input.botMode) return;
    if (input.messageType !== "text") return;
    if (!OPENAI_API_KEY.trim()) return;
    const userText = input.text.trim();
    if (!userText) return;

    try {
      const history = await this.messageRepository.findRecentTextTurnsForChat(
        input.conversationId,
        BOT_REPLY_HISTORY_LIMIT,
      );

      const messages = [
        { role: "system" as const, content: LADIES_FASHION_BOT_SYSTEM_PROMPT },
        ...history.map((t) => ({
          role: t.role,
          content: t.content,
        })),
      ];

      const conversationId = input.conversationId;

      await this.openAIService.runChatWithTools(messages, {
        tools: LADIES_FASHION_WHATSAPP_TOOLS,
        onToolCall: async (name, argsJson) => {
          let parsed: unknown;
          try {
            parsed = JSON.parse(argsJson) as unknown;
          } catch {
            return JSON.stringify({ ok: false, error: "invalid_arguments_json" });
          }

          if (name === "send_product_image") {
            const checked = sendProductImageToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return JSON.stringify({
                ok: false,
                error: "validation_failed",
                ...checked.error.flatten(),
              });
            }
            const { sku } = checked.data;
            const imageUrl = buildProductImagePublicUrl(sku, BACKEND_BASE_URL);
            if (!imageUrl) {
              return JSON.stringify({
                ok: false,
                reason: "no_public_image_url_or_file_missing",
                sku,
              });
            }
            try {
              await this.whatsAppService.sendImageByLink({
                conversationId,
                imageUrl,
                mediaRef: sku,
                senderRole: "bot",
              });
              return JSON.stringify({ ok: true, sku });
            } catch (e: unknown) {
              const m = e instanceof Error ? e.message : String(e);
              return JSON.stringify({ ok: false, error: m, sku });
            }
          }

          if (name === "send_whatsapp_text") {
            const checked = sendWhatsappTextToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return JSON.stringify({
                ok: false,
                error: "validation_failed",
                ...checked.error.flatten(),
              });
            }
            const { text } = checked.data;
            try {
              await this.whatsAppService.sendTextMessage({
                conversationId,
                text,
                senderRole: "bot",
              });
              return JSON.stringify({ ok: true });
            } catch (e: unknown) {
              const m = e instanceof Error ? e.message : String(e);
              return JSON.stringify({ ok: false, error: m });
            }
          }

          return JSON.stringify({ ok: false, error: `unknown_tool:${name}` });
        },
        onContentFallback: async (text) => {
          await this.whatsAppService.sendTextMessage({
            conversationId,
            text,
            senderRole: "bot",
          });
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[bot-reply] failed:", msg);
    }
  }
}
