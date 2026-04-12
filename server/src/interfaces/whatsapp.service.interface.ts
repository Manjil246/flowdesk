export type SendWhatsAppTextInput = {
  conversationId: string;
  text: string;
  senderRole: "admin" | "bot";
};

/** Outbound image via public HTTPS `link` (Cloud API). */
export type SendWhatsAppImageByLinkInput = {
  conversationId: string;
  imageUrl: string;
  /** Short sku ref stored in Mongo, e.g. KURTA-01 */
  mediaRef: string;
  senderRole: "admin" | "bot";
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
