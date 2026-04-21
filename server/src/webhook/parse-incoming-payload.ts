/** Meta Cloud API timestamp (seconds) → Date. */
export function metaTsToDate(ts: string | number | undefined): Date {
  if (ts === undefined || ts === "") return new Date();
  const n = typeof ts === "string" ? parseInt(ts, 10) : ts;
  if (Number.isNaN(n)) return new Date();
  return new Date(n * 1000);
}

export function extractMessageContent(
  msg: Record<string, unknown>,
  type: string,
): {
  text: string;
  locationData: {
    lat?: number;
    lng?: number;
    name?: string;
    address?: string;
    raw: string;
  } | null;
  mediaId: string | null;
  mediaCaption: string | null;
  interactiveReply: { buttonId: string; buttonTitle: string } | null;
  replyToMessageId: string | null;
} {
  let text = "";
  let locationData: {
    lat?: number;
    lng?: number;
    name?: string;
    address?: string;
    raw: string;
  } | null = null;
  let mediaId: string | null = null;
  let mediaCaption: string | null = null;
  let interactiveReply: { buttonId: string; buttonTitle: string } | null = null;
  let replyToMessageId: string | null = null;

  const ctx = msg.context as { id?: string } | undefined;
  if (ctx?.id) replyToMessageId = ctx.id;

  if (type === "text" && msg.text && typeof msg.text === "object") {
    text = String((msg.text as { body?: string }).body ?? "");
  } else if (type === "button" && msg.button) {
    text = String((msg.button as { text?: string }).text ?? "");
  } else if (type === "interactive" && msg.interactive) {
    const ir = msg.interactive as {
      button_reply?: { id?: string; title?: string };
      list_reply?: { id?: string; title?: string };
    };
    if (ir.button_reply) {
      interactiveReply = {
        buttonId: String(ir.button_reply.id ?? ""),
        buttonTitle: String(ir.button_reply.title ?? ""),
      };
      text = interactiveReply.buttonTitle;
    } else if (ir.list_reply) {
      interactiveReply = {
        buttonId: String(ir.list_reply.id ?? ""),
        buttonTitle: String(ir.list_reply.title ?? ""),
      };
      text = interactiveReply.buttonTitle;
    }
  }

  const mediaKeys = ["image", "video", "document", "audio", "sticker"];
  if (mediaKeys.includes(type) && msg[type] && typeof msg[type] === "object") {
    const media = msg[type] as { id?: string; caption?: string };
    mediaId = media.id ?? null;
    mediaCaption = media.caption ?? null;
    text = mediaCaption || `[${type}]`;
  }

  if (type === "location" && msg.location) {
    const loc = msg.location as {
      latitude?: number;
      longitude?: number;
      name?: string;
      address?: string;
    };
    locationData = {
      lat: loc.latitude,
      lng: loc.longitude,
      name: loc.name,
      address: loc.address,
      raw: loc.name ?? loc.address ?? `${loc.latitude ?? ""},${loc.longitude ?? ""}`,
    };
    text = locationData.raw;
  }

  return {
    text,
    locationData,
    mediaId,
    mediaCaption,
    interactiveReply,
    replyToMessageId,
  };
}
