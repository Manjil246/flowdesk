import type mongoose from "mongoose";

export type OrderLineItemInput = {
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderCreateInput = {
  orderReference: string;
  conversationId: mongoose.Types.ObjectId;
  customerWaPhone: string;
  customerOrderPhone: string;
  deliveryLocation: string;
  locationVerified: boolean;
  currency: string;
  lineItems: OrderLineItemInput[];
  itemsSubtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  status?: string;
  tags?: string[];
  trackingReference?: string | null;
  dispatchNotes?: string | null;
  paymentNotes?: string | null;
  adminNotes?: string | null;
};

export type OrderPatchInput = {
  status?: string;
  tags?: string[];
  trackingReference?: string | null;
  dispatchNotes?: string | null;
  paymentNotes?: string | null;
  adminNotes?: string | null;
};
