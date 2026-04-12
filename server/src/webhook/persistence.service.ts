import type { IBotReplyService } from "../interfaces/bot-reply.service.interface";
import type { IConversationRepository } from "../interfaces/conversation.repository.interface";
import type { IMessageRepository } from "../interfaces/message.repository.interface";
import type { IWebhookPersistenceService } from "../interfaces/webhook-persistence.service.interface";
import type { WhatsAppWebhookBody } from "./types";
import {
  extractMessageContent,
  metaTsToDate,
} from "./parse-incoming-payload";
import { normalizeWaPhone } from "../utils/phone";
import { isMongoReady } from "../lib/db-ready";

export class WebhookPersistenceService implements IWebhookPersistenceService {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly botReplyService: IBotReplyService,
  ) {}

  async persistIncomingPayload(body: WhatsAppWebhookBody): Promise<void> {
    if (!isMongoReady()) {
      console.warn("[webhook] skip DB persist: MongoDB not connected");
      return;
    }

    const entries = body.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) continue;
        const metadata = value.metadata as Record<string, unknown> | undefined;

        for (const msg of value.messages ?? []) {
          await this.handleInboundMessage(
            msg as Record<string, unknown>,
            metadata,
          );
        }
        for (const status of value.statuses ?? []) {
          await this.handleMessageStatus(status as Record<string, unknown>);
        }
      }
    }
  }

  private async handleInboundMessage(
    msg: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const messageId = msg.id as string | undefined;
    const fromRaw = msg.from as string | undefined;
    if (!messageId || !fromRaw) return;

    const customerPhone = normalizeWaPhone(fromRaw);
    const businessRaw = metadata?.display_phone_number;
    const businessPhone =
      typeof businessRaw === "string"
        ? normalizeWaPhone(businessRaw.replace(/\s/g, ""))
        : "";

    const type = (msg.type as string) || "unknown";
    const ts = metaTsToDate(msg.timestamp as string | undefined);

    const { text, mediaId, mediaCaption, interactiveReply, replyToMessageId } =
      extractMessageContent(msg, type);

    const conv = await this.conversationRepository.upsertInboundByPhone(
      customerPhone,
      {
        phone: customerPhone,
        contactName: "",
        botMode: true,
        botFlowStep: 0,
        isArchived: false,
        isSpam: false,
        unreadCount: 0,
        tags: [],
        source: "whatsapp",
      },
      {
        lastMessageAt: ts,
        lastMessageText: text.slice(0, 500),
        windowExpiresAt: new Date(ts.getTime() + 24 * 60 * 60 * 1000),
      },
    );

    const inserted = await this.messageRepository.createInboundIfNew({
      conversationId: conv._id,
      leadId: conv.leadId ?? undefined,
      messageId,
      from: "user",
      fromPhone: customerPhone,
      toPhone: businessPhone || customerPhone,
      text,
      timestamp: ts,
      status: "received",
      type,
      isInbound: true,
      replyToMessageId: replyToMessageId ?? null,
      mediaId,
      mediaUrl: null,
      mediaCaption,
      interactiveReply: interactiveReply ?? null,
      templateName: null,
      errorMessage: null,
      metaTimestamp: String(msg.timestamp ?? ""),
    });

    if (inserted === "created") {
      await this.conversationRepository.incrementUnreadById(String(conv._id));
      const conversationId = String(conv._id);
      void this.botReplyService
        .maybeReplyAfterInbound({
          conversationId,
          messageType: type,
          text,
          botMode: conv.botMode,
        })
        .catch((err: unknown) => {
          console.error("[webhook] bot reply scheduling failed:", err);
        });
    }
  }

  private async handleMessageStatus(
    status: Record<string, unknown>,
  ): Promise<void> {
    const id = status.id as string | undefined;
    const st = (status.status as string)?.toLowerCase();
    if (!id || !st) return;

    const errors = status.errors as Array<{ message?: string }> | undefined;
    const errMsg = errors?.[0]?.message ?? null;

    const allowed = [
      "sent",
      "delivered",
      "read",
      "failed",
      "pending",
      "received",
    ];
    const statusNorm = allowed.includes(st) ? st : "pending";

    await this.messageRepository.updateStatusByMessageId(
      id,
      statusNorm,
      errMsg,
    );
  }
}
