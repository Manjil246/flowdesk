import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
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
import { authenticate } from "../middlewares/auth.middleware";
import {
  productColorCreateBodySchema,
  productColorParamsSchema,
  productColorPatchBodySchema,
  productCreateBodySchema,
  productCreateFullBodySchema,
  productIdParamsSchema,
  productListQuerySchema,
  productPatchBodySchema,
  productPickerQuerySchema,
  variantStockPutBodySchema,
} from "../validationSchemas/catalog.VSchema";

export class ProductRoutes {
  private router = Router();

  constructor() {
    const catalogService = new CatalogService(
      new CategoryRepository(),
      new ProductRepository(),
      new ProductColorRepository(),
      new VariantStockRepository(),
    );
    const controller = new ProductController(catalogService);

    const colorsRouter = Router({ mergeParams: true });

    this.router.get(
      "/",
      validateQueryParams(productListQuerySchema),
      controller.listProducts,
    );
    this.router.get(
      "/picker",
      validateQueryParams(productPickerQuerySchema),
      controller.listProductsForPicker,
    );
    this.router.get("/color-presets", authenticate, controller.listColorPresets);
    this.router.post(
      "/",
      authenticate,
      validateBody(productCreateBodySchema),
      controller.createProduct,
    );
    this.router.post(
      "/full",
      authenticate,
      validateBody(productCreateFullBodySchema),
      controller.createProductFull,
    );
    this.router.get(
      "/:productId/detail",
      validateParams(productIdParamsSchema),
      controller.getProductDetail,
    );
    this.router.get(
      "/:productId",
      validateParams(productIdParamsSchema),
      controller.getProduct,
    );
    this.router.patch(
      "/:productId",
      authenticate,
      validateParams(productIdParamsSchema),
      validateBody(productPatchBodySchema),
      controller.updateProduct,
    );
    this.router.delete(
      "/:productId",
      authenticate,
      validateParams(productIdParamsSchema),
      controller.deleteProduct,
    );

    colorsRouter.get(
      "/",
      authenticate,
      validateParams(productIdParamsSchema),
      controller.listColors,
    );
    colorsRouter.post(
      "/",
      authenticate,
      validateParams(productIdParamsSchema),
      validateBody(productColorCreateBodySchema),
      controller.createColor,
    );
    colorsRouter.get(
      "/:colorId/stock",
      authenticate,
      validateParams(productColorParamsSchema),
      controller.listStock,
    );
    colorsRouter.put(
      "/:colorId/stock",
      authenticate,
      validateParams(productColorParamsSchema),
      validateBody(variantStockPutBodySchema),
      controller.replaceStock,
    );
    colorsRouter.get(
      "/:colorId",
      authenticate,
      validateParams(productColorParamsSchema),
      controller.getColor,
    );
    colorsRouter.patch(
      "/:colorId",
      authenticate,
      validateParams(productColorParamsSchema),
      validateBody(productColorPatchBodySchema),
      controller.updateColor,
    );
    colorsRouter.delete(
      "/:colorId",
      authenticate,
      validateParams(productColorParamsSchema),
      controller.deleteColor,
    );

    this.router.use("/:productId/colors", colorsRouter);
  }

  public getRouter(): Router {
    return this.router;
  }
}
