import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { CatalogService } from "../services/catalog.service";
import { CategoryRepository } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ProductColorRepository } from "../repositories/product-color.repository";
import { VariantStockRepository } from "../repositories/variant-stock.repository";
import {
  validateBody,
  validateParams,
  validateQueryParams,
} from "../middlewares/validationMiddleware";
import {
  categoryCreateBodySchema,
  categoryIdParamsSchema,
  categoryListQuerySchema,
  categoryPatchBodySchema,
} from "../validationSchemas/catalog.VSchema";

export class CategoryRoutes {
  private router = Router();

  constructor() {
    const catalogService = new CatalogService(
      new CategoryRepository(),
      new ProductRepository(),
      new ProductColorRepository(),
      new VariantStockRepository(),
    );
    const controller = new CategoryController(catalogService);

    this.router.get(
      "/",
      validateQueryParams(categoryListQuerySchema),
      controller.listCategories,
    );
    this.router.post(
      "/",
      validateBody(categoryCreateBodySchema),
      controller.createCategory,
    );
    this.router.get(
      "/:categoryId",
      validateParams(categoryIdParamsSchema),
      controller.getCategory,
    );
    this.router.patch(
      "/:categoryId",
      validateParams(categoryIdParamsSchema),
      validateBody(categoryPatchBodySchema),
      controller.updateCategory,
    );
    this.router.delete(
      "/:categoryId",
      validateParams(categoryIdParamsSchema),
      controller.deleteCategory,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
