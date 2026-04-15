import mongoose from "mongoose";
import { Product } from "../models/product.model";
import type { ProductDoc } from "../models/product.model";

export type ProductLean = Pick<
  ProductDoc,
  | "_id"
  | "categoryId"
  | "name"
  | "description"
  | "occasions"
  | "fabric"
  | "basePrice"
  | "currency"
  | "allowedSizes"
  | "active"
  | "sortOrder"
> & { createdAt?: Date; updatedAt?: Date };

export class ProductRepository {
  async countByCategoryId(categoryId: string): Promise<number> {
    return Product.countDocuments({
      categoryId: new mongoose.Types.ObjectId(categoryId),
    });
  }

  async findMany(filters: {
    categoryId?: string;
    active?: boolean;
    search?: string;
    skip: number;
    limit: number;
  }): Promise<ProductLean[]> {
    const q: Record<string, unknown> = {};
    if (filters.categoryId) {
      q.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
    }
    if (filters.active !== undefined) {
      q.active = filters.active;
    }
    if (filters.search?.trim()) {
      const s = filters.search.trim();
      const rx = new RegExp(
        s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      if (
        mongoose.Types.ObjectId.isValid(s) &&
        new mongoose.Types.ObjectId(s).toString() === s
      ) {
        q.$or = [{ _id: new mongoose.Types.ObjectId(s) }, { name: rx }];
      } else {
        q.name = rx;
      }
    }
    const docs = await Product.find(q)
      .sort({ sortOrder: 1, name: 1 })
      .skip(filters.skip)
      .limit(filters.limit)
      .lean();
    return docs as unknown as ProductLean[];
  }

  async findById(id: string): Promise<ProductLean | null> {
    const doc = await Product.findById(id).lean();
    return doc as ProductLean | null;
  }

  async create(data: {
    categoryId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    occasions: string[];
    fabric: string;
    basePrice: number;
    currency: string;
    allowedSizes: string[];
    active: boolean;
    sortOrder: number;
  }): Promise<ProductLean> {
    const doc = await Product.create(data);
    return doc.toObject() as ProductLean;
  }

  async updateById(
    id: string,
    patch: Partial<{
      categoryId: mongoose.Types.ObjectId;
      name: string;
      description: string;
      occasions: string[];
      fabric: string;
      basePrice: number;
      currency: string;
      allowedSizes: string[];
      active: boolean;
      sortOrder: number;
    }>,
  ): Promise<ProductLean | null> {
    const doc = await Product.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true },
    ).lean();
    return doc as ProductLean | null;
  }

  async deleteById(id: string): Promise<boolean> {
    const r = await Product.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return r.deletedCount > 0;
  }
}
