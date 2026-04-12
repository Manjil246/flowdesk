import type { WhatsAppWebhookBody } from "../webhook/types";

export interface IWebhookPersistenceService {
  /** Persist WhatsApp Cloud API webhook payload (messages + statuses). */
  persistIncomingPayload(body: WhatsAppWebhookBody): Promise<void>;
}
