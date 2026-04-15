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
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR", trim: true },
    /** Sizes this product can ever carry; actual sellability is on VariantStock */
    allowedSizes: { type: [String], default: [] },
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
