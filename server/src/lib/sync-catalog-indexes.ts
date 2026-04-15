import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { ProductColor } from "../models/product-color.model";
import { VariantStock } from "../models/variant-stock.model";

/**
 * Aligns collection indexes with current Mongoose schemas (drops stale indexes
 * such as legacy `slug_1` after slug fields were removed).
 */
export async function syncCatalogModelIndexes(): Promise<void> {
  await Promise.all([
    Category.syncIndexes(),
    Product.syncIndexes(),
    ProductColor.syncIndexes(),
    VariantStock.syncIndexes(),
  ]);
}
