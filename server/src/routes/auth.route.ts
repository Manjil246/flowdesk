import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validationMiddleware";
import { AuthService } from "../services/auth.service";
import { loginBodySchema } from "../validationSchemas/auth.VSchema";

export class AuthRoutes {
  private router = Router();

  constructor() {
    const controller = new AuthController(new AuthService());

    this.router.post(
      "/login",
      validateBody(loginBodySchema),
      controller.login,
    );
    this.router.post("/logout", controller.logout);
    this.router.get("/me", authenticate, controller.me);
  }

  public getRouter(): Router {
    return this.router;
  }
}
