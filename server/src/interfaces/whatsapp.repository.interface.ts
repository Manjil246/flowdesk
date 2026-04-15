import type { Types } from "mongoose";

/** Conversation row needed to send a WhatsApp message. */
export type ConversationSendContext = {
  _id: Types.ObjectId;
  phone: string;
  leadId: Types.ObjectId | null | undefined;
  isArchived: boolean;
};

/** One tool round persisted on an outbound message (for replay / debugging). */
export type OutboundToolTraceEntry = {
  name: string;
  arguments: string;
  result: string;
};

/** Fields required to insert an outbound row in `Message` after Graph API success. */
export type OutboundMessageInsertInput = {
  conversationId: Types.ObjectId;
  leadId: Types.ObjectId | null | undefined;
  messageId: string;
  from: "admin" | "bot";
  fromPhone: string;
  toPhone: string;
  text: string;
  timestamp: Date;
  status: string;
  type: string;
  isInbound: boolean;
  mediaRef?: string | null;
  mediaUrl?: string | null;
  mediaCaption?: string | null;
  /** Tools invoked in this assistant turn up to and including this outbound (bot only). */
  toolTrace?: OutboundToolTraceEntry[];
};

export interface IWhatsAppRepository {
  findConversationSendContext(
    conversationId: string,
  ): Promise<ConversationSendContext | null>;

  insertOutboundMessage(
    doc: OutboundMessageInsertInput,
  ): Promise<{ mongoMessageId: string }>;

  updateConversationAfterOutbound(
    conversationId: string,
    lastMessageText: string,
    lastMessageAt: Date,
  ): Promise<void>;
}
