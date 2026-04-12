import mongoose, { Schema, type InferSchemaType } from "mongoose";

const conversationSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, default: null },
    phone: { type: String, required: true, trim: true },
    contactName: { type: String, default: "" },
    botMode: { type: Boolean, default: true },
    botFlowStep: { type: Number, default: 0 },
    assignedTo: { type: String, default: null },
    isArchived: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    lastMessageAt: { type: Date, default: null },
    lastMessageText: { type: String, default: "" },
    unreadCount: { type: Number, default: 0 },
    windowExpiresAt: { type: Date, default: null },
    source: { type: String, default: "whatsapp" },
    adId: { type: String, default: null },
    campaignId: { type: Schema.Types.ObjectId, default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

conversationSchema.index({ phone: 1 }, { unique: true });

export type ConversationDoc = InferSchemaType<typeof conversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Conversation =
  mongoose.models.Conversation ??
  mongoose.model("Conversation", conversationSchema);
