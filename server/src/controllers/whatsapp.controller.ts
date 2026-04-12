import type { Request, Response } from "express";
import type { IWhatsAppService } from "../interfaces/whatsapp.service.interface";
import type {
  ConversationIdParams,
  ConversationSendTextBody,
} from "../validationSchemas/conversation.VSchema";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
  WhatsAppApiError,
  WhatsAppConfigError,
} from "../errors/service.errors";

export class WhatsAppController {
  constructor(private readonly whatsAppService: IWhatsAppService) {}

  sendText = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.validatedParams as ConversationIdParams;
      const body = req.body as ConversationSendTextBody;
      const result = await this.whatsAppService.sendTextMessage({
        conversationId,
        text: body.text,
        senderRole: body.senderRole,
      });
      res.status(201).json({
        waMessageId: result.waMessageId,
        id: result.mongoMessageId,
      });
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
      if (e instanceof WhatsAppConfigError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof WhatsAppApiError) {
        res.status(502).json({
          error: e.message,
          graphStatus: e.httpStatus,
        });
        return;
      }
      console.error("[whatsapp] sendText", e);
      res.status(500).json({ error: "Failed to send message" });
    }
  };
}
