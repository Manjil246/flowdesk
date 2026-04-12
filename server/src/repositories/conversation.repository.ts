import { Conversation } from "../models/conversation.model";
import type {
  ActiveConversationListFilters,
  ConversationListLean,
  ConversationUpsertLean,
  IConversationRepository,
} from "../interfaces/conversation.repository.interface";

export class ConversationRepository implements IConversationRepository {
  async findActiveConversations(
    filters: ActiveConversationListFilters,
  ): Promise<ConversationListLean[]> {
    const docs = await Conversation.find({ isArchived: false })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(filters.skip)
      .limit(filters.limit)
      .select(
        "phone contactName lastMessageText lastMessageAt unreadCount botMode isArchived",
      )
      .lean();
    return docs as unknown as ConversationListLean[];
  }

  async existsById(id: string): Promise<boolean> {
    const doc = await Conversation.exists({ _id: id });
    return Boolean(doc);
  }

  async upsertInboundByPhone(
    phone: string,
    setOnInsert: Record<string, unknown>,
    set: Record<string, unknown>,
  ): Promise<ConversationUpsertLean> {
    const conv = (await Conversation.findOneAndUpdate(
      { phone },
      { $setOnInsert: setOnInsert, $set: set },
      { upsert: true, new: true },
    ).lean()) as {
      _id: ConversationUpsertLean["_id"];
      leadId?: ConversationUpsertLean["leadId"];
      botMode?: boolean;
    } | null;
    if (!conv?._id) {
      throw new Error("Conversation upsert returned no document");
    }
    return {
      _id: conv._id,
      leadId: conv.leadId ?? null,
      botMode: conv.botMode ?? true,
    };
  }

  async incrementUnreadById(conversationId: string): Promise<void> {
    await Conversation.updateOne(
      { _id: conversationId },
      { $inc: { unreadCount: 1 } },
    );
  }

  async clearUnreadById(conversationId: string): Promise<boolean> {
    const r = await Conversation.updateOne(
      { _id: conversationId },
      { $set: { unreadCount: 0 } },
    );
    return r.matchedCount > 0;
  }
}
