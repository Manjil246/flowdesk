import { Router } from "express";
import { HealthCheckController } from "../controllers/healthCheckup.controller";
import { HealthCheckService } from "../services/healthCheck.service";
import { HealthCheckRepository } from "../repositories/healthCheck.repository";
import { validateQueryParams } from "../middlewares/validationMiddleware";
import { healthCheckQuerySchema } from "../validationSchemas/healthCheck.VSchema";

export class HealthCheckRoutes {
  private router: Router;
  private healthCheckController: HealthCheckController;

  constructor() {
    this.router = Router();
    const healthCheckRepository = new HealthCheckRepository();
    const healthCheckService = new HealthCheckService(healthCheckRepository);
    this.healthCheckController = new HealthCheckController(healthCheckService);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      validateQueryParams(healthCheckQuerySchema),
      this.healthCheckController.healthCheck,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
