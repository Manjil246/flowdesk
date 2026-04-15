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
import { assertPublicImageUrlFetchable } from "../utils/verify-image-url";
import { sanitizeWhatsAppText } from "../utils/sanitize-whatsapp-text";

type GraphSendTextResponse = {
  messages?: Array<{ id?: string }>;
  error?: { message?: string; type?: string; code?: number };
};

export class WhatsAppService implements IWhatsAppService {
  constructor(private readonly whatsAppRepository: IWhatsAppRepository) {}

  private async sendGraphImageWithRetry(
    url: string,
    token: string,
    to: string,
    imageUrl: string,
  ): Promise<{ res: Response; json: GraphSendTextResponse }> {
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
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
            image: { link: imageUrl },
          }),
        });
        const json = (await res.json()) as GraphSendTextResponse;
        if (res.ok) return { res, json };
        const msg = json.error?.message ?? `Graph API error (${res.status})`;
        lastErr = new WhatsAppApiError(msg, res.status, json);
      } catch (e: unknown) {
        lastErr = e;
      }
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 450));
      }
    }
    if (lastErr instanceof Error) throw lastErr;
    throw new Error("Graph image send failed");
  }

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

    const safeText = sanitizeWhatsAppText(input.text);
    if (!safeText) {
      throw new BadRequestError("Cannot send empty text message");
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
        text: { preview_url: false, body: safeText },
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
        text: safeText,
        timestamp: now,
        status: "pending",
        type: "text",
        isInbound: false,
        toolTrace: input.toolTrace?.length ? input.toolTrace : undefined,
      });

    await this.whatsAppRepository.updateConversationAfterOutbound(
      input.conversationId,
      safeText,
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

    try {
      await assertPublicImageUrlFetchable(input.imageUrl);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      console.warn(
        `[whatsapp][image] preflight failed, trying Meta anyway: ${m}`,
      );
    }

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
    const { res, json } = await this.sendGraphImageWithRetry(
      url,
      token,
      to,
      input.imageUrl,
    );

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
    const lastPreview = `Photo · ${input.mediaRef}`.slice(0, 500);

    const { mongoMessageId } =
      await this.whatsAppRepository.insertOutboundMessage({
        conversationId: ctx._id,
        leadId: ctx.leadId,
        messageId: waMessageId,
        from: input.senderRole,
        fromPhone: fromPhoneE164,
        toPhone: customerE164,
        text: "",
        timestamp: now,
        status: "pending",
        type: "image",
        isInbound: false,
        mediaRef: input.mediaRef,
        mediaUrl: input.imageUrl,
        mediaCaption: null,
        toolTrace: input.toolTrace?.length ? input.toolTrace : undefined,
      });

    await this.whatsAppRepository.updateConversationAfterOutbound(
      input.conversationId,
      lastPreview,
      now,
    );

    return { waMessageId, mongoMessageId };
  }
}
