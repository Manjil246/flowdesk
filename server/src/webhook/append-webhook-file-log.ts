import { appendFileSync, mkdirSync } from "fs";
import path from "path";

const logDir = path.join(__dirname, "logs");
const logFile = path.join(logDir, "webhook-incoming.log");

/** Append a multi-line block (e.g. webhook summary) under one timestamp header. */
export function appendWebhookFileBlock(block: string): void {
  try {
    mkdirSync(logDir, { recursive: true });
    appendFileSync(
      logFile,
      `\n=== ${new Date().toISOString()} ===\n${block}\n`,
      "utf8",
    );
  } catch {
    // ignore
  }
}
