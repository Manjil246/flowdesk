import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import type {
  ConversationSendContext,
  IWhatsAppRepository,
  OutboundMessageInsertInput,
} from "../interfaces/whatsapp.repository.interface";

export class WhatsAppRepository implements IWhatsAppRepository {
  async findConversationSendContext(
    conversationId: string,
  ): Promise<ConversationSendContext | null> {
    const doc = (await Conversation.findById(conversationId)
      .select("phone leadId isArchived")
      .lean()) as {
      _id: mongoose.Types.ObjectId;
      phone: string;
      leadId?: mongoose.Types.ObjectId | null;
      isArchived?: boolean;
    } | null;
    if (!doc?._id) return null;
    return {
      _id: doc._id,
      phone: doc.phone,
      leadId: doc.leadId ?? null,
      isArchived: Boolean(doc.isArchived),
    };
  }

  async insertOutboundMessage(
    doc: OutboundMessageInsertInput,
  ): Promise<{ mongoMessageId: string }> {
    const created = await Message.create({
      conversationId: doc.conversationId,
      leadId: doc.leadId ?? undefined,
      messageId: doc.messageId,
      from: doc.from,
      fromPhone: doc.fromPhone,
      toPhone: doc.toPhone,
      text: doc.text,
      timestamp: doc.timestamp,
      status: doc.status,
      type: doc.type,
      isInbound: doc.isInbound,
      replyToMessageId: null,
      mediaId: null,
      mediaRef: doc.mediaRef ?? null,
      mediaUrl: doc.mediaUrl ?? null,
      mediaCaption: doc.mediaCaption ?? null,
      interactiveReply: null,
      templateName: null,
      errorMessage: null,
      metaTimestamp: null,
      toolTrace: doc.toolTrace?.length ? doc.toolTrace : undefined,
    });
    return { mongoMessageId: String(created._id) };
  }

  async updateConversationAfterOutbound(
    conversationId: string,
    lastMessageText: string,
    lastMessageAt: Date,
  ): Promise<void> {
    await Conversation.updateOne(
      { _id: conversationId },
      {
        $set: {
          lastMessageAt,
          lastMessageText: lastMessageText.slice(0, 500),
          windowExpiresAt: new Date(lastMessageAt.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    );
  }
}
