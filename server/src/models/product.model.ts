import mongoose, { Schema, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    /** e.g. daily, casual, wedding — controlled vocabulary for search/tools */
    occasions: { type: [String], default: [] },
    fabric: { type: String, default: "" },
    /** Tag / list price (MRP). */
    mrp: { type: Number, required: true, min: 0 },
    /** Price the customer pays; must be ≤ mrp. */
    sellingPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR", trim: true },
    /** Sizes this product can ever carry; actual sellability is on VariantStock */
    allowedSizes: { type: [String], default: [] },
    /** When true, delivery is free (deliveryCharge stored as 0). */
    freeDelivery: { type: Boolean, default: false },
    /** NPR delivery fee when freeDelivery is false. */
    deliveryCharge: { type: Number, default: 150, min: 0 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "products" },
);

productSchema.index({ categoryId: 1, active: 1, sortOrder: 1 });

export type ProductDoc = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product =
  mongoose.models.Product ?? mongoose.model("Product", productSchema);
