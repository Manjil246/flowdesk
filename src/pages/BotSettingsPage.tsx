import { useState } from "react";
import { Bot, Pencil, Trash2, Plus, GripVertical, Send, X } from "lucide-react";

const defaultSteps = [
  { id: 1, title: "Ask for Name", message: "May I know your name?" },
  { id: 2, title: "Ask for Email", message: "What's your email address?" },
  { id: 3, title: "Ask for Interest", message: "What are you interested in? (select an option)" },
  { id: 4, title: "Confirm & Save Lead", message: "Thank you! A team member will reach out soon." },
];

const defaultRules = [
  { keyword: "pricing", reply: "Our plans start from ₹999/month. Would you like a detailed breakdown?" },
  { keyword: "hello", reply: "Hi there! How can I help you today? 😊" },
  { keyword: "help", reply: "I'm here to help! You can ask me about our products, pricing, or support." },
  { keyword: "demo", reply: "We'd love to show you a demo! Let me connect you with our team." },
];

export default function BotSettingsPage() {
  const [botActive, setBotActive] = useState(true);
  const [botName, setBotName] = useState("SerriBot");
  const [welcomeMsg, setWelcomeMsg] = useState("Hello! 👋 Welcome to SerriBot. I'm your AI assistant. How can I help you today?");
  const [fallbackMsg, setFallbackMsg] = useState("I'm sorry, I didn't understand that. Let me connect you with a human agent.");
  const [language, setLanguage] = useState("English");
  const [steps, setSteps] = useState(defaultSteps);
  const [rules, setRules] = useState(defaultRules);
  const [aiProvider, setAiProvider] = useState("Claude");
  const [maxLength, setMaxLength] = useState(150);
  const [showTestChat, setShowTestChat] = useState(false);
  const [testMessages, setTestMessages] = useState<{ text: string; sent: boolean }[]>([]);
  const [testInput, setTestInput] = useState("");

  const handleTestSend = () => {
    if (!testInput.trim()) return;
    const userMsg = testInput;
    setTestMessages((prev) => [...prev, { text: userMsg, sent: false }]);
    setTestInput("");
    setTimeout(() => {
      const matched = rules.find((r) => userMsg.toLowerCase().includes(r.keyword));
      setTestMessages((prev) => [...prev, { text: matched ? matched.reply : fallbackMsg, sent: true }]);
    }, 600);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
      {/* Bot Status */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5"><Bot className="h-5 w-5 text-primary" /></div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Bot Status</h3>
              <p className="text-sm text-muted-foreground">{botActive ? "Bot is currently active and responding to messages" : "Bot is paused — messages won't get auto-replies"}</p>
            </div>
          </div>
          <button onClick={() => setBotActive(!botActive)} className={`relative h-7 w-12 rounded-full transition-colors ${botActive ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${botActive ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Personality */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground">Bot Personality</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Bot Name</label>
            <input type="text" value={botName} onChange={(e) => setBotName(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none">
              <option>English</option><option>Hindi</option><option>Both</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Welcome Message</label>
          <textarea value={welcomeMsg} onChange={(e) => setWelcomeMsg(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none" rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Fallback Message</label>
          <textarea value={fallbackMsg} onChange={(e) => setFallbackMsg(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none" rows={2} />
        </div>
      </div>

      {/* Lead Capture Flow */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-foreground">Lead Capture Flow</h3>
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3">
            <GripVertical className="mt-1 h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Step {i + 1}: {s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">"{s.message}"</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button className="rounded p-1 text-muted-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
              <button className="rounded p-1 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        <button className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors w-full justify-center">
          <Plus className="h-4 w-4" /> Add Step
        </button>
      </div>

      {/* AI Settings */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground">AI Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">AI Provider</label>
            <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none">
              <option>Claude</option><option>OpenAI</option><option>Gemini</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">API Key</label>
            <input type="password" placeholder="sk-..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Max Response Length: {maxLength} tokens</label>
          <input type="range" min={50} max={500} value={maxLength} onChange={(e) => setMaxLength(Number(e.target.value))} className="mt-2 w-full accent-primary" />
        </div>
        <button onClick={() => { setShowTestChat(true); setTestMessages([]); }} className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
          Test AI Response
        </button>
      </div>

      {/* Auto-replies */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-foreground">Auto-Reply Rules</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-3 py-2 font-medium text-muted-foreground">Keyword</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Reply</th>
                <th className="px-3 py-2 font-medium text-muted-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-3 py-2"><span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">{r.keyword}</span></td>
                  <td className="px-3 py-2 text-muted-foreground">{r.reply}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button className="rounded p-1 text-muted-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                      <button className="rounded p-1 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
          <Plus className="h-4 w-4" /> Add New Rule
        </button>
      </div>

      {/* Test Chat Modal */}
      {showTestChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowTestChat(false)}>
          <div className="w-full max-w-md rounded-lg bg-card shadow-xl flex flex-col h-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Test {botName}</span>
              </div>
              <button onClick={() => setShowTestChat(false)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 wa-chat-pattern custom-scrollbar">
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-wa-received px-3 py-2 shadow-sm text-sm text-foreground">{welcomeMsg}</div>
              </div>
              {testMessages.map((m, i) => (
                <div key={i} className={`flex ${m.sent ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm text-sm ${m.sent ? "bg-wa-received text-foreground" : "bg-wa-sent text-foreground"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border px-4 py-3">
              <input type="text" value={testInput} onChange={(e) => setTestInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTestSend()} placeholder="Type a test message..." className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm outline-none" />
              <button onClick={handleTestSend} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
