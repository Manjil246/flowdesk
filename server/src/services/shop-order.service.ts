import mongoose from "mongoose";
import { SHOP_DELIVERY_CHARGE_NPR } from "../constants/shop-orders";
import { maxDeliveryChargeForProducts } from "../lib/delivery-charge";
import type { ICatalogApiService } from "../interfaces/catalog-api.service.interface";
import { ConversationRepository } from "../repositories/conversation.repository";
import { OrderRepository } from "../repositories/order.repository";
import type { OrderLineItemInput, OrderCreateInput, OrderPatchInput } from "../repositories/order.types";
import type { OrderPatchBody } from "../validationSchemas/order.VSchema";
import type { OrderLean } from "../repositories/order.repository";
import type { SaveShopOrderToolArgs } from "../schemas/shop-order-tool-args";
import type { CreateWebOrderBody } from "../validationSchemas/shop.VSchema";
import type { CreateAdminOrderBody } from "../validationSchemas/order.VSchema";
import { BadRequestError, DbNotReadyError, NotFoundError } from "../errors/service.errors";
import { isMongoReady } from "../lib/db-ready";
import { newOrderReference } from "../utils/order-reference";
import {
  customerOrderStatusLabel,
  toCustomerOrderStatus,
  type CustomerOrderStatus,
} from "../utils/customer-order-status";
import {
  describeInvalidAdminStatusTransition,
  isAllowedAdminStatusTransition,
  shouldDeductStockOnTransition,
  shouldRestoreStockOnTransition,
  type OrderStatus,
} from "../utils/order-status-transitions";
import { VariantStockRepository } from "../repositories/variant-stock.repository";
import { normalizeWaPhone } from "../utils/phone";

function isDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  );
}

type CartLineInput = {
  productId: string;
  colorId: string;
  size: string;
  quantity: number;
};

async function resolveLineItems(
  catalog: ICatalogApiService,
  items: CartLineInput[],
): Promise<{ lineItems: OrderLineItemInput[]; itemsSubtotal: number; productIds: string[] }> {
  const lineItems: OrderLineItemInput[] = [];
  let itemsSubtotal = 0;
  const productIds: string[] = [];

  for (const item of items) {
    const detail = await catalog.getProductDetail(item.productId);
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
      stockRow.price != null ? stockRow.price : detail.product.sellingPrice;
    const lineTotal = unitPrice * item.quantity;
    itemsSubtotal += lineTotal;
    productIds.push(item.productId);

    lineItems.push({
      productId: item.productId,
      productName: detail.product.name,
      colorId: item.colorId,
      colorName: color.colorName || "—",
      imageUrl: color.imageUrl?.trim() || "",
      size: item.size.trim(),
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    });
  }

  return { lineItems, itemsSubtotal, productIds };
}

async function computeDeliveryCharge(
  catalog: ICatalogApiService,
  productIds: string[],
): Promise<number> {
  const seen = new Set<string>();
  const products: Array<{ freeDelivery: boolean; deliveryCharge: number }> = [];

  for (const productId of productIds) {
    if (seen.has(productId)) continue;
    seen.add(productId);
    const detail = await catalog.getProductDetail(productId);
    products.push({
      freeDelivery: detail.product.freeDelivery,
      deliveryCharge: detail.product.deliveryCharge,
    });
  }

  return maxDeliveryChargeForProducts(products);
}

async function persistOrder(
  orderRepository: OrderRepository,
  baseDoc: Omit<OrderCreateInput, "orderReference">,
): Promise<{ orderId: string; orderReference: string }> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const orderReference = newOrderReference();
    try {
      const { _id } = await orderRepository.create({
        ...baseDoc,
        orderReference,
      });
      return { orderId: String(_id), orderReference };
    } catch (e: unknown) {
      if (isDuplicateKey(e) && attempt < 9) continue;
      throw e;
    }
  }
  throw new BadRequestError("Could not allocate unique order reference");
}

export class ShopOrderService {
  constructor(
    private readonly catalog: ICatalogApiService,
    private readonly orderRepository: OrderRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly variantStockRepository: VariantStockRepository,
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

    const { lineItems, itemsSubtotal } = await resolveLineItems(
      this.catalog,
      args.items,
    );

    const deliveryCharge = SHOP_DELIVERY_CHARGE_NPR;
    const grandTotal = itemsSubtotal + deliveryCharge;

    const baseDoc = {
      source: "whatsapp" as const,
      conversationId: new mongoose.Types.ObjectId(conversationId),
      customerWaPhone,
      customerOrderPhone: args.customerOrderPhone,
      deliveryLocation: args.deliveryLocation,
      deliveryZipCode: args.deliveryZipCode?.trim() || null,
      deliveryLocationLat: args.deliveryLocationLat ?? null,
      deliveryLocationLng: args.deliveryLocationLng ?? null,
      locationVerified: args.locationVerified,
      currency: args.currency ?? "NPR",
      lineItems,
      itemsSubtotal,
      deliveryCharge,
      grandTotal,
      status: "order_placed" as const,
      tags: [] as string[],
    };

    const { orderId, orderReference } = await persistOrder(
      this.orderRepository,
      baseDoc,
    );
    return {
      orderId,
      orderReference,
      itemsSubtotal,
      deliveryCharge,
      grandTotal,
      currency: args.currency ?? "NPR",
    };
  }

  async createFromWeb(body: CreateWebOrderBody): Promise<{
    orderReference: string;
    status: CustomerOrderStatus;
    itemsSubtotal: number;
    deliveryCharge: number;
    grandTotal: number;
    currency: string;
  }> {
    if (!isMongoReady()) throw new DbNotReadyError();

    const { lineItems, itemsSubtotal, productIds } = await resolveLineItems(
      this.catalog,
      body.items,
    );
    const deliveryCharge = await computeDeliveryCharge(this.catalog, productIds);
    const grandTotal = itemsSubtotal + deliveryCharge;

    const deliveryParts = [
      body.street,
      body.city,
      body.district,
      body.province,
      body.zipCode,
    ].filter(Boolean);

    const baseDoc = {
      source: "web" as const,
      conversationId: null,
      customerWaPhone: null,
      customerEmail: body.email,
      customerName: `${body.firstName} ${body.lastName}`.trim(),
      customerOrderPhone: body.phone,
      deliveryLocation: deliveryParts.join(", "),
      deliveryStreet: body.street || null,
      deliveryCity: body.city || null,
      deliveryDistrict: body.district || null,
      deliveryProvince: body.province || null,
      deliveryCustomerNotes: body.notes || null,
      deliveryZipCode: body.zipCode || null,
      deliveryLocationLat: body.deliveryLocationLat ?? null,
      deliveryLocationLng: body.deliveryLocationLng ?? null,
      locationVerified: body.locationVerified,
      currency: "NPR",
      lineItems,
      itemsSubtotal,
      deliveryCharge,
      grandTotal,
      status: "order_placed" as const,
      tags: [] as string[],
    };

    const { orderReference } = await persistOrder(this.orderRepository, baseDoc);

    return {
      orderReference,
      status: "pending",
      itemsSubtotal,
      deliveryCharge,
      grandTotal,
      currency: "NPR",
    };
  }

  async createFromAdmin(body: CreateAdminOrderBody): Promise<{
    orderId: string;
    orderReference: string;
    itemsSubtotal: number;
    deliveryCharge: number;
    grandTotal: number;
    currency: string;
  }> {
    if (!isMongoReady()) throw new DbNotReadyError();

    const { lineItems, itemsSubtotal, productIds } = await resolveLineItems(
      this.catalog,
      body.items,
    );
    const deliveryCharge = await computeDeliveryCharge(this.catalog, productIds);
    const grandTotal = itemsSubtotal + deliveryCharge;

    const deliveryParts = [
      body.street,
      body.city,
      body.district,
      body.province,
      body.zipCode,
    ].filter(Boolean);

    const baseDoc = {
      source: "admin" as const,
      conversationId: null,
      customerWaPhone: null,
      customerEmail: body.email ?? null,
      customerName: body.customerName,
      customerOrderPhone: body.phone,
      deliveryLocation: deliveryParts.join(", "),
      deliveryStreet: body.street || null,
      deliveryCity: body.city || null,
      deliveryDistrict: body.district || null,
      deliveryProvince: body.province || null,
      deliveryCustomerNotes: body.notes || null,
      deliveryZipCode: body.zipCode || null,
      deliveryLocationLat: null,
      deliveryLocationLng: null,
      locationVerified: false,
      currency: "NPR",
      lineItems,
      itemsSubtotal,
      deliveryCharge,
      grandTotal,
      status: "order_placed" as const,
      tags: body.tags ?? [],
      adminNotes: body.adminNotes || null,
    };

    const { orderId, orderReference } = await persistOrder(
      this.orderRepository,
      baseDoc,
    );

    return {
      orderId,
      orderReference,
      itemsSubtotal,
      deliveryCharge,
      grandTotal,
      currency: "NPR",
    };
  }

  async trackForWebCustomer(
    orderReference: string,
    email: string,
  ): Promise<Record<string, unknown>> {
    if (!isMongoReady()) throw new DbNotReadyError();

    const row = await this.orderRepository.findByOrderReferenceAndEmail(
      orderReference,
      email,
    );
    if (!row) {
      throw new NotFoundError("No order found with these details");
    }

    const customerStatus = toCustomerOrderStatus(
      typeof row.status === "string" ? row.status : undefined,
    );
    const lineItems = (row.lineItems as Array<Record<string, unknown>>) ?? [];

    return {
      orderReference: row.orderReference,
      status: customerStatus,
      statusLabel: customerOrderStatusLabel(customerStatus),
      customerName: row.customerName ?? null,
      deliveryLocation: row.deliveryLocation,
      deliveryZipCode: row.deliveryZipCode ?? null,
      itemsSubtotal: row.itemsSubtotal,
      deliveryCharge: row.deliveryCharge,
      grandTotal: row.grandTotal,
      currency: row.currency,
      lineItems: lineItems.map((li) => ({
        productName: li.productName,
        colorName: li.colorName,
        size: li.size,
        quantity: li.quantity,
        lineTotal: li.lineTotal,
      })),
      placedAt: row.createdAt ?? null,
    };
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
    const row = await this.orderRepository.findById(orderId);
    if (!row) return null;
    return this.enrichOrderLineImages(row);
  }

  private async enrichOrderLineImages(order: OrderLean): Promise<OrderLean> {
    const rawItems = (order.lineItems as OrderLineItemInput[]) ?? [];
    const needsImage = rawItems.filter((li) => !li.imageUrl?.trim());
    const uniqueProductIds = [
      ...new Set(needsImage.map((li) => li.productId)),
    ];

    const detailByProductId = new Map<string, Awaited<
      ReturnType<ICatalogApiService["getProductDetail"]>
    >>();
    await Promise.all(
      uniqueProductIds.map(async (productId) => {
        try {
          const detail = await this.catalog.getProductDetail(productId);
          detailByProductId.set(productId, detail);
        } catch {
          /* keep line without image */
        }
      }),
    );

    const lineItems = rawItems.map((li) => {
      if (li.imageUrl?.trim()) return li;
      const detail = detailByProductId.get(li.productId);
      const color = detail?.colors.find((c) => c.id === li.colorId);
      return {
        ...li,
        imageUrl: color?.imageUrl?.trim() || "",
      };
    });
    return { ...order, lineItems };
  }

  private async deductStockForOrder(lineItems: OrderLineItemInput[]): Promise<void> {
    const applied: OrderLineItemInput[] = [];
    for (const item of lineItems) {
      const row = await this.variantStockRepository.decrementStock(
        item.colorId,
        item.size,
        item.quantity,
      );
      if (!row) {
        for (const prev of applied) {
          await this.variantStockRepository.incrementStock(
            prev.colorId,
            prev.size,
            prev.quantity,
          );
        }
        throw new BadRequestError(
          `Insufficient stock for ${item.productName} / ${item.colorName} / ${item.size}`,
        );
      }
      applied.push(item);
    }
  }

  private async restoreStockForOrder(lineItems: OrderLineItemInput[]): Promise<void> {
    for (const item of lineItems) {
      await this.variantStockRepository.incrementStock(
        item.colorId,
        item.size,
        item.quantity,
      );
    }
  }

  async patchForAdmin(orderId: string, patch: OrderPatchBody): Promise<boolean> {
    if (!isMongoReady()) throw new DbNotReadyError();
    const clean: OrderPatchInput = {};
    let existing: OrderLean | null = null;
    if (patch.status !== undefined) {
      existing = await this.orderRepository.findById(orderId);
      if (!existing) throw new NotFoundError("Order not found");
      const from = typeof existing.status === "string" ? existing.status : undefined;
      const to = patch.status as OrderStatus;
      if (!isAllowedAdminStatusTransition(from, to)) {
        throw new BadRequestError(describeInvalidAdminStatusTransition(from, to));
      }
      clean.status = patch.status;
    }
    if (patch.tags !== undefined) clean.tags = patch.tags;
    if (patch.itemsSubtotal !== undefined) clean.itemsSubtotal = patch.itemsSubtotal;
    if (patch.deliveryCharge !== undefined) clean.deliveryCharge = patch.deliveryCharge;
    if (patch.grandTotal !== undefined) clean.grandTotal = patch.grandTotal;
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

    if (patch.status !== undefined && existing) {
      const from = typeof existing.status === "string" ? existing.status : undefined;
      const to = patch.status as OrderStatus;
      const lineItems = (existing.lineItems as OrderLineItemInput[]) ?? [];
      if (shouldDeductStockOnTransition(from, to)) {
        await this.deductStockForOrder(lineItems);
      } else if (shouldRestoreStockOnTransition(from, to)) {
        await this.restoreStockForOrder(lineItems);
      }
    }

    const ok = await this.orderRepository.updateById(orderId, clean);
    if (!ok) throw new NotFoundError("Order not found");
    return true;
  }
}
