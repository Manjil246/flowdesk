import type { Request, Response } from "express";
import {
  processIncomingWebhook,
  verifyWebhookSubscription,
  type WhatsAppWebhookBody,
} from "../webhook";

/**
 * GET /webhook — Meta subscription verification.
 */
export function verifyWebhook(req: Request, res: Response): void {
  const result = verifyWebhookSubscription(req);
  if (result.ok) {
    res.status(200).type("text/plain").send(result.challenge);
    return;
  }
  res.sendStatus(403);
}

/**
 * POST /webhook — Meta event delivery (messages, statuses, …).
 */
export function receiveWebhook(req: Request, res: Response): void {
  const body = req.body as WhatsAppWebhookBody;

  res.status(200).send("EVENT_RECEIVED");

  setImmediate(() => {
    try {
      processIncomingWebhook(body);
    } catch (err) {
      console.error("[webhook] post-process error:", err);
    }
  });
}
