import type { Request, Response } from "express";
import type { IConversationApiService } from "../interfaces/conversation-api.service.interface";
import type {
  ConversationIdParams,
  ConversationListQuery,
  ConversationMessagesQuery,
} from "../validationSchemas/conversation.VSchema";
import { DbNotReadyError, NotFoundError } from "../errors/service.errors";

export class ConversationController {
  constructor(private readonly conversationService: IConversationApiService) {}

  listConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.validatedQuery as ConversationListQuery;
      const conversations = await this.conversationService.listConversations(
        query,
      );
      res.json({ conversations });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[conversations] list", e);
      res.status(500).json({ error: "Failed to load conversations" });
    }
  };

  getConversationMessages = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { conversationId } = req.validatedParams as ConversationIdParams;
      const query = req.validatedQuery as ConversationMessagesQuery;
      const messages =
        await this.conversationService.getMessagesForConversation(
          conversationId,
          query,
        );
      res.json({ messages });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[conversations] messages", e);
      res.status(500).json({ error: "Failed to load messages" });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.validatedParams as ConversationIdParams;
      await this.conversationService.markConversationAsRead(conversationId);
      res.status(200).json({ unreadCount: 0 });
    } catch (e) {
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      console.error("[conversations] markAsRead", e);
      res.status(500).json({ error: "Failed to mark as read" });
    }
  };
}
