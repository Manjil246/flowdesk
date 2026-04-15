import type { Request, Response } from "express";
import { BadRequestError } from "../errors/service.errors";
import { createCatalogImageUploadPayload } from "../lib/cloudinary-sign";

export class UploadController {
  /** Signed params for direct browser upload to Cloudinary (catalog images). */
  cloudinaryCatalogSignature = async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const payload = createCatalogImageUploadPayload();
      res.json(payload);
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[uploads] cloudinary signature", e);
      res.status(500).json({ error: "Failed to create upload signature" });
    }
  };
}
