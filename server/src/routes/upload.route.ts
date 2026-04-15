import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";

export class UploadRoutes {
  private router = Router();

  constructor() {
    const controller = new UploadController();
    this.router.post(
      "/cloudinary/catalog-image",
      controller.cloudinaryCatalogSignature,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
