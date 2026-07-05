import type mongoose from "mongoose";

export type OrderLineItemInput = {
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

export type OrderCreateInput = {
  orderReference: string;
  source?: "web" | "whatsapp" | "admin";
  conversationId?: mongoose.Types.ObjectId | null;
  customerWaPhone?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerOrderPhone: string;
  deliveryLocation: string;
  deliveryStreet?: string | null;
  deliveryCity?: string | null;
  deliveryDistrict?: string | null;
  deliveryProvince?: string | null;
  deliveryCustomerNotes?: string | null;
  deliveryZipCode?: string | null;
  deliveryLocationLat?: number | null;
  deliveryLocationLng?: number | null;
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
  itemsSubtotal?: number;
  deliveryCharge?: number;
  grandTotal?: number;
  trackingReference?: string | null;
  dispatchNotes?: string | null;
  paymentNotes?: string | null;
  adminNotes?: string | null;
};
