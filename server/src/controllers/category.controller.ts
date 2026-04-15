import type { Request, Response } from "express";
import type { ICatalogApiService } from "../interfaces/catalog-api.service.interface";
import type {
  CategoryCreateBody,
  CategoryIdParams,
  CategoryListQuery,
  CategoryPatchBody,
} from "../validationSchemas/catalog.VSchema";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
} from "../errors/service.errors";

export class CategoryController {
  constructor(private readonly catalogService: ICatalogApiService) {}

  listCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.validatedQuery as CategoryListQuery;
      const categories = await this.catalogService.listCategories(query);
      res.json({ categories });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[categories] list", e);
      res.status(500).json({ error: "Failed to load categories" });
    }
  };

  getCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.validatedParams as CategoryIdParams;
      const category = await this.catalogService.getCategory(categoryId);
      res.json({ category });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[categories] get", e);
      res.status(500).json({ error: "Failed to load category" });
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as CategoryCreateBody;
      const category = await this.catalogService.createCategory(body);
      res.status(201).json({ category });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[categories] create", e);
      res.status(500).json({ error: "Failed to create category" });
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.validatedParams as CategoryIdParams;
      const body = req.body as CategoryPatchBody;
      const category = await this.catalogService.updateCategory(
        categoryId,
        body,
      );
      res.json({ category });
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
      console.error("[categories] update", e);
      res.status(500).json({ error: "Failed to update category" });
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.validatedParams as CategoryIdParams;
      await this.catalogService.deleteCategory(categoryId);
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
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[categories] delete", e);
      res.status(500).json({ error: "Failed to delete category" });
    }
  };
}
