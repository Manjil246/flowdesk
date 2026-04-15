import type { BotSessionLean } from "../repositories/bot-session.repository";

export type FsmState =
  | "PRODUCT_NOT_SELECTED"
  | "PRODUCT_SELECTED"
  | "SIZE_SELECTED"
  | "COLOR_SELECTED"
  | "IMAGE_SENT"
  | "ORDER_PLACED";

export function deriveFsmState(session: BotSessionLean): FsmState {
  if (session.orderPlacedAt) return "ORDER_PLACED";
  if (!session.productDetail) return "PRODUCT_NOT_SELECTED";
  if (!session.selectedSize) return "PRODUCT_SELECTED";
  if (!session.selectedColorN) return "SIZE_SELECTED";
  if (!session.imageSent) return "COLOR_SELECTED";
  return "IMAGE_SENT";
}

export const ALLOWED_TOOLS_BY_STATE: Record<FsmState, string[]> = {
  PRODUCT_NOT_SELECTED: [
    "browse_categories",
    "browse_products",
    "select_product",
    "get_order_status",
    "restart_shopping",
  ],
  PRODUCT_SELECTED: [
    "select_size",
    "select_product",
    "browse_products",
    "browse_categories",
    "change_product",
    "restart_shopping",
    "get_order_status",
  ],
  SIZE_SELECTED: [
    "select_color",
    "select_size",
    "select_product",
    "browse_categories",
    "change_product",
    "restart_shopping",
    "get_order_status",
  ],
  COLOR_SELECTED: [
    "send_product_image",
    "select_color",
    "select_size",
    "select_product",
    "browse_categories",
    "change_product",
    "restart_shopping",
    "get_order_status",
  ],
  IMAGE_SENT: [
    "place_order",
    "select_color",
    "select_size",
    "select_product",
    "browse_categories",
    "change_product",
    "restart_shopping",
    "get_order_status",
  ],
  ORDER_PLACED: [
    "browse_categories",
    "browse_products",
    "get_order_status",
    "restart_shopping",
  ],
};

export const REQUIRED_NEXT_TOOL_BY_STATE: Record<FsmState, string> = {
  PRODUCT_NOT_SELECTED: "select_product",
  PRODUCT_SELECTED: "select_size",
  SIZE_SELECTED: "select_color",
  COLOR_SELECTED: "send_product_image",
  IMAGE_SENT: "place_order",
  ORDER_PLACED: "browse_categories",
};
