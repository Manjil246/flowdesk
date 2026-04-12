/** Normalize WhatsApp phone to E.164-style with leading +. */
export function normalizeWaPhone(input: string): string {
  const t = input.trim().replace(/\s/g, "");
  if (!t) return "";
  if (t.startsWith("+")) return t;
  return `+${t}`;
}

/** Meta Cloud API `to` field: digits only, no + prefix. */
export function toWhatsAppCloudRecipientId(e164: string): string {
  return normalizeWaPhone(e164).replace(/\D/g, "");
}
