const base = () =>
  (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export type ConversationDto = {
  id: string;
  phone: string;
  contactName: string;
  lastMessageText: string;
  lastMessageAt: string | null;
  unreadCount: number;
  botMode: boolean;
  isArchived: boolean;
};

export type MessageDto = {
  id: string;
  messageId: string;
  text: string;
  timestamp: string;
  isInbound: boolean;
  from: string;
  status: string;
  type: string;
  mediaRef?: string | null;
  mediaUrl?: string | null;
};

export async function fetchConversations(): Promise<ConversationDto[]> {
  const url = `${base()}/api/v1/conversations`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.error === "string" ? err.error : `HTTP ${res.status}`,
    );
  }
  const data = (await res.json()) as { conversations: ConversationDto[] };
  return data.conversations ?? [];
}

export async function fetchConversationMessages(
  conversationId: string,
): Promise<MessageDto[]> {
  const url = `${base()}/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.error === "string" ? err.error : `HTTP ${res.status}`,
    );
  }
  const data = (await res.json()) as { messages: MessageDto[] };
  return data.messages ?? [];
}

export type SendTextResponse = {
  waMessageId: string;
  id: string;
};

export async function sendConversationText(
  conversationId: string,
  body: { text: string; senderRole?: "admin" | "bot" },
): Promise<SendTextResponse> {
  const url = `${base()}/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: body.text,
      ...(body.senderRole ? { senderRole: body.senderRole } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
    );
  }
  return data as SendTextResponse;
}

export async function markConversationAsRead(
  conversationId: string,
): Promise<void> {
  const url = `${base()}/api/v1/conversations/${encodeURIComponent(conversationId)}/read`;
  const res = await fetch(url, { method: "PATCH" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
    );
  }
}
