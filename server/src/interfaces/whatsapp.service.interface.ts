import type { OutboundToolTraceEntry } from "./whatsapp.repository.interface";

export type SendWhatsAppTextInput = {
  conversationId: string;
  text: string;
  senderRole: "admin" | "bot";
  toolTrace?: OutboundToolTraceEntry[];
};

/** Outbound image via public HTTPS `link` (Cloud API). */
export type SendWhatsAppImageByLinkInput = {
  conversationId: string;
  imageUrl: string;
  /** Short ref stored in Mongo, e.g. productId:colorId */
  mediaRef: string;
  senderRole: "admin" | "bot";
  toolTrace?: OutboundToolTraceEntry[];
};

export type SendWhatsAppTextResult = {
  waMessageId: string;
  mongoMessageId: string;
};

export interface IWhatsAppService {
  sendTextMessage(input: SendWhatsAppTextInput): Promise<SendWhatsAppTextResult>;

  sendImageByLink(
    input: SendWhatsAppImageByLinkInput,
  ): Promise<SendWhatsAppTextResult>;
}
