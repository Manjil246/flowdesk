import mongoose from "mongoose";
import type { ICatalogApiService } from "../interfaces/catalog-api.service.interface";
import type {
  CategoryDto,
  ProductColorDto,
  ProductColorWithStockDto,
  ProductDetailDto,
  ProductDto,
  VariantStockDto,
} from "../interfaces/catalog-api.service.interface";
import { CategoryRepository } from "../repositories/category.repository";
import type { CategoryLean } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import type { ProductLean } from "../repositories/product.repository";
import { ProductColorRepository } from "../repositories/product-color.repository";
import type { ProductColorLean } from "../repositories/product-color.repository";
import { VariantStockRepository } from "../repositories/variant-stock.repository";
import type { VariantStockLean } from "../repositories/variant-stock.repository";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
} from "../errors/service.errors";
import { isMongoReady } from "../lib/db-ready";
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

function iso(d?: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toISOString();
}

export class CatalogService implements ICatalogApiService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly productColorRepository: ProductColorRepository,
    private readonly variantStockRepository: VariantStockRepository,
  ) {}

  async listCategories(query: CategoryListQuery): Promise<CategoryDto[]> {
    this.assertDb();
    const rows = await this.categoryRepository.findMany({
      active: query.active,
      skip: query.skip,
      limit: query.limit,
    });
    return rows.map((r) => this.toCategoryDto(r));
  }

  async getCategory(categoryId: string): Promise<CategoryDto> {
    this.assertDb();
    const row = await this.categoryRepository.findById(categoryId);
    if (!row) throw new NotFoundError("Category not found");
    return this.toCategoryDto(row);
  }

  async createCategory(body: CategoryCreateBody): Promise<CategoryDto> {
    this.assertDb();
    const nextOrder = (await this.categoryRepository.getMaxSortOrder()) + 1;
    const row = await this.categoryRepository.create({
      name: body.name,
      description: body.description,
      active: body.active,
      sortOrder: nextOrder,
    });
    return this.toCategoryDto(row);
  }

  async updateCategory(
    categoryId: string,
    body: CategoryPatchBody,
  ): Promise<CategoryDto> {
    this.assertDb();
    const row = await this.categoryRepository.updateById(categoryId, body);
    if (!row) throw new NotFoundError("Category not found");
    return this.toCategoryDto(row);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    this.assertDb();
    const n = await this.productRepository.countByCategoryId(categoryId);
    if (n > 0) {
      throw new BadRequestError(
        "Cannot delete category while products reference it",
      );
    }
    const ok = await this.categoryRepository.deleteById(categoryId);
    if (!ok) throw new NotFoundError("Category not found");
  }

  async listProducts(query: ProductListQuery): Promise<ProductDto[]> {
    this.assertDb();
    const rows = await this.productRepository.findMany({
      categoryId: query.categoryId,
      active: query.active,
      search: query.search,
      skip: query.skip,
      limit: query.limit,
    });
    return rows.map((r) => this.toProductDto(r));
  }

  async getProduct(productId: string): Promise<ProductDto> {
    this.assertDb();
    const row = await this.productRepository.findById(productId);
    if (!row) throw new NotFoundError("Product not found");
    return this.toProductDto(row);
  }

  async getProductDetail(productId: string): Promise<ProductDetailDto> {
    this.assertDb();
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");
    const colors = await this.productColorRepository.findByProductId(productId);
    const withStock: ProductColorWithStockDto[] = await Promise.all(
      colors.map(async (c) => {
        const stockRows = await this.variantStockRepository.findByVariantId(
          String(c._id),
        );
        return {
          ...this.toProductColorDto(c),
          stock: stockRows.map((s) => this.toVariantStockDto(s)),
        };
      }),
    );
    return {
      product: this.toProductDto(product),
      colors: withStock,
    };
  }

  async createProduct(body: ProductCreateBody): Promise<ProductDto> {
    this.assertDb();
    const cat = await this.categoryRepository.findById(body.categoryId);
    if (!cat) throw new BadRequestError("Invalid categoryId");
    const row = await this.productRepository.create({
      categoryId: new mongoose.Types.ObjectId(body.categoryId),
      name: body.name,
      description: body.description,
      occasions: body.occasions,
      fabric: body.fabric,
      basePrice: body.basePrice,
      currency: body.currency,
      allowedSizes: body.allowedSizes,
      active: body.active,
      sortOrder: body.sortOrder,
    });
    return this.toProductDto(row);
  }

  async createProductFull(
    body: ProductCreateFullBody,
  ): Promise<ProductDetailDto> {
    this.assertDb();
    const cat = await this.categoryRepository.findById(body.categoryId);
    if (!cat) throw new BadRequestError("Invalid categoryId");

    let productId: string | null = null;
    try {
      const product = await this.productRepository.create({
        categoryId: new mongoose.Types.ObjectId(body.categoryId),
        name: body.name,
        description: body.description,
        occasions: body.occasions,
        fabric: body.fabric,
        basePrice: body.basePrice,
        currency: body.currency,
        allowedSizes: body.allowedSizes,
        active: body.active,
        sortOrder: body.sortOrder,
      });
      productId = String(product._id);

      const keyToVariantId = new Map<string, string>();
      for (let i = 0; i < body.colors.length; i++) {
        const col = body.colors[i];
        const row = await this.productColorRepository.create({
          productId: new mongoose.Types.ObjectId(productId),
          colorName: col.colorName,
          colorNameEn: col.colorNameEn,
          imageUrl: col.imageUrl,
          active: col.active,
          sortOrder: i,
        });
        keyToVariantId.set(col.clientKey, String(row._id));
      }

      const combosByColor = new Map<string, ProductCreateFullBody["combinations"]>();
      for (const row of body.combinations) {
        const list = combosByColor.get(row.colorClientKey);
        if (list) list.push(row);
        else combosByColor.set(row.colorClientKey, [row]);
      }

      const sizeRank = new Map(body.allowedSizes.map((s, idx) => [s, idx]));
      for (const col of body.colors) {
        const variantId = keyToVariantId.get(col.clientKey);
        if (!variantId) continue;
        const rows = combosByColor.get(col.clientKey) ?? [];
        rows.sort(
          (a, b) => (sizeRank.get(a.size) ?? 0) - (sizeRank.get(b.size) ?? 0),
        );
        await this.variantStockRepository.replaceForVariant(
          variantId,
          productId,
          rows.map((item) => ({
            size: item.size,
            price: item.price,
            stock: item.stock,
            isAvailable: item.isAvailable,
            lowStockThreshold: item.lowStockThreshold ?? null,
            sku: item.sku ?? null,
            active: item.active,
          })),
        );
      }

      return this.getProductDetail(productId);
    } catch (e) {
      if (productId) {
        try {
          await this.deleteProduct(productId);
        } catch (rollbackErr) {
          console.error("[catalog] createProductFull rollback", rollbackErr);
        }
      }
      throw e;
    }
  }

  async updateProduct(
    productId: string,
    body: ProductPatchBody,
  ): Promise<ProductDto> {
    this.assertDb();
    if (body.categoryId) {
      const cat = await this.categoryRepository.findById(body.categoryId);
      if (!cat) throw new BadRequestError("Invalid categoryId");
    }
    const patch: Parameters<ProductRepository["updateById"]>[1] = {};
    if (body.categoryId !== undefined) {
      patch.categoryId = new mongoose.Types.ObjectId(body.categoryId);
    }
    if (body.name !== undefined) patch.name = body.name;
    if (body.description !== undefined) patch.description = body.description;
    if (body.occasions !== undefined) patch.occasions = body.occasions;
    if (body.fabric !== undefined) patch.fabric = body.fabric;
    if (body.basePrice !== undefined) patch.basePrice = body.basePrice;
    if (body.currency !== undefined) patch.currency = body.currency;
    if (body.allowedSizes !== undefined) patch.allowedSizes = body.allowedSizes;
    if (body.active !== undefined) patch.active = body.active;
    if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder;
    const row = await this.productRepository.updateById(productId, patch);
    if (!row) throw new NotFoundError("Product not found");
    return this.toProductDto(row);
  }

  async deleteProduct(productId: string): Promise<void> {
    this.assertDb();
    const exists = await this.productRepository.findById(productId);
    if (!exists) throw new NotFoundError("Product not found");
    await this.variantStockRepository.deleteManyByProductId(productId);
    await this.productColorRepository.deleteManyByProductId(productId);
    await this.productRepository.deleteById(productId);
  }

  async listColors(productId: string): Promise<ProductColorDto[]> {
    this.assertDb();
    const p = await this.productRepository.findById(productId);
    if (!p) throw new NotFoundError("Product not found");
    const rows = await this.productColorRepository.findByProductId(productId);
    return rows.map((r) => this.toProductColorDto(r));
  }

  async createColor(
    productId: string,
    body: ProductColorCreateBody,
  ): Promise<ProductColorDto> {
    this.assertDb();
    const p = await this.productRepository.findById(productId);
    if (!p) throw new NotFoundError("Product not found");
    const row = await this.productColorRepository.create({
      productId: new mongoose.Types.ObjectId(productId),
      colorName: body.colorName,
      colorNameEn: body.colorNameEn,
      imageUrl: body.imageUrl,
      active: body.active,
      sortOrder: body.sortOrder,
    });
    return this.toProductColorDto(row);
  }

  async getColor(productId: string, colorId: string): Promise<ProductColorDto> {
    this.assertDb();
    const row = await this.productColorRepository.findByIdAndProductId(
      colorId,
      productId,
    );
    if (!row) throw new NotFoundError("Color not found");
    return this.toProductColorDto(row);
  }

  async updateColor(
    productId: string,
    colorId: string,
    body: ProductColorPatchBody,
  ): Promise<ProductColorDto> {
    this.assertDb();
    const existing = await this.productColorRepository.findByIdAndProductId(
      colorId,
      productId,
    );
    if (!existing) throw new NotFoundError("Color not found");
    const row = await this.productColorRepository.updateById(colorId, body);
    if (!row) throw new NotFoundError("Color not found");
    return this.toProductColorDto(row);
  }

  async deleteColor(productId: string, colorId: string): Promise<void> {
    this.assertDb();
    const existing = await this.productColorRepository.findByIdAndProductId(
      colorId,
      productId,
    );
    if (!existing) throw new NotFoundError("Color not found");
    await this.variantStockRepository.deleteManyByVariantId(colorId);
    await this.productColorRepository.deleteById(colorId);
  }

  async listStock(
    productId: string,
    colorId: string,
  ): Promise<VariantStockDto[]> {
    this.assertDb();
    await this.ensureColor(productId, colorId);
    const rows = await this.variantStockRepository.findByVariantId(colorId);
    return rows.map((r) => this.toVariantStockDto(r));
  }

  async replaceStock(
    productId: string,
    colorId: string,
    body: VariantStockPutBody,
  ): Promise<VariantStockDto[]> {
    this.assertDb();
    const color = await this.ensureColor(productId, colorId);
    const rows = await this.variantStockRepository.replaceForVariant(
      colorId,
      String(color.productId),
      body.items.map((item) => ({
        size: item.size,
        price:
          item.price === undefined || item.price === null
            ? null
            : item.price,
        stock: item.stock,
        isAvailable: item.isAvailable,
        lowStockThreshold: item.lowStockThreshold ?? null,
        sku: item.sku ?? null,
        active: item.active,
      })),
    );
    return rows.map((r) => this.toVariantStockDto(r));
  }

  private async ensureColor(
    productId: string,
    colorId: string,
  ): Promise<ProductColorLean> {
    const row = await this.productColorRepository.findByIdAndProductId(
      colorId,
      productId,
    );
    if (!row) throw new NotFoundError("Color not found");
    return row;
  }

  private assertDb(): void {
    if (!isMongoReady()) throw new DbNotReadyError();
  }

  private toCategoryDto(r: CategoryLean): CategoryDto {
    return {
      id: String(r._id),
      name: r.name,
      description: r.description ?? "",
      active: r.active ?? true,
      sortOrder: r.sortOrder ?? 0,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  private toProductDto(r: ProductLean): ProductDto {
    return {
      id: String(r._id),
      categoryId: String(r.categoryId),
      name: r.name,
      description: r.description ?? "",
      occasions: r.occasions ?? [],
      fabric: r.fabric ?? "",
      basePrice: r.basePrice,
      currency: r.currency ?? "NPR",
      allowedSizes: r.allowedSizes ?? [],
      active: r.active ?? true,
      sortOrder: r.sortOrder ?? 0,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  private toProductColorDto(r: ProductColorLean): ProductColorDto {
    return {
      id: String(r._id),
      productId: String(r.productId),
      colorName: r.colorName,
      colorNameEn: r.colorNameEn ?? "",
      imageUrl: r.imageUrl,
      active: r.active ?? true,
      sortOrder: r.sortOrder ?? 0,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  private toVariantStockDto(r: VariantStockLean): VariantStockDto {
    return {
      id: String(r._id),
      variantId: String(r.variantId),
      productId: String(r.productId),
      size: r.size,
      price: r.price === undefined || r.price === null ? null : r.price,
      stock: r.stock,
      isAvailable: r.isAvailable,
      lowStockThreshold:
        r.lowStockThreshold === undefined ? null : r.lowStockThreshold,
      sku: r.sku === undefined ? null : r.sku,
      active: r.active ?? true,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }
}
