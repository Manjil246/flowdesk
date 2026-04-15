import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  ArrowLeft,
  Bot,
  User,
  Image,
  FileText,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchConversationMessages,
  fetchConversations,
  markConversationAsRead,
  sendConversationText,
  type ConversationDto,
  type MessageDto,
} from "@/lib/api/conversations";
import {
  formatMessageClock,
  formatRelativeShort,
} from "@/lib/format-chat-time";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-yellow-600",
  "bg-emerald-600",
  "bg-cyan-600",
];

function stableAvatarColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = key.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initialsFrom(name: string, phone: string): string {
  const n = name.trim();
  if (n.length >= 2) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (
        parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
      ).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-2) || "?";
}

function displayName(c: ConversationDto): string {
  return c.contactName.trim() || c.phone;
}

/** WhatsApp-style delivery ticks for outbound rows (`Message.status` from API). */
function OutboundDeliveryTicks({ status }: { status: string }) {
  const s = (status || "pending").toLowerCase();
  if (s === "failed") {
    return (
      <AlertCircle
        className="h-3.5 w-3.5 shrink-0 text-destructive"
        aria-label="Failed"
      />
    );
  }
  if (s === "read") {
    return (
      <CheckCheck
        className="h-3.5 w-3.5 shrink-0 text-sky-500"
        aria-label="Read"
      />
    );
  }
  if (s === "delivered" || s === "received") {
    return (
      <CheckCheck
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
        aria-label="Delivered"
      />
    );
  }
  if (s === "sent") {
    return (
      <Check
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
        aria-label="Sent"
      />
    );
  }
  return (
    <Clock
      className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
      aria-label="Pending"
    />
  );
}

const commonEmojis = [
  "😊",
  "😂",
  "👍",
  "🙏",
  "❤️",
  "🎉",
  "👋",
  "✅",
  "🔥",
  "💯",
  "😍",
  "🤔",
  "👏",
  "💪",
  "🙌",
  "😎",
  "🥳",
  "💡",
  "⭐",
  "🚀",
];

export default function ConversationsPage() {
  const [contacts, setContacts] = useState<ConversationDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedContact, setSelectedContact] =
    useState<ConversationDto | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messagesByConvId, setMessagesByConvId] = useState<
    Record<string, MessageDto[]>
  >({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [messageInput, setMessageInput] = useState("");
  const [botMode, setBotMode] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setListError(null);
      try {
        const rows = await fetchConversations();
        if (!cancelled) setContacts(rows);
      } catch (e) {
        if (!cancelled) {
          setListError(e instanceof Error ? e.message : "Failed to load");
          toast.error("Could not load conversations");
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMessagesFor = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const rows = await fetchConversationMessages(conversationId);
      setMessagesByConvId((prev) => ({ ...prev, [conversationId]: rows }));
    } catch (e) {
      setMessagesError(e instanceof Error ? e.message : "Failed to load");
      toast.error("Could not load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const messages: MessageDto[] = selectedContact
    ? (messagesByConvId[selectedContact.id] ?? [])
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedContact?.id]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node))
        setShowEmoji(false);
      if (attachRef.current && !attachRef.current.contains(e.target as Node))
        setShowAttach(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectContact = (contact: ConversationDto) => {
    setSelectedContact(contact);
    setShowChat(true);
    setBotMode(contact.botMode);
    setMessagesError(null);
    if (!messagesByConvId[contact.id]) {
      void loadMessagesFor(contact.id);
    }
  };

  /** After list loads, open the first conversation (API order) if none selected yet. */
  useEffect(() => {
    if (listLoading || listError) return;
    if (contacts.length === 0 || selectedContact !== null) return;
    handleSelectContact(contacts[0]!);
  }, [contacts, listLoading, listError, selectedContact, handleSelectContact]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || sendLoading) return;
    const text = messageInput.trim();
    const convId = selectedContact.id;
    const senderRole = botMode ? "bot" : "admin";
    setSendLoading(true);
    void (async () => {
      try {
        const { waMessageId, id } = await sendConversationText(convId, {
          text,
          senderRole,
        });
        const ts = new Date().toISOString();
        const newMsg: MessageDto = {
          id,
          messageId: waMessageId,
          text,
          timestamp: ts,
          isInbound: false,
          from: senderRole,
          status: "pending",
          type: "text",
        };
        setMessagesByConvId((prev) => ({
          ...prev,
          [convId]: [...(prev[convId] ?? []), newMsg],
        }));
        setContacts((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, lastMessageText: text, lastMessageAt: ts }
              : c,
          ),
        );
        setMessageInput("");
        toast.success("Message sent");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Send failed");
      } finally {
        setSendLoading(false);
      }
    })();
  };

  const markSelectedConversationAsRead = () => {
    if (!selectedContact || selectedContact.unreadCount <= 0) return;
    const id = selectedContact.id;
    setShowMoreMenu(false);
    void (async () => {
      try {
        await markConversationAsRead(id);
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
        );
        setSelectedContact((cur) =>
          cur?.id === id ? { ...cur, unreadCount: 0 } : cur,
        );
        toast.success("Marked as read");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Could not mark as read",
        );
      }
    })();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div
        className={`flex w-full min-w-0 shrink-0 flex-col border-r border-border bg-card lg:max-w-md lg:w-[min(28rem,38%)] ${showChat ? "hidden lg:flex" : "flex"}`}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {listLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Loading…
            </div>
          )}
          {!listLoading && listError && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
              <p>{listError}</p>
              <p className="text-xs">
                Check the API URL and MongoDB connection.
              </p>
            </div>
          )}
          {!listLoading && !listError && contacts.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No conversations yet
            </div>
          )}
          {!listLoading &&
            !listError &&
            contacts.map((contact) => {
              const name = displayName(contact);
              const initials = initialsFrom(contact.contactName, contact.phone);
              const color = stableAvatarColor(contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`flex w-full cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${selectedContact?.id === contact.id ? "bg-primary/5" : ""}`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${color}`}
                    >
                      {initials}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-foreground">
                        {name}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeShort(contact.lastMessageAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="truncate text-xs text-muted-foreground">
                        {contact.lastMessageText || "—"}
                      </p>
                      {contact.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {contact.unreadCount > 99
                            ? "99+"
                            : contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      <div
        className={`flex-1 flex-col ${showChat ? "flex" : "hidden lg:flex"}`}
      >
        {selectedContact ? (
          <>
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
              <button
                className="mr-1 lg:hidden"
                onClick={() => setShowChat(false)}
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${stableAvatarColor(selectedContact.id)}`}
              >
                {initialsFrom(
                  selectedContact.contactName,
                  selectedContact.phone,
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {displayName(selectedContact)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedContact.phone}
                </p>
              </div>

              <button
                onClick={() => {
                  setBotMode(!botMode);
                  toast.success(
                    botMode ? "Switched to manual mode" : "Bot resumed",
                  );
                }}
                className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors sm:flex ${botMode ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}
              >
                {botMode ? (
                  <>
                    <Bot className="h-3.5 w-3.5" /> Bot
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5" /> You
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {showMoreMenu && (
                    <div className="card-shadow modal-scale-in absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card py-1">
                      <button
                        type="button"
                        disabled={selectedContact.unreadCount <= 0}
                        onClick={markSelectedConversationAsRead}
                        className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Mark as Read
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          toast.info("Lead profile coming soon");
                        }}
                        className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        View Lead Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          toast.success("Marked as spam");
                        }}
                        className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Mark as Spam
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          toast.success("Chat archived");
                        }}
                        className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Archive Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          toast.success("Chat exported successfully");
                        }}
                        className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Export Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="wa-chat-pattern custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4 flex justify-center">
                <span className="rounded-full bg-card/80 px-4 py-1 text-xs font-medium text-muted-foreground shadow-xs">
                  Today
                </span>
              </div>
              {messagesLoading && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading messages…
                </div>
              )}
              {messagesError && !messagesLoading && (
                <div className="py-8 text-center text-sm text-destructive">
                  {messagesError}
                </div>
              )}
              {!messagesLoading && !messagesError && (
                <div className="mx-auto max-w-3xl space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isInbound ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`relative max-w-[75%] rounded-lg px-3 py-2 shadow-xs ${msg.isInbound ? "bg-wa-received text-foreground bubble-received" : "bg-wa-sent text-foreground bubble-sent"}`}
                      >
                        {msg.type === "image" && msg.mediaUrl ? (
                          <img
                            src={msg.mediaUrl}
                            alt={msg.mediaRef ?? "Product"}
                            className="mb-2 max-h-52 w-full max-w-[min(100%,260px)] rounded object-cover"
                          />
                        ) : null}
                        {msg.text?.trim() &&
                        !(
                          msg.type === "image" &&
                          msg.mediaUrl &&
                          (msg.text === msg.mediaUrl ||
                            /^\[Photo:/.test(msg.text))
                        ) ? (
                          <p className="whitespace-pre-line break-words text-sm">
                            {msg.text}
                          </p>
                        ) : null}
                        <div className="mt-1 flex items-center justify-end gap-1">
                          <span className="text-[10px] text-muted-foreground">
                            {formatMessageClock(msg.timestamp)}
                          </span>
                          {!msg.isInbound && (
                            <OutboundDeliveryTicks status={msg.status} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="flex justify-center border-t border-border bg-card py-1">
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-medium ${botMode ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}
              >
                {botMode
                  ? "🤖 Bot is handling this chat"
                  : "👤 You are handling this chat"}
              </span>
            </div>

            <div className="relative flex items-center gap-2 border-t border-border bg-card px-4 py-3">
              <div className="relative" ref={emojiRef}>
                <button
                  onClick={() => {
                    setShowEmoji(!showEmoji);
                    setShowAttach(false);
                  }}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                >
                  <Smile className="h-5 w-5" />
                </button>
                {showEmoji && (
                  <div className="card-shadow modal-scale-in absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg border border-border bg-card p-3">
                    <div className="grid grid-cols-5 gap-2">
                      {commonEmojis.map((e) => (
                        <button
                          key={e}
                          onClick={() => {
                            setMessageInput((prev) => prev + e);
                            setShowEmoji(false);
                          }}
                          className="flex items-center justify-center rounded p-1.5 text-xl transition-colors hover:bg-muted"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={attachRef}>
                <button
                  onClick={() => {
                    setShowAttach(!showAttach);
                    setShowEmoji(false);
                  }}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                {showAttach && (
                  <div className="card-shadow modal-scale-in absolute bottom-full left-0 z-50 mb-2 w-48 rounded-lg border border-border bg-card py-1">
                    <button
                      onClick={() => {
                        setShowAttach(false);
                        toast.info("Image upload coming soon");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <Image className="h-4 w-4" /> Image
                    </button>
                    <button
                      onClick={() => {
                        setShowAttach(false);
                        toast.info("Document upload coming soon");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <FileText className="h-4 w-4" /> Document
                    </button>
                    <button
                      onClick={() => {
                        setShowAttach(false);
                        toast.info("Location sharing coming soon");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <MapPin className="h-4 w-4" /> Location
                    </button>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !sendLoading && handleSendMessage()
                }
                disabled={sendLoading}
                className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground outline-hidden placeholder:text-muted-foreground disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sendLoading}
                className="btn-hover-shadow flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
