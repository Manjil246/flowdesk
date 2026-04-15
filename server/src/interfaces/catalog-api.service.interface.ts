import type {
  CategoryCreateBody,
  CategoryListQuery,
  CategoryPatchBody,
  ProductColorCreateBody,
  ProductColorPatchBody,
  ProductCreateBody,
  ProductCreateFullBody,
  ProductListQuery,
  ProductPatchBody,
  VariantStockPutBody,
} from "../validationSchemas/catalog.VSchema";

export type CategoryDto = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductDto = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  occasions: string[];
  fabric: string;
  basePrice: number;
  currency: string;
  allowedSizes: string[];
  active: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductColorDto = {
  id: string;
  productId: string;
  colorName: string;
  colorNameEn: string;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type VariantStockDto = {
  id: string;
  variantId: string;
  productId: string;
  size: string;
  /** Row price; `null` means inherit product `basePrice` in clients. */
  price: number | null;
  stock: number;
  isAvailable: boolean;
  lowStockThreshold: number | null;
  sku: string | null;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductColorWithStockDto = ProductColorDto & {
  stock: VariantStockDto[];
};

export type ProductDetailDto = {
  product: ProductDto;
  colors: ProductColorWithStockDto[];
};

export interface ICatalogApiService {
  listCategories(query: CategoryListQuery): Promise<CategoryDto[]>;
  getCategory(categoryId: string): Promise<CategoryDto>;
  createCategory(body: CategoryCreateBody): Promise<CategoryDto>;
  updateCategory(
    categoryId: string,
    body: CategoryPatchBody,
  ): Promise<CategoryDto>;
  deleteCategory(categoryId: string): Promise<void>;

  listProducts(query: ProductListQuery): Promise<ProductDto[]>;
  getProduct(productId: string): Promise<ProductDto>;
  getProductDetail(productId: string): Promise<ProductDetailDto>;
  createProduct(body: ProductCreateBody): Promise<ProductDto>;
  /** Atomically create product, colors, and all variant stock rows (validated grid). */
  createProductFull(body: ProductCreateFullBody): Promise<ProductDetailDto>;
  updateProduct(productId: string, body: ProductPatchBody): Promise<ProductDto>;
  deleteProduct(productId: string): Promise<void>;

  listColors(productId: string): Promise<ProductColorDto[]>;
  createColor(
    productId: string,
    body: ProductColorCreateBody,
  ): Promise<ProductColorDto>;
  getColor(productId: string, colorId: string): Promise<ProductColorDto>;
  updateColor(
    productId: string,
    colorId: string,
    body: ProductColorPatchBody,
  ): Promise<ProductColorDto>;
  deleteColor(productId: string, colorId: string): Promise<void>;

  listStock(
    productId: string,
    colorId: string,
  ): Promise<VariantStockDto[]>;
  replaceStock(
    productId: string,
    colorId: string,
    body: VariantStockPutBody,
  ): Promise<VariantStockDto[]>;
}
