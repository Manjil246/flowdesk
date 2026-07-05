/** Default NPR delivery when a product has no explicit fee. */
export const DEFAULT_DELIVERY_CHARGE_NPR = 150;

export type ProductDeliverySettings = {
  freeDelivery: boolean;
  deliveryCharge: number;
};

/**
 * One delivery per order: use the highest fee among unique products
 * (free-delivery products contribute 0).
 */
export function maxDeliveryChargeForProducts(
  products: Iterable<ProductDeliverySettings>,
  defaultCharge = DEFAULT_DELIVERY_CHARGE_NPR,
): number {
  let maxCharge = 0;
  for (const product of products) {
    if (product.freeDelivery) continue;
    const charge = product.deliveryCharge ?? defaultCharge;
    if (charge > maxCharge) maxCharge = charge;
  }
  return maxCharge;
}
