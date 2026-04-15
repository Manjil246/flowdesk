import mongoose from "mongoose";
import { SHOP_DELIVERY_CHARGE_NPR } from "../constants/shop-orders";
import type { ICatalogApiService } from "../interfaces/catalog-api.service.interface";
import { ConversationRepository } from "../repositories/conversation.repository";
import { OrderRepository } from "../repositories/order.repository";
import type { OrderLineItemInput, OrderPatchInput } from "../repositories/order.types";
import type { OrderPatchBody } from "../validationSchemas/order.VSchema";
import type { OrderLean } from "../repositories/order.repository";
import type { SaveShopOrderToolArgs } from "../schemas/shop-order-tool-args";
import { BadRequestError, DbNotReadyError, NotFoundError } from "../errors/service.errors";
import { isMongoReady } from "../lib/db-ready";
import { newOrderReference } from "../utils/order-reference";
import {
  describeInvalidAdminStatusTransition,
  isAllowedAdminStatusTransition,
  type OrderStatus,
} from "../utils/order-status-transitions";
import { normalizeWaPhone } from "../utils/phone";

function isDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  );
}

export class ShopOrderService {
  constructor(
    private readonly catalog: ICatalogApiService,
    private readonly orderRepository: OrderRepository,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async createFromBotTool(
    conversationId: string,
    args: SaveShopOrderToolArgs,
  ): Promise<{
    orderId: string;
    orderReference: string;
    itemsSubtotal: number;
    deliveryCharge: number;
    grandTotal: number;
    currency: string;
  }> {
    if (!isMongoReady()) throw new DbNotReadyError();

    const rawWa =
      await this.conversationRepository.findPhoneByConversationId(
        conversationId,
      );
    if (!rawWa) {
      throw new NotFoundError("Conversation not found");
    }
    const customerWaPhone = normalizeWaPhone(rawWa);
    if (!customerWaPhone) {
      throw new NotFoundError("Conversation not found");
    }

    const lineItems: OrderLineItemInput[] = [];
    let itemsSubtotal = 0;

    for (const item of args.items) {
      const detail = await this.catalog.getProductDetail(item.productId);
      const color = detail.colors.find((c) => c.id === item.colorId);
      if (!color) {
        throw new BadRequestError(`Invalid color for product ${item.productId}`);
      }
      const stockRow = color.stock.find(
        (s) => s.size.trim() === item.size.trim(),
      );
      if (!stockRow) {
        throw new BadRequestError(
          `Size "${item.size}" not available for this color`,
        );
      }
      if (!stockRow.isAvailable || stockRow.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient or unavailable stock for ${detail.product.name} / ${color.colorName} / ${item.size}`,
        );
      }

      const unitPrice =
        stockRow.price != null ? stockRow.price : detail.product.basePrice;
      const lineTotal = unitPrice * item.quantity;
      itemsSubtotal += lineTotal;

      lineItems.push({
        productId: item.productId,
        productName: detail.product.name,
        colorId: item.colorId,
        colorName: color.colorName || color.colorNameEn || "—",
        size: item.size.trim(),
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    const deliveryCharge = SHOP_DELIVERY_CHARGE_NPR;
    const grandTotal = itemsSubtotal + deliveryCharge;

    const baseDoc = {
      conversationId: new mongoose.Types.ObjectId(conversationId),
      customerWaPhone,
      customerOrderPhone: args.customerOrderPhone,
      deliveryLocation: args.deliveryLocation,
      locationVerified: args.locationVerified,
      currency: args.currency ?? "NPR",
      lineItems,
      itemsSubtotal,
      deliveryCharge,
      grandTotal,
      status: "order_placed" as const,
      tags: [] as string[],
    };

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const orderReference = newOrderReference();
      try {
        const { _id } = await this.orderRepository.create({
          ...baseDoc,
          orderReference,
        });
        return {
          orderId: String(_id),
          orderReference,
          itemsSubtotal,
          deliveryCharge,
          grandTotal,
          currency: args.currency ?? "NPR",
        };
      } catch (e: unknown) {
        if (isDuplicateKey(e) && attempt < 9) continue;
        throw e;
      }
    }
    throw new BadRequestError("Could not allocate unique order reference");
  }

  /**
   * Order lookup for the current WhatsApp customer only (matches `customerWaPhone` on the order).
   */
  async getOrderStatusForCustomer(
    conversationId: string,
    orderReference: string,
  ): Promise<
    | { ok: true; order: Record<string, unknown> }
    | { ok: false; error: string }
  > {
    if (!isMongoReady()) throw new DbNotReadyError();
    const wa =
      await this.conversationRepository.findPhoneByConversationId(
        conversationId,
      );
    if (!wa) return { ok: false, error: "conversation_not_found" };
    const phone = normalizeWaPhone(wa);
    const row = await this.orderRepository.findByOrderReferenceForWaCustomer(
      phone,
      orderReference,
    );
    if (!row) return { ok: false, error: "order_not_found_or_not_yours" };

    const lineItems = (row.lineItems as Array<Record<string, unknown>>) ?? [];
    const publicLines = lineItems.map((li) => ({
      productName: li.productName,
      quantity: li.quantity,
      size: li.size,
      colorName: li.colorName,
      lineTotal: li.lineTotal,
    }));

    return {
      ok: true,
      order: {
        orderReference: row.orderReference,
        status: row.status,
        grandTotal: row.grandTotal,
        currency: row.currency,
        itemsSubtotal: row.itemsSubtotal,
        deliveryCharge: row.deliveryCharge,
        lineItems: publicLines,
        trackingReference: row.trackingReference ?? null,
        placedAt: row.createdAt ?? null,
      },
    };
  }

  async listForAdmin(params: {
    status?: string;
    skip: number;
    limit: number;
  }): Promise<{ orders: OrderLean[]; total: number }> {
    if (!isMongoReady()) throw new DbNotReadyError();
    const [orders, total] = await Promise.all([
      this.orderRepository.findMany(params),
      this.orderRepository.count({ status: params.status }),
    ]);
    return { orders, total };
  }

  async getOneForAdmin(orderId: string): Promise<OrderLean | null> {
    if (!isMongoReady()) throw new DbNotReadyError();
    return this.orderRepository.findById(orderId);
  }

  async patchForAdmin(orderId: string, patch: OrderPatchBody): Promise<boolean> {
    if (!isMongoReady()) throw new DbNotReadyError();
    const clean: OrderPatchInput = {};
    if (patch.status !== undefined) {
      const existing = await this.orderRepository.findById(orderId);
      if (!existing) throw new NotFoundError("Order not found");
      const from = typeof existing.status === "string" ? existing.status : undefined;
      const to = patch.status as OrderStatus;
      if (!isAllowedAdminStatusTransition(from, to)) {
        throw new BadRequestError(describeInvalidAdminStatusTransition(from, to));
      }
      clean.status = patch.status;
    }
    if (patch.tags !== undefined) clean.tags = patch.tags;
    if (patch.trackingReference !== undefined) {
      clean.trackingReference = patch.trackingReference;
    }
    if (patch.dispatchNotes !== undefined) {
      clean.dispatchNotes = patch.dispatchNotes;
    }
    if (patch.paymentNotes !== undefined) {
      clean.paymentNotes = patch.paymentNotes;
    }
    if (patch.adminNotes !== undefined) clean.adminNotes = patch.adminNotes;
    if (Object.keys(clean).length === 0) return true;
    const ok = await this.orderRepository.updateById(orderId, clean);
    if (!ok) throw new NotFoundError("Order not found");
    return true;
  }
}
