/** Remove catalog/CDN image URLs so the customer never sees raw links in chat. */
export function stripCatalogImageUrlsForWhatsApp(text: string): string {
  let t = text.replace(
    /https?:\/\/[^\s]*(?:res\.)?cloudinary\.com[^\s]*/gi,
    "",
  );
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

/** Strip internal trace/debug blocks that must never be customer-visible. */
export function stripInternalBlocks(text: string): string {
  return text.replace(/\[toolTrace[\s\S]*?(?=\n\n|$)/g, "").trim();
}

/** Final text sanitizer for outbound WhatsApp content. */
export function sanitizeWhatsAppText(text: string): string {
  let t = stripInternalBlocks(text);
  t = stripCatalogImageUrlsForWhatsApp(t);
  return t.trim();
}
