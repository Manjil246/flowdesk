import type { Request, Response } from "express";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
} from "../errors/service.errors";
import type { ShopOrderService } from "../services/shop-order.service";
import type {
  OrderIdParams,
  OrderListQuery,
  OrderPatchBody,
} from "../validationSchemas/order.VSchema";

export class OrderController {
  constructor(private readonly shopOrderService: ShopOrderService) {}

  listOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const q = req.validatedQuery as OrderListQuery;
      const { orders, total } = await this.shopOrderService.listForAdmin({
        status: q.status,
        skip: q.skip,
        limit: q.limit,
      });
      res.json({ orders, total, skip: q.skip, limit: q.limit });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[orders] list", e);
      res.status(500).json({ error: "Failed to load orders" });
    }
  };

  getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.validatedParams as OrderIdParams;
      const order = await this.shopOrderService.getOneForAdmin(orderId);
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      res.json({ order });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[orders] get", e);
      res.status(500).json({ error: "Failed to load order" });
    }
  };

  patchOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.validatedParams as OrderIdParams;
      const body = req.body as OrderPatchBody;
      await this.shopOrderService.patchForAdmin(orderId, body);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[orders] patch", e);
      res.status(500).json({ error: "Failed to update order" });
    }
  };
}
