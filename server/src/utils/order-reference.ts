import crypto from "crypto";

/** Customer-facing order id, e.g. SS-20260414-A1B2C3 (unique in DB). */
export function newOrderReference(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SS-${y}${mo}${day}-${rand}`;
}
