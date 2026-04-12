import type {
  ConversationListItemDto,
  ConversationListQueryInput,
  ConversationMessagesQueryInput,
  IConversationApiService,
  MessageListItemDto,
} from "../interfaces/conversation-api.service.interface";
import type {
  ConversationListLean,
  IConversationRepository,
} from "../interfaces/conversation.repository.interface";
import type {
  IMessageRepository,
  MessageListLean,
} from "../interfaces/message.repository.interface";
import { DbNotReadyError, NotFoundError } from "../errors/service.errors";
import { isMongoReady } from "../lib/db-ready";

export class ConversationApiService implements IConversationApiService {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async listConversations(
    query: ConversationListQueryInput,
  ): Promise<ConversationListItemDto[]> {
    if (!isMongoReady()) {
      throw new DbNotReadyError();
    }
    const rows = await this.conversationRepository.findActiveConversations({
      limit: query.limit,
      skip: query.skip,
    });
    return rows.map((d) => this.toConversationListItem(d));
  }

  async getMessagesForConversation(
    conversationId: string,
    query: ConversationMessagesQueryInput,
  ): Promise<MessageListItemDto[]> {
    if (!isMongoReady()) {
      throw new DbNotReadyError();
    }
    const exists = await this.conversationRepository.existsById(conversationId);
    if (!exists) {
      throw new NotFoundError("Conversation not found");
    }
    const rows = await this.messageRepository.findByConversationId(
      conversationId,
      { limit: query.limit, skip: query.skip },
    );
    return rows.map((m) => this.toMessageListItem(m));
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    if (!isMongoReady()) {
      throw new DbNotReadyError();
    }
    const updated = await this.conversationRepository.clearUnreadById(
      conversationId,
    );
    if (!updated) {
      throw new NotFoundError("Conversation not found");
    }
  }

  private toConversationListItem(d: ConversationListLean): ConversationListItemDto {
    const last = d.lastMessageAt;
    return {
      id: String(d._id),
      phone: d.phone,
      contactName: d.contactName ?? "",
      lastMessageText: d.lastMessageText ?? "",
      lastMessageAt: last ? new Date(last).toISOString() : null,
      unreadCount: d.unreadCount ?? 0,
      botMode: d.botMode ?? true,
      isArchived: d.isArchived ?? false,
    };
  }

  private toMessageListItem(m: MessageListLean): MessageListItemDto {
    return {
      id: String(m._id),
      messageId: m.messageId,
      text: m.text ?? "",
      timestamp: new Date(m.timestamp).toISOString(),
      isInbound: m.isInbound,
      from: m.from,
      status: m.status,
      type: m.type,
      mediaRef: m.mediaRef ?? null,
      mediaUrl: m.mediaUrl ?? null,
    };
  }
}
