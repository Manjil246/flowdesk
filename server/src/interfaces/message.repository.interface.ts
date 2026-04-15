import type { Types } from "mongoose";

export type InboundMessageCreateInput = {
  conversationId: Types.ObjectId;
  leadId?: Types.ObjectId | null;
  messageId: string;
  from: "user" | "bot" | "admin";
  fromPhone: string;
  toPhone: string;
  text: string;
  timestamp: Date;
  status: string;
  type: string;
  isInbound: boolean;
  replyToMessageId: string | null;
  mediaId: string | null;
  mediaUrl: string | null;
  mediaCaption: string | null;
  interactiveReply?: {
    buttonId: string;
    buttonTitle: string;
  } | null;
  templateName: string | null;
  errorMessage: string | null;
  metaTimestamp: string;
};

export type MessageListLean = {
  _id: Types.ObjectId;
  messageId: string;
  text?: string;
  timestamp: Date;
  isInbound: boolean;
  from: string;
  status: string;
  type: string;
  mediaRef?: string | null;
  mediaUrl?: string | null;
};

export interface MessageListFilters {
  limit: number;
  skip: number;
}

/** Last N text turns for OpenAI (chronological); excludes empty bodies. */
export type RecentChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export interface IMessageRepository {
  findByConversationId(
    conversationId: string,
    filters: MessageListFilters,
  ): Promise<MessageListLean[]>;

  /**
   * Most recent `limit` messages with non-empty `text`, newest-first query then
   * returned oldest-first for chat completion history.
   */
  findRecentTextTurnsForChat(
    conversationId: string,
    limit: number,
    after?: Date,
  ): Promise<RecentChatTurn[]>;

  /** Returns whether a new row was inserted (`duplicate` = idempotent replay). */
  createInboundIfNew(doc: InboundMessageCreateInput): Promise<"created" | "duplicate">;

  updateStatusByMessageId(
    messageId: string,
    status: string,
    errorMessage: string | null,
  ): Promise<void>;
}
