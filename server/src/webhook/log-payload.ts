import type { WhatsAppWebhookBody } from "./types";
import { appendWebhookFileBlock } from "./append-webhook-file-log";

/** Persist incoming POST /webhook summary to `webhook/logs/webhook-incoming.log` only. */
export function logWebhookPayload(body: WhatsAppWebhookBody): void {
  const objectType = body.object ?? "(missing)";
  const entries = body.entry ?? [];

  const lines: string[] = [
    `[webhook] POST object=${objectType} entries=${entries.length}`,
  ];

  for (const ent of entries) {
    const changes = ent.changes ?? [];
    for (const ch of changes) {
      const field = ch.field ?? "?";
      const value = ch.value;
      const msgCount = value?.messages?.length ?? 0;
      const statusCount = value?.statuses?.length ?? 0;
      lines.push(
        `  change field=${field} messages=${msgCount} statuses=${statusCount} phone_number_id=${value?.metadata?.phone_number_id ?? "n/a"}`,
      );
    }
  }

  appendWebhookFileBlock(lines.join("\n"));
}
