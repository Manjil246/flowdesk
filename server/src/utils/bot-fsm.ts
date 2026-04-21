import type { BotSessionLean } from "../repositories/bot-session.repository";

export type FsmState =
  | "PRODUCT_NOT_SELECTED"
  | "PRODUCT_SELECTED"
  | "SIZE_SELECTED"
  | "COLOR_SELECTED"
  | "IMAGE_SENT"
  | "CHECKOUT_AWAITING_LOCATION"
  | "CHECKOUT_AWAITING_PHONE"
  | "CHECKOUT_CONFIRMING"
  | "ORDER_PLACED";

export function deriveFsmState(session: BotSessionLean): FsmState {
  if (session.orderPlacedAt) return "ORDER_PLACED";
  if (
    session.cart?.length > 0 &&
    session.checkoutStarted &&
    !session.checkoutLocation &&
    !session.checkoutPhone &&
    session.productDetail === null
  ) {
    return "CHECKOUT_AWAITING_LOCATION";
  }
  if (session.checkoutLocation && !session.checkoutPhone) {
    return "CHECKOUT_AWAITING_PHONE";
  }
  if (session.checkoutLocation && session.checkoutPhone) {
    return "CHECKOUT_CONFIRMING";
  }
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
    "view_cart",
    "remove_from_cart",
    "initiate_checkout",
    "get_order_status",
    "restart_shopping",
  ],
  PRODUCT_SELECTED: [
    "select_size",
    "select_product",
    "browse_products",
    "browse_categories",
    "change_product",
    "view_cart",
    "remove_from_cart",
    "initiate_checkout",
    "restart_shopping",
    "get_order_status",
  ],
  SIZE_SELECTED: [
    "select_color",
    "select_size",
    "select_product",
    "browse_categories",
    "change_product",
    "view_cart",
    "remove_from_cart",
    "initiate_checkout",
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
    "view_cart",
    "remove_from_cart",
    "initiate_checkout",
    "restart_shopping",
    "get_order_status",
  ],
  IMAGE_SENT: [
    "add_to_cart",
    "view_cart",
    "initiate_checkout",
    "remove_from_cart",
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
    "view_cart",
    "restart_shopping",
  ],
  CHECKOUT_AWAITING_LOCATION: [
    "set_checkout_location",
    "view_cart",
    "restart_shopping",
  ],
  CHECKOUT_AWAITING_PHONE: [
    "set_checkout_phone",
    "view_cart",
    "restart_shopping",
  ],
  CHECKOUT_CONFIRMING: [
    "place_order",
    "view_cart",
    "restart_shopping",
  ],
};

export const REQUIRED_NEXT_TOOL_BY_STATE: Record<FsmState, string> = {
  PRODUCT_NOT_SELECTED: "select_product",
  PRODUCT_SELECTED: "select_size",
  SIZE_SELECTED: "select_color",
  COLOR_SELECTED: "send_product_image",
  IMAGE_SENT: "add_to_cart",
  CHECKOUT_AWAITING_LOCATION: "set_checkout_location",
  CHECKOUT_AWAITING_PHONE: "set_checkout_phone",
  CHECKOUT_CONFIRMING: "place_order",
  ORDER_PLACED: "browse_categories",
};
