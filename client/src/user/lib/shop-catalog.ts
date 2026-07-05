import {
  fetchProductDetail,
  type ProductDetailDto,
} from '@/lib/api/catalog';
import { fetchProductPickerOptions } from '@/lib/catalog-picker';

export type ShopProductListItem = {
  id: string;
  name: string;
  mrp: number;
  sellingPrice: number;
  currency: string;
  imageUrl: string;
  sortOrder: number;
};

export type ShopSizeOption = {
  stockId: string;
  size: string;
  price: number;
  stock: number;
  isAvailable: boolean;
};

export type ShopColorOption = {
  id: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
  sizes: ShopSizeOption[];
};

export type ShopProductDetail = {
  id: string;
  name: string;
  description: string;
  fabric: string;
  occasions: string[];
  mrp: number;
  sellingPrice: number;
  currency: string;
  freeDelivery: boolean;
  deliveryCharge: number;
  colors: ShopColorOption[];
};

function mapDetailToShopProduct(detail: ProductDetailDto): ShopProductDetail {
  const { product } = detail;
  const colors: ShopColorOption[] = detail.colors
    .filter((c) => c.active)
    .map((c) => ({
      id: c.id,
      colorName: c.colorName,
      hexCode: c.hexCode || "#888888",
      imageUrl: c.imageUrl,
      sizes: c.stock
        .filter((s) => s.active && s.isAvailable)
        .map((s) => ({
          stockId: s.id,
          size: s.size,
          price: s.price ?? product.sellingPrice,
          stock: s.stock,
          isAvailable: s.isAvailable,
        })),
    }))
    .filter((c) => c.sizes.length > 0);

  const hasFreeDelivery =
    Boolean(product.freeDelivery) || product.deliveryCharge === 0;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    fabric: product.fabric,
    occasions: product.occasions,
    mrp: product.mrp,
    sellingPrice: product.sellingPrice,
    currency: product.currency,
    freeDelivery: hasFreeDelivery,
    deliveryCharge: hasFreeDelivery ? 0 : product.deliveryCharge,
    colors,
  };
}

export async function fetchShopProductList(): Promise<ShopProductListItem[]> {
  const products = await fetchProductPickerOptions();
  return products
    .filter((p) => p.imageUrl)
    .map((p) => ({
      id: p.id,
      name: p.name,
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      currency: p.currency,
      imageUrl: p.imageUrl,
      sortOrder: p.sortOrder,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function fetchShopProduct(
  productId: string,
): Promise<ShopProductDetail | null> {
  const detail = await fetchProductDetail(productId).catch(() => null);
  if (!detail || !detail.product.active) return null;
  const mapped = mapDetailToShopProduct(detail);
  if (mapped.colors.length === 0) return null;
  return mapped;
}

export function sortShopProducts(
  items: ShopProductListItem[],
  sort: string,
): ShopProductListItem[] {
  const result = [...items];
  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.sellingPrice - b.sellingPrice);
      break;
    case 'price_desc':
      result.sort((a, b) => b.sellingPrice - a.sellingPrice);
      break;
    case 'newest':
      result.reverse();
      break;
    default:
      break;
  }
  return result;
}
