import { Router } from "express";
import { receiveWebhook, verifyWebhook } from "../controllers/webhook.controller";

export class WebhookRoutes {
  private router = Router();

  constructor() {
    this.router.get("/", verifyWebhook);
    this.router.post("/", receiveWebhook);
  }

  public getRouter(): Router {
    return this.router;
  }
}
