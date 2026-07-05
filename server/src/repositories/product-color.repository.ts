import mongoose from "mongoose";
import { ProductColor } from "../models/product-color.model";
import type { ProductColorDoc } from "../models/product-color.model";

export type ProductColorLean = Pick<
  ProductColorDoc,
  | "_id"
  | "productId"
  | "colorName"
  | "hexCode"
  | "imageUrl"
  | "active"
  | "sortOrder"
> & { createdAt?: Date; updatedAt?: Date };

export class ProductColorRepository {
  async findByProductId(productId: string): Promise<ProductColorLean[]> {
    const docs = await ProductColor.find({
      productId: new mongoose.Types.ObjectId(productId),
    })
      .sort({ sortOrder: 1, colorName: 1 })
      .lean();
    return docs as unknown as ProductColorLean[];
  }

  async findByIdAndProductId(
    colorId: string,
    productId: string,
  ): Promise<ProductColorLean | null> {
    const doc = await ProductColor.findOne({
      _id: new mongoose.Types.ObjectId(colorId),
      productId: new mongoose.Types.ObjectId(productId),
    }).lean();
    return doc as ProductColorLean | null;
  }

  async create(data: {
    productId: mongoose.Types.ObjectId;
    colorName: string;
    hexCode: string;
    imageUrl: string;
    active: boolean;
    sortOrder: number;
  }): Promise<ProductColorLean> {
    const doc = await ProductColor.create(data);
    return doc.toObject() as ProductColorLean;
  }

  async updateById(
    id: string,
    patch: Partial<{
      colorName: string;
      hexCode: string;
      imageUrl: string;
      active: boolean;
      sortOrder: number;
    }>,
  ): Promise<ProductColorLean | null> {
    const doc = await ProductColor.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true },
    ).lean();
    return doc as ProductColorLean | null;
  }

  async deleteById(id: string): Promise<boolean> {
    const r = await ProductColor.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return r.deletedCount > 0;
  }

  async deleteManyByProductId(productId: string): Promise<void> {
    await ProductColor.deleteMany({
      productId: new mongoose.Types.ObjectId(productId),
    });
  }

  /** First active color image per product (for picker thumbnails). */
  async findFirstActiveImageByProductIds(
    productIds: string[],
  ): Promise<Map<string, string>> {
    if (productIds.length === 0) return new Map();

    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));
    const rows = await ProductColor.aggregate<{ _id: mongoose.Types.ObjectId; imageUrl: string }>([
      {
        $match: {
          productId: { $in: objectIds },
          active: true,
          imageUrl: { $exists: true, $nin: ["", null] },
        },
      },
      { $sort: { sortOrder: 1, colorName: 1 } },
      { $group: { _id: "$productId", imageUrl: { $first: "$imageUrl" } } },
    ]);

    const map = new Map<string, string>();
    for (const row of rows) {
      if (row.imageUrl?.trim()) {
        map.set(String(row._id), row.imageUrl.trim());
      }
    }
    return map;
  }
}
