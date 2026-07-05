import { adminFetch } from "@/lib/api/admin-fetch";
import { apiBaseUrl } from "@/lib/api/base";

const base = apiBaseUrl;

export type OrderStatus =
  | "order_placed"
  | "payment_confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type OrderLineItemDto = {
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  imageUrl?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderDto = {
  _id: string;
  /** Customer-facing trace id (e.g. SS-YYYYMMDD-HEX). */
  orderReference: string;
  conversationId?: string | null;
  customerWaPhone?: string | null;
  customerOrderPhone: string;
  customerEmail?: string | null;
  customerName?: string | null;
  deliveryLocation: string;
  deliveryStreet?: string | null;
  deliveryCity?: string | null;
  deliveryDistrict?: string | null;
  deliveryProvince?: string | null;
  deliveryCustomerNotes?: string | null;
  deliveryZipCode?: string | null;
  deliveryLocationLat?: number | null;
  deliveryLocationLng?: number | null;
  source?: "web" | "whatsapp" | "admin";
  locationVerified: boolean;
  currency: string;
  lineItems: OrderLineItemDto[];
  itemsSubtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  status: OrderStatus;
  tags: string[];
  trackingReference?: string | null;
  dispatchNotes?: string | null;
  paymentNotes?: string | null;
  adminNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OrdersListResponse = {
  orders: OrderDto[];
  total: number;
  skip: number;
  limit: number;
};

export async function fetchOrders(params: {
  status?: OrderStatus;
  skip?: number;
  limit?: number;
}): Promise<OrdersListResponse> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.skip != null) q.set("skip", String(params.skip));
  if (params.limit != null) q.set("limit", String(params.limit));
  const url = `${base()}/api/v1/orders${q.toString() ? `?${q}` : ""}`;
  const res = await adminFetch(url);
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || `Failed to load orders (${res.status})`);
  }
  return res.json() as Promise<OrdersListResponse>;
}

export async function fetchOrder(orderId: string): Promise<OrderDto> {
  const res = await adminFetch(`${base()}/api/v1/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || `Failed to load order (${res.status})`);
  }
  const data = (await res.json()) as { order: OrderDto };
  return data.order;
}

export async function patchOrder(
  orderId: string,
  body: {
    status?: OrderStatus;
    tags?: string[];
    itemsSubtotal?: number;
    deliveryCharge?: number;
    grandTotal?: number;
    trackingReference?: string | null;
    dispatchNotes?: string | null;
    paymentNotes?: string | null;
    adminNotes?: string | null;
  },
): Promise<void> {
  const res = await adminFetch(`${base()}/api/v1/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || `Failed to update order (${res.status})`);
  }
}

export type CreateAdminOrderPayload = {
  customerName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  district?: string;
  province: string;
  zipCode?: string;
  notes?: string;
  adminNotes?: string;
  tags?: string[];
  items: Array<{
    productId: string;
    colorId: string;
    size: string;
    quantity: number;
  }>;
};

export type CreateAdminOrderResult = {
  orderId: string;
  orderReference: string;
  itemsSubtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  currency: string;
};

export async function createAdminOrder(
  body: CreateAdminOrderPayload,
): Promise<CreateAdminOrderResult> {
  const res = await adminFetch(`${base()}/api/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || `Failed to create order (${res.status})`);
  }
  const data = (await res.json()) as { order: CreateAdminOrderResult };
  return data.order;
}
