import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { ShopOrderService } from "../services/shop-order.service";
import { CatalogService } from "../services/catalog.service";
import { CategoryRepository } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ProductColorRepository } from "../repositories/product-color.repository";
import { VariantStockRepository } from "../repositories/variant-stock.repository";
import { OrderRepository } from "../repositories/order.repository";
import { ConversationRepository } from "../repositories/conversation.repository";
import {
  validateBody,
  validateParams,
  validateQueryParams,
} from "../middlewares/validationMiddleware";
import {
  orderIdParamsSchema,
  orderListQuerySchema,
  orderPatchBodySchema,
} from "../validationSchemas/order.VSchema";

export class OrderRoutes {
  private router = Router();

  constructor() {
    const catalogService = new CatalogService(
      new CategoryRepository(),
      new ProductRepository(),
      new ProductColorRepository(),
      new VariantStockRepository(),
    );
    const shopOrderService = new ShopOrderService(
      catalogService,
      new OrderRepository(),
      new ConversationRepository(),
    );
    const controller = new OrderController(shopOrderService);

    this.router.get(
      "/",
      validateQueryParams(orderListQuerySchema),
      controller.listOrders,
    );
    this.router.get(
      "/:orderId",
      validateParams(orderIdParamsSchema),
      controller.getOrder,
    );
    this.router.patch(
      "/:orderId",
      validateParams(orderIdParamsSchema),
      validateBody(orderPatchBodySchema),
      controller.patchOrder,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
