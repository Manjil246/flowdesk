import type { Request, Response } from "express";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
} from "../errors/service.errors";
import type { ContactInquiryService } from "../services/contact-inquiry.service";
import type {
  ContactCreateBody,
  ContactIdParams,
  ContactListQuery,
  ContactPatchBody,
} from "../validationSchemas/contact.VSchema";

export class ContactController {
  constructor(private readonly service: ContactInquiryService) {}

  submit = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as ContactCreateBody;
      const inquiry = await this.service.submit(body);
      res.status(201).json({ inquiry });
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[contact] submit", e);
      res.status(500).json({ error: "Failed to send message" });
    }
  };

  listInquiries = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.validatedQuery as ContactListQuery;
      const result = await this.service.listForAdmin(query);
      res.json(result);
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[contact] list", e);
      res.status(500).json({ error: "Failed to load contact messages" });
    }
  };

  getInquiry = async (req: Request, res: Response): Promise<void> => {
    try {
      const { inquiryId } = req.validatedParams as ContactIdParams;
      const inquiry = await this.service.getForAdmin(inquiryId);
      res.json({ inquiry });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[contact] get", e);
      res.status(500).json({ error: "Failed to load contact message" });
    }
  };

  patchInquiry = async (req: Request, res: Response): Promise<void> => {
    try {
      const { inquiryId } = req.validatedParams as ContactIdParams;
      const body = req.body as ContactPatchBody;
      const inquiry = await this.service.patchStatus(inquiryId, body.status);
      res.json({ inquiry });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[contact] patch", e);
      res.status(500).json({ error: "Failed to update contact message" });
    }
  };
}
