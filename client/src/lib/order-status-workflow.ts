import type { OrderStatus } from "@/lib/api/orders";

/** All statuses (e.g. filters); fulfillment order is defined by `MAIN_FLOW`. */
export const ORDER_STATUS_VALUES: OrderStatus[] = [
  "order_placed",
  "payment_confirmed",
  "dispatched",
  "delivered",
  "cancelled",
];

export function orderStatusLabel(status: OrderStatus): string {
  return status.replace(/_/g, " ");
}

const MAIN_FLOW: OrderStatus[] = [
  "order_placed",
  "payment_confirmed",
  "dispatched",
  "delivered",
];

function mainIndex(status: OrderStatus): number | null {
  const i = MAIN_FLOW.indexOf(status);
  return i >= 0 ? i : null;
}

export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === "cancelled" || current === "delivered") return [];

  const out: OrderStatus[] = [];
  const i = mainIndex(current);
  if (i != null) {
    if (i > 0) out.push(MAIN_FLOW[i - 1]!);
    if (i < MAIN_FLOW.length - 1) out.push(MAIN_FLOW[i + 1]!);
    // Cancel is allowed until the order is marked delivered (matches server rules).
    if (current !== "delivered") out.push("cancelled");
  }
  return out;
}

export function isAllowedStatusChange(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return getAllowedNextStatuses(from).includes(to);
}

/** For UI copy / styling of allowed transition targets. */
export function getStatusActionKind(
  current: OrderStatus,
  target: OrderStatus,
): "forward" | "backward" | "cancel" {
  if (target === "cancelled") return "cancel";
  const a = mainIndex(current);
  const b = mainIndex(target);
  if (a != null && b != null && b < a) return "backward";
  return "forward";
}
