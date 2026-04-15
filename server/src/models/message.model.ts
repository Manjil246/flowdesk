import mongoose, { Schema, type InferSchemaType } from "mongoose";

const interactiveReplySchema = new Schema(
  {
    buttonId: { type: String, default: null },
    buttonTitle: { type: String, default: null },
  },
  { _id: false },
);

const toolTraceStepSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    arguments: { type: String, default: "" },
    result: { type: String, default: "" },
  },
  { _id: false },
);

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    leadId: { type: Schema.Types.ObjectId, default: null },
    messageId: { type: String, required: true, trim: true },
    from: {
      type: String,
      enum: ["user", "bot", "admin"],
      required: true,
    },
    fromPhone: { type: String, required: true, trim: true },
    toPhone: { type: String, required: true, trim: true },
    text: { type: String, default: "" },
    timestamp: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed", "received"],
      default: "received",
    },
    type: { type: String, default: "unknown" },
    isInbound: { type: Boolean, required: true },
    replyToMessageId: { type: String, default: null },
    mediaId: { type: String, default: null },
    /** Short handle e.g. sku `SS-K01` for outbound product photos (no binary in DB). */
    mediaRef: { type: String, default: null },
    mediaUrl: { type: String, default: null },
    mediaCaption: { type: String, default: null },
    interactiveReply: { type: interactiveReplySchema, default: null },
    templateName: { type: String, default: null },
    errorMessage: { type: String, default: null },
    metaTimestamp: { type: String, default: null },
    /** Bot/admin outbound: tool name, raw arguments JSON, and tool result JSON per round (replay for GPT). */
    toolTrace: { type: [toolTraceStepSchema], default: undefined },
  },
  { timestamps: true },
);

messageSchema.index({ messageId: 1 }, { unique: true });
messageSchema.index({ conversationId: 1, timestamp: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Message =
  mongoose.models.Message ?? mongoose.model("Message", messageSchema);
