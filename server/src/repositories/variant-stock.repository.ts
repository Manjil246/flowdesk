import mongoose from "mongoose";
import { VariantStock } from "../models/variant-stock.model";
import type { VariantStockDoc } from "../models/variant-stock.model";

export type VariantStockLean = Pick<
  VariantStockDoc,
  | "_id"
  | "variantId"
  | "productId"
  | "size"
  | "price"
  | "stock"
  | "isAvailable"
  | "lowStockThreshold"
  | "sku"
  | "active"
> & { createdAt?: Date; updatedAt?: Date };

export type VariantStockUpsertRow = {
  size: string;
  price: number | null | undefined;
  stock: number;
  isAvailable: boolean;
  lowStockThreshold: number | null | undefined;
  sku: string | null | undefined;
  active: boolean;
};

export class VariantStockRepository {
  async findByVariantId(variantId: string): Promise<VariantStockLean[]> {
    const docs = await VariantStock.find({
      variantId: new mongoose.Types.ObjectId(variantId),
    })
      .sort({ size: 1 })
      .lean();
    return docs as unknown as VariantStockLean[];
  }

  async deleteManyByVariantId(variantId: string): Promise<void> {
    await VariantStock.deleteMany({
      variantId: new mongoose.Types.ObjectId(variantId),
    });
  }

  async deleteManyByProductId(productId: string): Promise<void> {
    await VariantStock.deleteMany({
      productId: new mongoose.Types.ObjectId(productId),
    });
  }

  /**
   * Replace all stock rows for a color variant: delete existing, insert `items`.
   */
  async replaceForVariant(
    variantId: string,
    productId: string,
    items: VariantStockUpsertRow[],
  ): Promise<VariantStockLean[]> {
    const vId = new mongoose.Types.ObjectId(variantId);
    const pId = new mongoose.Types.ObjectId(productId);
    await VariantStock.deleteMany({ variantId: vId });
    if (items.length === 0) {
      return [];
    }
    const docs = await VariantStock.insertMany(
      items.map((row) => ({
        variantId: vId,
        productId: pId,
        size: row.size,
        price: row.price === undefined ? null : row.price,
        stock: row.stock,
        isAvailable: row.isAvailable,
        lowStockThreshold:
          row.lowStockThreshold === undefined ? null : row.lowStockThreshold,
        sku: row.sku === undefined ? null : row.sku,
        active: row.active,
      })),
    );
    return docs.map((d) => d.toObject() as VariantStockLean);
  }
}
