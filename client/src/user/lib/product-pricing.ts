/** Product-level display pricing: mrp = tag price; sellingPrice = what customer pays. */
export type ProductPriceDisplay = {
  sellingPrice: number;
  mrp: number | null;
  onSale: boolean;
};

export function productPriceDisplay(
  sellingPrice: number,
  mrp?: number | null,
): ProductPriceDisplay {
  const onSale =
    mrp != null && Number.isFinite(mrp) && mrp > sellingPrice;
  return {
    sellingPrice,
    mrp: onSale ? mrp : null,
    onSale,
  };
}

/** Scale MRP when a size/color has its own selling price. */
export function scaledMrp(
  variantSellingPrice: number,
  productSellingPrice: number,
  productMrp?: number | null,
): number | null {
  if (
    productMrp == null ||
    !Number.isFinite(productMrp) ||
    productMrp <= productSellingPrice ||
    productSellingPrice <= 0
  ) {
    return null;
  }
  return Math.round((variantSellingPrice * productMrp) / productSellingPrice);
}
