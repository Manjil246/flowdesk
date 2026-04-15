import mongoose from "mongoose";
import { Category } from "../models/category.model";
import type { CategoryDoc } from "../models/category.model";

export type CategoryLean = Pick<
  CategoryDoc,
  "_id" | "name" | "description" | "active" | "sortOrder"
> & { createdAt?: Date; updatedAt?: Date };

export class CategoryRepository {
  /** Highest `sortOrder` among all categories, or -1 if none. */
  async getMaxSortOrder(): Promise<number> {
    const doc = await Category.findOne()
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();
    const n = (doc as { sortOrder?: number } | null)?.sortOrder;
    return typeof n === "number" ? n : -1;
  }

  async findMany(filters: {
    active?: boolean;
    skip: number;
    limit: number;
  }): Promise<CategoryLean[]> {
    const q: Record<string, unknown> = {};
    if (filters.active !== undefined) {
      q.active = filters.active;
    }
    const docs = await Category.find(q)
      .sort({ sortOrder: 1, name: 1 })
      .skip(filters.skip)
      .limit(filters.limit)
      .lean();
    return docs as unknown as CategoryLean[];
  }

  async findById(id: string): Promise<CategoryLean | null> {
    const doc = await Category.findById(id).lean();
    return doc as CategoryLean | null;
  }

  async create(data: {
    name: string;
    description: string;
    active: boolean;
    sortOrder: number;
  }): Promise<CategoryLean> {
    const doc = await Category.create(data);
    return doc.toObject() as CategoryLean;
  }

  async updateById(
    id: string,
    patch: Partial<{
      name: string;
      description: string;
      active: boolean;
      sortOrder: number;
    }>,
  ): Promise<CategoryLean | null> {
    const doc = await Category.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true },
    ).lean();
    return doc as CategoryLean | null;
  }

  async deleteById(id: string): Promise<boolean> {
    const r = await Category.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return r.deletedCount > 0;
  }
}
