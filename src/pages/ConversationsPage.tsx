import { useState } from "react";
import { Search, Phone, Video, MoreVertical, Smile, Paperclip, Send, ArrowLeft, Check, CheckCheck } from "lucide-react";

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

const contacts: Contact[] = [
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

const conversations: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Hi, I saw your ad on Instagram", sent: false, time: "10:30 AM" },
    { id: 2, text: "Hello! 👋 Welcome to SerriBot. I'm your AI assistant. May I know your name?", sent: true, time: "10:30 AM" },
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

export default function ConversationsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messages = selectedContact ? conversations[selectedContact.id] || [] : [];

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowChat(true);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Contact List */}
      <div
        className={`w-full flex-shrink-0 border-r border-border bg-card lg:w-[35%] ${
          showChat ? "hidden lg:flex" : "flex"
        } flex-col`}
      >
        {/* Search */}
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={`flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                selectedContact?.id === contact.id ? "bg-primary/5" : ""
              }`}
            >
              <div className="relative shrink-0">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${contact.color}`}>
                  {contact.initials}
                </div>
                {contact.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="truncate text-xs text-muted-foreground">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 flex-col ${showChat ? "flex" : "hidden lg:flex"}`}
      >
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
              <button className="lg:hidden mr-1" onClick={() => setShowChat(false)}>
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${selectedContact.color}`}>
                {selectedContact.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{selectedContact.name}</p>
                <p className="text-xs text-primary">{selectedContact.online ? "Online" : "Offline"}</p>
              </div>
              <div className="flex items-center gap-2">
                {[Search, Phone, Video, MoreVertical].map((Icon, i) => (
                  <button key={i} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto wa-chat-pattern px-4 py-4 custom-scrollbar">
              {/* Date separator */}
              <div className="mb-4 flex justify-center">
                <span className="rounded-full bg-card/80 px-4 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  Today
                </span>
              </div>
              <div className="space-y-2 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`relative max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                        msg.sent
                          ? "bg-wa-sent text-foreground rounded-br-none"
                          : "bg-wa-received text-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      <div className={`mt-1 flex items-center gap-1 ${msg.sent ? "justify-end" : "justify-end"}`}>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        {msg.sent && <CheckCheck className="h-3.5 w-3.5 text-info" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 border-t border-border bg-card px-4 py-3">
              <button className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <Smile className="h-5 w-5" />
              </button>
              <button className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
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
