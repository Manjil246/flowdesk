import type { Types } from "mongoose";

export type ConversationUpsertLean = {
  _id: Types.ObjectId;
  leadId: Types.ObjectId | null | undefined;
  botMode: boolean;
};

export interface ActiveConversationListFilters {
  limit: number;
  skip: number;
}

/** Lean document shape returned for inbox list (fields used by API). */
export type ConversationListLean = {
  _id: Types.ObjectId;
  phone: string;
  contactName?: string;
  lastMessageText?: string;
  lastMessageAt?: Date | null;
  unreadCount?: number;
  botMode?: boolean;
  isArchived?: boolean;
};

export interface IConversationRepository {
  findActiveConversations(
    filters: ActiveConversationListFilters,
  ): Promise<ConversationListLean[]>;

  existsById(id: string): Promise<boolean>;

  upsertInboundByPhone(
    phone: string,
    setOnInsert: Record<string, unknown>,
    set: Record<string, unknown>,
  ): Promise<ConversationUpsertLean>;

  incrementUnreadById(conversationId: string): Promise<void>;

  /** Sets `unreadCount` to 0. Returns whether a document matched. */
  clearUnreadById(conversationId: string): Promise<boolean>;
}
