import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import { WhatsAppRepository } from "../repositories/whatsapp.repository";
import type { IWebhookPersistenceService } from "../interfaces/webhook-persistence.service.interface";
import { WebhookPersistenceService } from "./persistence.service";
import type { WhatsAppWebhookBody } from "./types";
import { logWebhookPayload } from "./log-payload";
import { BotReplyService } from "../services/bot-reply.service";
import { CatalogService } from "../services/catalog.service";
import { OpenAIService } from "../services/openai.service";
import { WhatsAppService } from "../services/whatsapp.service";
import { CategoryRepository } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ProductColorRepository } from "../repositories/product-color.repository";
import { VariantStockRepository } from "../repositories/variant-stock.repository";
import { OrderRepository } from "../repositories/order.repository";
import { ShopOrderService } from "../services/shop-order.service";
import { BotSessionRepository } from "../repositories/bot-session.repository";

let persistence: IWebhookPersistenceService | null = null;

function getWebhookPersistence(): IWebhookPersistenceService {
  if (!persistence) {
    const messageRepository = new MessageRepository();
    const catalogService = new CatalogService(
      new CategoryRepository(),
      new ProductRepository(),
      new ProductColorRepository(),
      new VariantStockRepository(),
    );
    const shopOrderService = new ShopOrderService(
      catalogService,
      new OrderRepository(),
      new ConversationRepository(),
    );
    const botReplyService = new BotReplyService(
      new OpenAIService(),
      new WhatsAppService(new WhatsAppRepository()),
      messageRepository,
      catalogService,
      shopOrderService,
      new BotSessionRepository(),
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
