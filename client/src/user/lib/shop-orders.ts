import { apiBaseUrl } from "@/lib/api/base";

const base = apiBaseUrl;

export type CustomerOrderStatus =
  | "pending"
  | "approved"
  | "shipped"
  | "delivered"
  | "cancelled";

export type WebOrderLineItem = {
  productName: string;
  colorName: string;
  size: string;
  quantity: number;
  lineTotal: number;
};

export type CreateWebOrderPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  zipCode: string;
  notes: string;
  deliveryLocationLat?: number | null;
  deliveryLocationLng?: number | null;
  locationVerified: boolean;
  items: Array<{
    productId: string;
    colorId: string;
    size: string;
    quantity: number;
  }>;
};

export type CreateWebOrderResult = {
  orderReference: string;
  status: CustomerOrderStatus;
  itemsSubtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  currency: string;
};

export type TrackedWebOrder = {
  orderReference: string;
  status: CustomerOrderStatus;
  statusLabel: string;
  customerName: string | null;
  deliveryLocation: string;
  deliveryZipCode: string | null;
  itemsSubtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  currency: string;
  lineItems: WebOrderLineItem[];
  placedAt: string | null;
};

export async function createWebOrder(
  payload: CreateWebOrderPayload,
): Promise<CreateWebOrderResult> {
  const res = await fetch(`${base()}/api/v1/shop/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    order?: CreateWebOrderResult;
  };
  if (!res.ok) {
    throw new Error(data.error || "Failed to place order");
  }
  if (!data.order) {
    throw new Error("Invalid order response");
  }
  return data.order;
}

export async function trackWebOrder(
  orderReference: string,
  email: string,
): Promise<TrackedWebOrder> {
  const q = new URLSearchParams({
    orderReference: orderReference.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
  });
  const res = await fetch(`${base()}/api/v1/shop/orders/track?${q}`);
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    order?: TrackedWebOrder;
  };
  if (!res.ok) {
    throw new Error(data.error || "Order not found");
  }
  if (!data.order) {
    throw new Error("Invalid track response");
  }
  return data.order;
}

export const CUSTOMER_ORDER_STEPS: ReadonlyArray<{
  key: CustomerOrderStatus;
  label: string;
}> = [
  { key: "pending", label: "Pending review" },
  { key: "approved", label: "Approved" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export function customerOrderStepIndex(status: CustomerOrderStatus): number {
  if (status === "cancelled") return -1;
  const i = CUSTOMER_ORDER_STEPS.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
}
