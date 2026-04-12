import express, { Application } from "express";
import path from "path";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import { HealthCheckRoutes } from "./routes/healthCheck.route";
import { WebhookRoutes } from "./routes/webhook.route";
import { ConversationRoutes } from "./routes/conversation.route";
import { BACKEND_BASE_URL, FRONTEND_BASE_URL, LOCAL_DEVELOPMENT_URL } from "./config/imports";

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(cookieParser());
    const corsOptions: CorsOptions = {
      origin: [FRONTEND_BASE_URL, BACKEND_BASE_URL].filter(Boolean),
      credentials: true,
    };
    if (LOCAL_DEVELOPMENT_URL) {
      (corsOptions.origin as string[]).push(LOCAL_DEVELOPMENT_URL);
    }
    this.app.use(cors(corsOptions));
    /** Public product photos for WhatsApp `image.link` (files under `server/public/products/`). */
    this.app.use(
      "/products",
      express.static(path.join(process.cwd(), "public", "products")),
    );
  }

  private initializeRoutes(): void {
    const healthCheckRoutes = new HealthCheckRoutes();
    const webhookRoutes = new WebhookRoutes();
    const conversationRoutes = new ConversationRoutes();

    this.app.use("/webhook", webhookRoutes.getRouter());
    this.app.use("/api/v1/health-check", healthCheckRoutes.getRouter());
    this.app.use("/api/v1/conversations", conversationRoutes.getRouter());
  }

  public getApp(): Application {
    return this.app;
  }
}
