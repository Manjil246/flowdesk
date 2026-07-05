import mongoose, { Schema, type InferSchemaType } from "mongoose";

const orderLineItemSchema = new Schema(
  {
    productId: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    colorId: { type: String, required: true, trim: true },
    colorName: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "", trim: true },
    size: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    /** Customer-facing trace id (e.g. SS-YYYYMMDD-HEX); never a Mongo _id. */
    orderReference: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["web", "whatsapp", "admin"],
      default: "whatsapp",
      index: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
      index: true,
    },
    customerWaPhone: { type: String, default: null, trim: true },
    customerEmail: { type: String, default: null, trim: true, lowercase: true },
    customerName: { type: String, default: null, trim: true },
    customerOrderPhone: { type: String, required: true, trim: true },
    deliveryLocation: { type: String, required: true, trim: true },
    deliveryStreet: { type: String, default: null, trim: true },
    deliveryCity: { type: String, default: null, trim: true },
    deliveryDistrict: { type: String, default: null, trim: true },
    deliveryProvince: { type: String, default: null, trim: true },
    deliveryCustomerNotes: { type: String, default: null, trim: true },
    deliveryZipCode: { type: String, default: null, trim: true },
    deliveryLocationLat: { type: Number, default: null },
    deliveryLocationLng: { type: Number, default: null },
    locationVerified: { type: Boolean, required: true, default: false },
    currency: { type: String, required: true, default: "NPR", trim: true },
    lineItems: { type: [orderLineItemSchema], required: true },
    itemsSubtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "order_placed",
        "payment_confirmed",
        "dispatched",
        "delivered",
        "cancelled",
      ],
      default: "order_placed",
      index: true,
    },
    tags: { type: [String], default: [] },
    trackingReference: { type: String, default: null },
    dispatchNotes: { type: String, default: null },
    paymentNotes: { type: String, default: null },
    adminNotes: { type: String, default: null },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerWaPhone: 1, orderReference: 1 });
orderSchema.index({ customerEmail: 1, orderReference: 1 });

export type OrderDoc = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Order =
  mongoose.models.Order ?? mongoose.model("Order", orderSchema);
