import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * Stock for one (product color variant × size).
 * - stock === 0 and isAvailable === true → temporarily out of stock
 * - isAvailable === false → combo not offered / not manufactured
 */
const variantStockSchema = new Schema(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductColor",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    size: { type: String, required: true, trim: true },
    /** NPR (or product currency) for this size×color; null = inherit product `basePrice` in APIs. */
    price: { type: Number, default: null, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isAvailable: { type: Boolean, required: true, default: true },
    lowStockThreshold: { type: Number, default: null, min: 0 },
    sku: { type: String, default: null, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "variant_stock" },
);

variantStockSchema.index({ variantId: 1, size: 1 }, { unique: true });
variantStockSchema.index({ productId: 1, active: 1 });

export type VariantStockDoc = InferSchemaType<typeof variantStockSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const VariantStock =
  mongoose.models.VariantStock ??
  mongoose.model("VariantStock", variantStockSchema);
