import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";

export class UploadRoutes {
  private router = Router();

  constructor() {
    const controller = new UploadController();
    this.router.post(
      "/cloudinary/catalog-image",
      authenticate,
      controller.cloudinaryCatalogSignature,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
