export type BotReplyAfterInboundInput = {
  conversationId: string;
  messageType: string;
  text: string;
  locationData?: {
    lat?: number;
    lng?: number;
    name?: string;
    address?: string;
    raw: string;
  } | null;
  botMode: boolean;
};

export interface IBotReplyService {
  /**
   * After a new inbound row is committed: optionally call OpenAI and send the
   * reply on WhatsApp. Swallows errors after logging.
   */
  maybeReplyAfterInbound(input: BotReplyAfterInboundInput): Promise<void>;
}
