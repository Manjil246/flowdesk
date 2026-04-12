import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import { WhatsAppRepository } from "../repositories/whatsapp.repository";
import type { IWebhookPersistenceService } from "../interfaces/webhook-persistence.service.interface";
import { WebhookPersistenceService } from "./persistence.service";
import type { WhatsAppWebhookBody } from "./types";
import { logWebhookPayload } from "./log-payload";
import { BotReplyService } from "../services/bot-reply.service";
import { OpenAIService } from "../services/openai.service";
import { WhatsAppService } from "../services/whatsapp.service";

let persistence: IWebhookPersistenceService | null = null;

function getWebhookPersistence(): IWebhookPersistenceService {
  if (!persistence) {
    const messageRepository = new MessageRepository();
    const botReplyService = new BotReplyService(
      new OpenAIService(),
      new WhatsAppService(new WhatsAppRepository()),
      messageRepository,
    );
    persistence = new WebhookPersistenceService(
      new ConversationRepository(),
      messageRepository,
      botReplyService,
    );
  }
  return persistence;
}

/**
 * Runs after HTTP 200 is sent — parse, DB, outbound replies, etc.
 * Keep this non-blocking for Meta's retry behavior.
 */
export function processIncomingWebhook(body: WhatsAppWebhookBody): void {
  logWebhookPayload(body);
  void getWebhookPersistence()
    .persistIncomingPayload(body)
    .catch((err: unknown) => {
      console.error("[webhook] persist failed:", err);
    });
}
