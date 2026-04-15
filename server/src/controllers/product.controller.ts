import type { Request, Response } from "express";
import type { ICatalogApiService } from "../interfaces/catalog-api.service.interface";
import type {
  ProductColorCreateBody,
  ProductColorParams,
  ProductColorPatchBody,
  ProductCreateBody,
  ProductCreateFullBody,
  ProductIdParams,
  ProductListQuery,
  ProductPatchBody,
  VariantStockPutBody,
} from "../validationSchemas/catalog.VSchema";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
} from "../errors/service.errors";

export class ProductController {
  constructor(private readonly catalogService: ICatalogApiService) {}

  listProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.validatedQuery as ProductListQuery;
      const products = await this.catalogService.listProducts(query);
      res.json({ products });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[products] list", e);
      res.status(500).json({ error: "Failed to load products" });
    }
  };

  getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.validatedParams as ProductIdParams;
      const product = await this.catalogService.getProduct(productId);
      res.json({ product });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] get", e);
      res.status(500).json({ error: "Failed to load product" });
    }
  };

  getProductDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.validatedParams as ProductIdParams;
      const detail = await this.catalogService.getProductDetail(productId);
      res.json(detail);
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] detail", e);
      res.status(500).json({ error: "Failed to load product detail" });
    }
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as ProductCreateBody;
      const product = await this.catalogService.createProduct(body);
      res.status(201).json({ product });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[products] create", e);
      res.status(500).json({ error: "Failed to create product" });
    }
  };

  createProductFull = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as ProductCreateFullBody;
      const detail = await this.catalogService.createProductFull(body);
      res.status(201).json(detail);
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[products] create full", e);
      res.status(500).json({ error: "Failed to create product" });
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.validatedParams as ProductIdParams;
      const body = req.body as ProductPatchBody;
      const product = await this.catalogService.updateProduct(productId, body);
      res.json({ product });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[products] update", e);
      res.status(500).json({ error: "Failed to update product" });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.validatedParams as ProductIdParams;
      await this.catalogService.deleteProduct(productId);
      res.status(204).send();
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] delete", e);
      res.status(500).json({ error: "Failed to delete product" });
    }
  };

  listColors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.validatedParams as ProductIdParams;
      const colors = await this.catalogService.listColors(productId);
      res.json({ colors });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] colors list", e);
      res.status(500).json({ error: "Failed to load colors" });
    }
  };

  createColor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.validatedParams as ProductIdParams;
      const body = req.body as ProductColorCreateBody;
      const color = await this.catalogService.createColor(productId, body);
      res.status(201).json({ color });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[products] colors create", e);
      res.status(500).json({ error: "Failed to create color" });
    }
  };

  getColor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, colorId } = req.validatedParams as ProductColorParams;
      const color = await this.catalogService.getColor(productId, colorId);
      res.json({ color });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] colors get", e);
      res.status(500).json({ error: "Failed to load color" });
    }
  };

  updateColor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, colorId } = req.validatedParams as ProductColorParams;
      const body = req.body as ProductColorPatchBody;
      const color = await this.catalogService.updateColor(
        productId,
        colorId,
        body,
      );
      res.json({ color });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[products] colors update", e);
      res.status(500).json({ error: "Failed to update color" });
    }
  };

  deleteColor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, colorId } = req.validatedParams as ProductColorParams;
      await this.catalogService.deleteColor(productId, colorId);
      res.status(204).send();
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] colors delete", e);
      res.status(500).json({ error: "Failed to delete color" });
    }
  };

  listStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, colorId } = req.validatedParams as ProductColorParams;
      const stock = await this.catalogService.listStock(productId, colorId);
      res.json({ stock });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] stock list", e);
      res.status(500).json({ error: "Failed to load stock" });
    }
  };

  replaceStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, colorId } = req.validatedParams as ProductColorParams;
      const body = req.body as VariantStockPutBody;
      const stock = await this.catalogService.replaceStock(
        productId,
        colorId,
        body,
      );
      res.json({ stock });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[products] stock replace", e);
      res.status(500).json({ error: "Failed to save stock" });
    }
  };
}
