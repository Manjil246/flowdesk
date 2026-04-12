export type ConversationListItemDto = {
  id: string;
  phone: string;
  contactName: string;
  lastMessageText: string;
  lastMessageAt: string | null;
  unreadCount: number;
  botMode: boolean;
  isArchived: boolean;
};

export type MessageListItemDto = {
  id: string;
  messageId: string;
  text: string;
  timestamp: string;
  isInbound: boolean;
  from: string;
  status: string;
  type: string;
  mediaRef?: string | null;
  mediaUrl?: string | null;
};

export type ConversationListQueryInput = {
  limit: number;
  skip: number;
};

export type ConversationMessagesQueryInput = {
  limit: number;
  skip: number;
};

export interface IConversationApiService {
  listConversations(
    query: ConversationListQueryInput,
  ): Promise<ConversationListItemDto[]>;

  getMessagesForConversation(
    conversationId: string,
    query: ConversationMessagesQueryInput,
  ): Promise<MessageListItemDto[]>;

  /** Sets server-side unread count to 0 for this conversation. */
  markConversationAsRead(conversationId: string): Promise<void>;
}
