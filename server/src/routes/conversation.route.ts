import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { WhatsAppController } from "../controllers/whatsapp.controller";
import { ConversationApiService } from "../services/conversation.service";
import { WhatsAppService } from "../services/whatsapp.service";
import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import { WhatsAppRepository } from "../repositories/whatsapp.repository";
import {
  validateBody,
  validateParams,
  validateQueryParams,
} from "../middlewares/validationMiddleware";
import {
  conversationIdParamsSchema,
  conversationListQuerySchema,
  conversationMessagesQuerySchema,
  conversationSendTextBodySchema,
} from "../validationSchemas/conversation.VSchema";

export class ConversationRoutes {
  private router = Router();
  private conversationController: ConversationController;
  private whatsAppController: WhatsAppController;

  constructor() {
    const conversationRepository = new ConversationRepository();
    const messageRepository = new MessageRepository();
    const whatsAppRepository = new WhatsAppRepository();
    const conversationService = new ConversationApiService(
      conversationRepository,
      messageRepository,
    );
    const whatsAppService = new WhatsAppService(whatsAppRepository);
    this.conversationController = new ConversationController(
      conversationService,
    );
    this.whatsAppController = new WhatsAppController(whatsAppService);

    this.router.get(
      "/",
      validateQueryParams(conversationListQuerySchema),
      this.conversationController.listConversations,
    );
    this.router.patch(
      "/:conversationId/read",
      validateParams(conversationIdParamsSchema),
      this.conversationController.markAsRead,
    );
    this.router.get(
      "/:conversationId/messages",
      validateParams(conversationIdParamsSchema),
      validateQueryParams(conversationMessagesQuerySchema),
      this.conversationController.getConversationMessages,
    );
    this.router.post(
      "/:conversationId/messages",
      validateParams(conversationIdParamsSchema),
      validateBody(conversationSendTextBodySchema),
      this.whatsAppController.sendText,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
