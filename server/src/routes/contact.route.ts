import { Router } from "express";
import { ContactController } from "../controllers/contact.controller";
import { ContactInquiryService } from "../services/contact-inquiry.service";
import {
  validateBody,
  validateParams,
  validateQueryParams,
} from "../middlewares/validationMiddleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  contactCreateBodySchema,
  contactIdParamsSchema,
  contactListQuerySchema,
  contactPatchBodySchema,
} from "../validationSchemas/contact.VSchema";

export class ContactRoutes {
  private router = Router();

  constructor() {
    const service = new ContactInquiryService();
    const controller = new ContactController(service);

    this.router.post(
      "/",
      validateBody(contactCreateBodySchema),
      controller.submit,
    );
    this.router.get(
      "/",
      authenticate,
      validateQueryParams(contactListQuerySchema),
      controller.listInquiries,
    );
    this.router.get(
      "/:inquiryId",
      authenticate,
      validateParams(contactIdParamsSchema),
      controller.getInquiry,
    );
    this.router.patch(
      "/:inquiryId",
      authenticate,
      validateParams(contactIdParamsSchema),
      validateBody(contactPatchBodySchema),
      controller.patchInquiry,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
