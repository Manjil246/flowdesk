import mongoose, { Schema, type InferSchemaType } from "mongoose";

const numberedCategorySchema = new Schema(
  { n: { type: Number, required: true }, id: { type: String, required: true }, name: { type: String, required: true } },
  { _id: false },
);

const numberedProductSchema = new Schema(
  {
    n: { type: Number, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    basePrice: { type: Number, required: true },
  },
  { _id: false },
);

const numberedColorSchema = new Schema(
  {
    n: { type: Number, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, default: "" },
  },
  { _id: false },
);

const productDetailSnapshotSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    description: { type: String, default: "" },
    fabric: { type: String, default: "" },
    occasions: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    sizes: { type: [String], default: [] },
    colors: { type: [numberedColorSchema], default: [] },
  },
  { _id: false },
);

const botSessionSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    categories: { type: [numberedCategorySchema], default: [] },
    products: { type: [numberedProductSchema], default: [] },
    productDetail: { type: productDetailSnapshotSchema, default: null },
    selectedSize: { type: String, default: null },
    selectedColorN: { type: Number, default: null },
    imageSent: { type: Boolean, default: false },
    orderPlacedAt: { type: Date, default: null },
    sessionStartedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

botSessionSchema.index({ conversationId: 1 }, { unique: true });
botSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

export type BotSessionDoc = InferSchemaType<typeof botSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BotSession =
  mongoose.models.BotSession ??
  mongoose.model("BotSession", botSessionSchema, "bot_sessions");
