export type OrderStatus =
  | "order_placed"
  | "payment_confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";

const MAIN_FLOW: OrderStatus[] = [
  "order_placed",
  "payment_confirmed",
  "dispatched",
  "delivered",
];

const isMainStatus = (s: string): s is OrderStatus =>
  (MAIN_FLOW as readonly string[]).includes(s);

export function isAllowedAdminStatusTransition(
  from: string | undefined | null,
  to: OrderStatus,
): boolean {
  if (!from || from === to) return true;
  if (from === "cancelled" || from === "delivered") return false;
  if (to === "cancelled") {
    // Cancel is allowed from any non-terminal fulfillment state, but not after delivery.
    return isMainStatus(from);
  }

  if (!isMainStatus(from) || !isMainStatus(to)) return false;

  const i = MAIN_FLOW.indexOf(from);
  const j = MAIN_FLOW.indexOf(to);
  if (i < 0 || j < 0) return false;

  // Forward one step, or back one step to correct mistakes (not a free jump).
  return j === i + 1 || j === i - 1;
}

/** Reserve inventory when admin approves (order_placed → payment_confirmed). */
export function shouldDeductStockOnTransition(
  from: string | undefined | null,
  to: OrderStatus,
): boolean {
  return from === "order_placed" && to === "payment_confirmed";
}

/** Return inventory when approval is undone or order is cancelled after stock was taken. */
export function shouldRestoreStockOnTransition(
  from: string | undefined | null,
  to: OrderStatus,
): boolean {
  if (!from) return false;
  if (to === "cancelled") {
    return from === "payment_confirmed" || from === "dispatched";
  }
  return from === "payment_confirmed" && to === "order_placed";
}

export function describeInvalidAdminStatusTransition(
  from: string | undefined | null,
  to: OrderStatus,
): string {
  if (from === "cancelled") {
    return "Cancelled orders cannot change status.";
  }
  if (from === "delivered") {
    return "Delivered orders cannot change status.";
  }
  if (to === "cancelled") {
    return "This order cannot be cancelled from its current status.";
  }
  return "That status change is not allowed. Move one step forward, go back one step, or cancel (when available).";
}
