import mongoose from "mongoose";
import { Message } from "../models/message.model";
import type {
  IMessageRepository,
  InboundMessageCreateInput,
  MessageListFilters,
  MessageListLean,
  RecentChatTurn,
} from "../interfaces/message.repository.interface";

function isDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  );
}

export class MessageRepository implements IMessageRepository {
  async findByConversationId(
    conversationId: string,
    filters: MessageListFilters,
  ): Promise<MessageListLean[]> {
    const docs = await Message.find({
      conversationId: new mongoose.Types.ObjectId(conversationId),
    })
      .sort({ timestamp: 1 })
      .skip(filters.skip)
      .limit(filters.limit)
      .select(
        "messageId text timestamp isInbound from status type mediaRef mediaUrl",
      )
      .lean();
    return docs as unknown as MessageListLean[];
  }

  async findRecentTextTurnsForChat(
    conversationId: string,
    limit: number,
  ): Promise<RecentChatTurn[]> {
    const cap = Math.max(1, Math.min(80, limit));
    const docs = await Message.find({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      $or: [
        { text: { $exists: true, $nin: [null, ""] } },
        { type: "image", mediaRef: { $nin: [null, ""] } },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(cap)
      .select("text isInbound type mediaRef")
      .lean();

    const turns: RecentChatTurn[] = [];
    for (let i = docs.length - 1; i >= 0; i -= 1) {
      const row = docs[i] as {
        text?: string;
        isInbound?: boolean;
        type?: string;
        mediaRef?: string | null;
      };
      let content = (row.text ?? "").trim();
      if (!content && row.type === "image" && row.mediaRef) {
        content = `[Product photo: ${row.mediaRef}]`;
      }
      if (!content) continue;
      const role: RecentChatTurn["role"] =
        row.isInbound === true ? "user" : "assistant";
      turns.push({ role, content });
    }
    return turns;
  }

  async createInboundIfNew(
    doc: InboundMessageCreateInput,
  ): Promise<"created" | "duplicate"> {
    try {
      await Message.create(doc);
      return "created";
    } catch (err: unknown) {
      if (isDuplicateKey(err)) return "duplicate";
      throw err;
    }
  }

  async updateStatusByMessageId(
    messageId: string,
    status: string,
    errorMessage: string | null,
  ): Promise<void> {
    await Message.updateOne(
      { messageId },
      { $set: { status, errorMessage } },
    );
  }
}
