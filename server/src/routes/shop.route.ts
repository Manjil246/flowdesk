import { Router } from "express";
import { ShopController } from "../controllers/shop.controller";
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
  validateQueryParams,
} from "../middlewares/validationMiddleware";
import {
  createWebOrderBodySchema,
  reverseGeocodeQuerySchema,
  trackWebOrderQuerySchema,
} from "../validationSchemas/shop.VSchema";

export class ShopRoutes {
  private router: Router;
  private controller: ShopController;

  constructor() {
    this.router = Router();
    const variantStockRepository = new VariantStockRepository();
    const catalogService = new CatalogService(
      new CategoryRepository(),
      new ProductRepository(),
      new ProductColorRepository(),
      variantStockRepository,
    );
    const shopOrderService = new ShopOrderService(
      catalogService,
      new OrderRepository(),
      new ConversationRepository(),
      variantStockRepository,
    );
    this.controller = new ShopController(shopOrderService);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/reverse-geocode",
      validateQueryParams(reverseGeocodeQuerySchema),
      this.controller.reverseGeocode,
    );
    this.router.post(
      "/orders",
      validateBody(createWebOrderBodySchema),
      this.controller.createOrder,
    );
    this.router.get(
      "/orders/track",
      validateQueryParams(trackWebOrderQuerySchema),
      this.controller.trackOrder,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
