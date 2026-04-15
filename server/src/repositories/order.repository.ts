import mongoose from "mongoose";
import { Order } from "../models/order.model";
import type { OrderCreateInput, OrderPatchInput } from "./order.types";

export type OrderLean = Record<string, unknown> & {
  _id: mongoose.Types.ObjectId;
};

export class OrderRepository {
  async create(doc: OrderCreateInput): Promise<{ _id: mongoose.Types.ObjectId }> {
    const row = await Order.create(doc);
    return { _id: row._id };
  }

  async findById(orderId: string): Promise<OrderLean | null> {
    if (!mongoose.isValidObjectId(orderId)) return null;
    const row = await Order.findById(orderId).lean();
    return row as OrderLean | null;
  }

  async findMany(params: {
    status?: string;
    skip: number;
    limit: number;
  }): Promise<OrderLean[]> {
    const q: Record<string, unknown> = {};
    if (params.status) q.status = params.status;
    const rows = await Order.find(q)
      .sort({ createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .lean();
    return rows as OrderLean[];
  }

  async count(params: { status?: string }): Promise<number> {
    const q: Record<string, unknown> = {};
    if (params.status) q.status = params.status;
    return Order.countDocuments(q);
  }

  async findByOrderReferenceForWaCustomer(
    customerWaPhone: string,
    orderReference: string,
  ): Promise<OrderLean | null> {
    const row = await Order.findOne({
      customerWaPhone: customerWaPhone.trim(),
      orderReference: orderReference.trim().toUpperCase(),
    }).lean();
    return row as OrderLean | null;
  }

  async updateById(orderId: string, patch: OrderPatchInput): Promise<boolean> {
    if (!mongoose.isValidObjectId(orderId)) return false;
    const res = await Order.updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: patch },
    );
    return res.modifiedCount > 0 || res.matchedCount > 0;
  }
}
