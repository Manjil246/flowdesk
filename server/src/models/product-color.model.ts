import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * One row per (product, color): single WhatsApp/catalog image URL, not per size.
 */
const productColorSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    colorName: { type: String, required: true, trim: true },
    /** Display swatch on storefront (e.g. #7b1fa2). */
    hexCode: {
      type: String,
      required: true,
      trim: true,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    /** Single canonical image for this color (WhatsApp `image.link` / dashboard). */
    imageUrl: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "product_colors" },
);

productColorSchema.index({ productId: 1, active: 1, sortOrder: 1 });

export type ProductColorDoc = InferSchemaType<typeof productColorSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductColor =
  mongoose.models.ProductColor ??
  mongoose.model("ProductColor", productColorSchema);
