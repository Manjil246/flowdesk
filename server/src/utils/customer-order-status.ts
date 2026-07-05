import type { OrderStatus } from "./order-status-transitions";

export type CustomerOrderStatus =
  | "pending"
  | "approved"
  | "shipped"
  | "delivered"
  | "cancelled";

export function toCustomerOrderStatus(
  status: string | undefined | null,
): CustomerOrderStatus {
  switch (status) {
    case "payment_confirmed":
      return "approved";
    case "dispatched":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "order_placed":
    default:
      return "pending";
  }
}

export function customerOrderStatusLabel(status: CustomerOrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending review";
    case "approved":
      return "Approved";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

export function adminOrderStatusLabel(status: OrderStatus | string): string {
  switch (status) {
    case "order_placed":
      return "Pending review";
    case "payment_confirmed":
      return "Approved";
    case "dispatched":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return String(status).replace(/_/g, " ");
  }
}
