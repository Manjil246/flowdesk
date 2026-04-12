import type { Request } from "express";
import { VERIFY_TOKEN } from "../config/imports";
import { getQueryString } from "../utils/querystring";

export type WebhookVerifyResult =
  | { ok: true; challenge: string }
  | { ok: false };

/**
 * Validates Meta's GET /webhook subscription handshake (hub.mode, hub.verify_token, hub.challenge).
 */
export function verifyWebhookSubscription(req: Request): WebhookVerifyResult {
  const mode = getQueryString(req.query, "hub.mode");
  const token = getQueryString(req.query, "hub.verify_token");
  const challenge = getQueryString(req.query, "hub.challenge");

  if (
    mode === "subscribe" &&
    token !== undefined &&
    challenge !== undefined &&
    VERIFY_TOKEN !== "" &&
    token === VERIFY_TOKEN
  ) {
    return { ok: true, challenge };
  }

  return { ok: false };
}
