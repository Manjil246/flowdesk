import { useState, useRef, useEffect } from "react";
import { Search, Phone, Video, MoreVertical, Smile, Paperclip, Send, ArrowLeft, CheckCheck, Bot, User, X, Image, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: number;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  color: string;
}

const initialContacts: Contact[] = [
  { id: 1, name: "Rahul Sharma", initials: "RS", lastMessage: "I'm interested in your product", time: "2m", unread: 3, online: true, color: "bg-blue-500" },
  { id: 2, name: "Priya Patel", initials: "PP", lastMessage: "What are the pricing plans?", time: "5m", unread: 0, online: true, color: "bg-pink-500" },
  { id: 3, name: "Amit Kumar", initials: "AK", lastMessage: "Thank you for the info!", time: "12m", unread: 0, online: false, color: "bg-orange-500" },
  { id: 4, name: "Sneha Joshi", initials: "SJ", lastMessage: "Can you send the brochure?", time: "1h", unread: 1, online: false, color: "bg-purple-500" },
  { id: 5, name: "Vikram Singh", initials: "VS", lastMessage: "Hello, I need help", time: "2h", unread: 0, online: true, color: "bg-teal-500" },
  { id: 6, name: "Neha Gupta", initials: "NG", lastMessage: "Is this still available?", time: "3h", unread: 0, online: false, color: "bg-red-500" },
  { id: 7, name: "Rohan Mehta", initials: "RM", lastMessage: "Ok sounds good", time: "Yesterday", unread: 0, online: false, color: "bg-indigo-500" },
  { id: 8, name: "Anjali Das", initials: "AD", lastMessage: "Please call me back", time: "Yesterday", unread: 0, online: false, color: "bg-yellow-600" },
];

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

const initialConversations: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Hi, I saw your ad on Instagram", sent: false, time: "10:30 AM" },
    { id: 2, text: "Hello! 👋 Welcome to FlowDesk. I'm your AI assistant. May I know your name?", sent: true, time: "10:30 AM" },
    { id: 3, text: "I'm Rahul Sharma", sent: false, time: "10:31 AM" },
    { id: 4, text: "Nice to meet you Rahul! 😊 What's your email address so we can stay in touch?", sent: true, time: "10:31 AM" },
    { id: 5, text: "rahul.sharma@gmail.com", sent: false, time: "10:32 AM" },
    { id: 6, text: "Perfect! What are you interested in?\n1️⃣ Product Demo\n2️⃣ Pricing Info\n3️⃣ General Query", sent: true, time: "10:32 AM" },
    { id: 7, text: "1", sent: false, time: "10:33 AM" },
    { id: 8, text: "Great choice! 🎯 A team member will reach out to schedule your demo. Is there anything else I can help you with?", sent: true, time: "10:33 AM" },
  ],
  2: [
    { id: 1, text: "Hi, what are your pricing plans?", sent: false, time: "11:00 AM" },
    { id: 2, text: "Hello Priya! We have 3 plans starting from ₹999/month. Would you like a detailed breakdown?", sent: true, time: "11:00 AM" },
    { id: 3, text: "Yes please!", sent: false, time: "11:02 AM" },
  ],
  3: [
    { id: 1, text: "Can you tell me more about your services?", sent: false, time: "9:00 AM" },
    { id: 2, text: "Of course! We offer WhatsApp automation, lead management, and AI chatbot services.", sent: true, time: "9:01 AM" },
    { id: 3, text: "Thank you for the info!", sent: false, time: "9:05 AM" },
  ],
};

const commonEmojis = ["😊","😂","👍","🙏","❤️","🎉","👋","✅","🔥","💯","😍","🤔","👏","💪","🙌","😎","🥳","💡","⭐","🚀"];

export default function ConversationsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(initialContacts[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  const [messageInput, setMessageInput] = useState("");
  const [botMode, setBotMode] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; contactId: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const filteredContacts = initialContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messages = selectedContact ? conversations[selectedContact.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) setShowAttach(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMoreMenu(false);
      setContextMenu(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowChat(true);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const existing = conversations[selectedContact.id] || [];
    const newMsg: Message = { id: existing.length + 1, text: messageInput, sent: true, time };
    setConversations(prev => ({ ...prev, [selectedContact.id]: [...existing, newMsg] }));
    setMessageInput("");
    toast.success("Message sent");
  };

  const handleContextMenu = (e: React.MouseEvent, contactId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, contactId });
  };

  const filteredMessages = chatSearch
    ? messages.filter(m => m.text.toLowerCase().includes(chatSearch.toLowerCase()))
    : messages;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Contact List */}
      <div className={`w-full shrink-0 border-r border-border bg-card lg:w-[35%] ${showChat ? "hidden lg:flex" : "flex"} flex-col`}>
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">No results found</div>
          )}
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              onContextMenu={(e) => handleContextMenu(e, contact.id)}
              className={`flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${selectedContact?.id === contact.id ? "bg-primary/5" : ""}`}
            >
              <div className="relative shrink-0">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${contact.color}`}>{contact.initials}</div>
                {contact.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="truncate text-xs text-muted-foreground">{contact.lastMessage}</p>
                  {contact.unread > 0 && <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{contact.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="fixed z-50 rounded-lg border border-border bg-card py-1 card-shadow modal-scale-in" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <button onClick={() => { setContextMenu(null); toast.success("Marked as read"); }} className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted">Mark as Read</button>
          <button onClick={() => { setContextMenu(null); toast.success("Chat archived"); }} className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted">Archive Chat</button>
        </div>
      )}

      {/* Chat Window */}
      <div className={`flex-1 flex-col ${showChat ? "flex" : "hidden lg:flex"}`}>
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
              <button className="lg:hidden mr-1" onClick={() => setShowChat(false)}>
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${selectedContact.color}`}>{selectedContact.initials}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{selectedContact.name}</p>
                <p className="text-xs text-primary">{selectedContact.online ? "Online" : "Offline"}</p>
              </div>

              {/* Bot/Human toggle */}
              <button
                onClick={() => { setBotMode(!botMode); toast.success(botMode ? "Switched to manual mode" : "Bot resumed"); }}
                className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${botMode ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}
              >
                {botMode ? <><Bot className="h-3.5 w-3.5" /> Bot</> : <><User className="h-3.5 w-3.5" /> You</>}
              </button>

              <div className="flex items-center gap-1">
                <button onClick={() => setShowChatSearch(!showChatSearch)} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Search className="h-5 w-5" /></button>
                <button onClick={() => toast.info("Calling feature coming soon")} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Phone className="h-5 w-5" /></button>
                <button onClick={() => toast.info("Video call feature coming soon")} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Video className="h-5 w-5" /></button>
                <div className="relative" ref={moreRef}>
                  <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><MoreVertical className="h-5 w-5" /></button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card py-1 card-shadow modal-scale-in z-50">
                      <button onClick={() => { setShowMoreMenu(false); toast.info("Lead profile coming soon"); }} className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted">View Lead Profile</button>
                      <button onClick={() => { setShowMoreMenu(false); toast.success("Marked as spam"); }} className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted">Mark as Spam</button>
                      <button onClick={() => { setShowMoreMenu(false); toast.success("Chat archived"); }} className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted">Archive Chat</button>
                      <button onClick={() => { setShowMoreMenu(false); toast.success("Chat exported successfully"); }} className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted">Export Chat</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat search bar */}
            {showChatSearch && (
              <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search in chat..." className="flex-1 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground" autoFocus />
                <button onClick={() => { setShowChatSearch(false); setChatSearch(""); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto wa-chat-pattern px-4 py-4 custom-scrollbar">
              <div className="mb-4 flex justify-center">
                <span className="rounded-full bg-card/80 px-4 py-1 text-xs font-medium text-muted-foreground shadow-xs">Today</span>
              </div>
              <div className="space-y-2 max-w-3xl mx-auto">
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                    <div className={`relative max-w-[75%] rounded-lg px-3 py-2 shadow-xs ${msg.sent ? "bg-wa-sent text-foreground bubble-sent" : "bg-wa-received text-foreground bubble-received"}`}>
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      <div className="mt-1 flex items-center gap-1 justify-end">
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        {msg.sent && <CheckCheck className="h-3.5 w-3.5 text-info" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bot/human badge */}
            <div className="flex justify-center py-1 bg-card border-t border-border">
              <span className={`text-xs font-medium px-3 py-0.5 rounded-full ${botMode ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}>
                {botMode ? "🤖 Bot is handling this chat" : "👤 You are handling this chat"}
              </span>
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 border-t border-border bg-card px-4 py-3 relative">
              {/* Emoji picker */}
              <div className="relative" ref={emojiRef}>
                <button onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Smile className="h-5 w-5" /></button>
                {showEmoji && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-border bg-card p-3 card-shadow modal-scale-in z-50">
                    <div className="grid grid-cols-5 gap-2">
                      {commonEmojis.map((e) => (
                        <button key={e} onClick={() => { setMessageInput(prev => prev + e); setShowEmoji(false); }} className="flex items-center justify-center rounded p-1.5 text-xl hover:bg-muted transition-colors">{e}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Attachment */}
              <div className="relative" ref={attachRef}>
                <button onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Paperclip className="h-5 w-5" /></button>
                {showAttach && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-border bg-card py-1 card-shadow modal-scale-in z-50">
                    <button onClick={() => { setShowAttach(false); toast.info("Image upload coming soon"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"><Image className="h-4 w-4" /> Image</button>
                    <button onClick={() => { setShowAttach(false); toast.info("Document upload coming soon"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"><FileText className="h-4 w-4" /> Document</button>
                    <button onClick={() => { setShowAttach(false); toast.info("Location sharing coming soon"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"><MapPin className="h-4 w-4" /> Location</button>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground outline-hidden placeholder:text-muted-foreground"
              />
              <button onClick={handleSendMessage} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow">
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