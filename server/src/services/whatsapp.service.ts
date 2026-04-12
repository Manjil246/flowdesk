import {
  GRAPH_API_VERSION,
  PHONE_NUMBER_ID,
  WHATSAPP_BUSINESS_PHONE,
  WHATSAPP_TOKEN,
} from "../config/imports";
import type { IWhatsAppRepository } from "../interfaces/whatsapp.repository.interface";
import type {
  IWhatsAppService,
  SendWhatsAppImageByLinkInput,
  SendWhatsAppTextInput,
  SendWhatsAppTextResult,
} from "../interfaces/whatsapp.service.interface";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
  WhatsAppApiError,
  WhatsAppConfigError,
} from "../errors/service.errors";
import { isMongoReady } from "../lib/db-ready";
import { normalizeWaPhone, toWhatsAppCloudRecipientId } from "../utils/phone";

type GraphSendTextResponse = {
  messages?: Array<{ id?: string }>;
  error?: { message?: string; type?: string; code?: number };
};

export class WhatsAppService implements IWhatsAppService {
  constructor(private readonly whatsAppRepository: IWhatsAppRepository) {}

  async sendTextMessage(
    input: SendWhatsAppTextInput,
  ): Promise<SendWhatsAppTextResult> {
    if (!isMongoReady()) {
      throw new DbNotReadyError();
    }

    const token = WHATSAPP_TOKEN.trim();
    const phoneNumberId = PHONE_NUMBER_ID.trim();
    const businessPhone = WHATSAPP_BUSINESS_PHONE.trim();

    if (!token || !phoneNumberId) {
      throw new WhatsAppConfigError(
        "Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID for sending messages.",
      );
    }
    if (!businessPhone) {
      throw new WhatsAppConfigError(
        "Missing WHATSAPP_BUSINESS_PHONE (E.164) for storing outbound messages.",
      );
    }

    const ctx = await this.whatsAppRepository.findConversationSendContext(
      input.conversationId,
    );
    if (!ctx) {
      throw new NotFoundError("Conversation not found");
    }
    if (ctx.isArchived) {
      throw new BadRequestError("Cannot send to an archived conversation");
    }

    const customerE164 = normalizeWaPhone(ctx.phone);
    const to = toWhatsAppCloudRecipientId(customerE164);
    if (!to) {
      throw new BadRequestError("Invalid customer phone on conversation");
    }

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: input.text },
      }),
    });

    const json = (await res.json()) as GraphSendTextResponse;

    if (!res.ok) {
      const msg = json.error?.message ?? `Graph API error (${res.status})`;
      throw new WhatsAppApiError(msg, res.status, json);
    }

    const waMessageId = json.messages?.[0]?.id;
    if (!waMessageId) {
      throw new WhatsAppApiError(
        "Graph API response missing messages[0].id",
        res.status,
        json,
      );
    }

    const now = new Date();
    const fromPhoneE164 = normalizeWaPhone(businessPhone);

    const { mongoMessageId } =
      await this.whatsAppRepository.insertOutboundMessage({
        conversationId: ctx._id,
        leadId: ctx.leadId,
        messageId: waMessageId,
        from: input.senderRole,
        fromPhone: fromPhoneE164,
        toPhone: customerE164,
        text: input.text,
        timestamp: now,
        status: "pending",
        type: "text",
        isInbound: false,
      });

    await this.whatsAppRepository.updateConversationAfterOutbound(
      input.conversationId,
      input.text,
      now,
    );

    return { waMessageId, mongoMessageId };
  }

  async sendImageByLink(
    input: SendWhatsAppImageByLinkInput,
  ): Promise<SendWhatsAppTextResult> {
    if (!isMongoReady()) {
      throw new DbNotReadyError();
    }

    const token = WHATSAPP_TOKEN.trim();
    const phoneNumberId = PHONE_NUMBER_ID.trim();
    const businessPhone = WHATSAPP_BUSINESS_PHONE.trim();

    if (!token || !phoneNumberId) {
      throw new WhatsAppConfigError(
        "Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID for sending messages.",
      );
    }
    if (!businessPhone) {
      throw new WhatsAppConfigError(
        "Missing WHATSAPP_BUSINESS_PHONE (E.164) for storing outbound messages.",
      );
    }

    const ctx = await this.whatsAppRepository.findConversationSendContext(
      input.conversationId,
    );
    if (!ctx) {
      throw new NotFoundError("Conversation not found");
    }
    if (ctx.isArchived) {
      throw new BadRequestError("Cannot send to an archived conversation");
    }

    const customerE164 = normalizeWaPhone(ctx.phone);
    const to = toWhatsAppCloudRecipientId(customerE164);
    if (!to) {
      throw new BadRequestError("Invalid customer phone on conversation");
    }

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "image",
        image: { link: input.imageUrl },
      }),
    });

    const json = (await res.json()) as GraphSendTextResponse;

    if (!res.ok) {
      const msg = json.error?.message ?? `Graph API error (${res.status})`;
      throw new WhatsAppApiError(msg, res.status, json);
    }

    const waMessageId = json.messages?.[0]?.id;
    if (!waMessageId) {
      throw new WhatsAppApiError(
        "Graph API response missing messages[0].id",
        res.status,
        json,
      );
    }

    const now = new Date();
    const fromPhoneE164 = normalizeWaPhone(businessPhone);
    const previewText = `[Photo:${input.mediaRef}]`;

    const { mongoMessageId } =
      await this.whatsAppRepository.insertOutboundMessage({
        conversationId: ctx._id,
        leadId: ctx.leadId,
        messageId: waMessageId,
        from: input.senderRole,
        fromPhone: fromPhoneE164,
        toPhone: customerE164,
        text: previewText,
        timestamp: now,
        status: "pending",
        type: "image",
        isInbound: false,
        mediaRef: input.mediaRef,
        mediaUrl: input.imageUrl,
        mediaCaption: null,
      });

    await this.whatsAppRepository.updateConversationAfterOutbound(
      input.conversationId,
      previewText,
      now,
    );

    return { waMessageId, mongoMessageId };
  }
}
