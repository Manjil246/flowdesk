import { useState } from "react";
import { Bot, Pencil, Trash2, Plus, ArrowUp, ArrowDown, Send, X, Check, Save } from "lucide-react";
import { toast } from "sonner";

interface Step {
  id: number;
  title: string;
  message: string;
  editing: boolean;
}

interface Rule {
  keyword: string;
  reply: string;
  editing: boolean;
  isNew?: boolean;
}

const defaultSteps: Step[] = [
  { id: 1, title: "Ask for Name", message: "May I know your name?", editing: false },
  { id: 2, title: "Ask for Email", message: "What's your email address?", editing: false },
  { id: 3, title: "Ask for Interest", message: "What are you interested in? (select an option)", editing: false },
  { id: 4, title: "Confirm & Save Lead", message: "Thank you! A team member will reach out soon.", editing: false },
];

const defaultRules: Rule[] = [
  { keyword: "pricing", reply: "Our plans start from ₹999/month. Would you like a detailed breakdown?", editing: false },
  { keyword: "hello", reply: "Hi there! How can I help you today? 😊", editing: false },
  { keyword: "help", reply: "I'm here to help! You can ask me about our products, pricing, or support.", editing: false },
  { keyword: "demo", reply: "We'd love to show you a demo! Let me connect you with our team.", editing: false },
];

export default function BotSettingsPage() {
  const [botActive, setBotActive] = useState(true);
  const [botName, setBotName] = useState("FlowDesk");
  const [welcomeMsg, setWelcomeMsg] = useState("Hello! 👋 Welcome to FlowDesk. I'm your AI assistant. How can I help you today?");
  const [fallbackMsg, setFallbackMsg] = useState("I'm sorry, I didn't understand that. Let me connect you with a human agent.");
  const [language, setLanguage] = useState("English");
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [rules, setRules] = useState<Rule[]>(defaultRules);
  const [aiProvider, setAiProvider] = useState("Claude");
  const [maxLength, setMaxLength] = useState(150);
  const [showTestChat, setShowTestChat] = useState(false);
  const [testMessages, setTestMessages] = useState<{ text: string; sent: boolean }[]>([]);
  const [testInput, setTestInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [showDeleteStep, setShowDeleteStep] = useState<number | null>(null);

  const handleTestSend = () => {
    if (!testInput.trim()) return;
    const userMsg = testInput;
    setTestMessages(prev => [...prev, { text: userMsg, sent: false }]);
    setTestInput("");
    setTimeout(() => {
      const matched = rules.find(r => userMsg.toLowerCase().includes(r.keyword));
      setTestMessages(prev => [...prev, { text: matched ? matched.reply : "This is a simulated AI response. Connect your API key to enable real responses.", sent: true }]);
    }, 1500);
  };

  const handleSave = (section: string) => {
    setSaving(section);
    setTimeout(() => {
      setSaving(null);
      toast.success("Settings saved");
    }, 1000);
  };

  const handleToggleBot = () => {
    setBotActive(!botActive);
    toast.success(botActive ? "Bot deactivated — messages will not be auto-replied" : "Bot activated — now responding to messages");
  };

  const moveStep = (index: number, dir: -1 | 1) => {
    const newSteps = [...steps];
    const [item] = newSteps.splice(index, 1);
    newSteps.splice(index + dir, 0, item);
    setSteps(newSteps);
  };

  const toggleEditStep = (id: number) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, editing: !s.editing } : s));
  };

  const updateStep = (id: number, field: "title" | "message", value: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteStep = (id: number) => {
    setSteps(prev => prev.filter(s => s.id !== id));
    setShowDeleteStep(null);
    toast.success("Step deleted");
  };

  const addStep = () => {
    setSteps(prev => [...prev, { id: Date.now(), title: "New Step", message: "Enter your message", editing: true }]);
  };

  const addRule = () => {
    setRules(prev => [...prev, { keyword: "", reply: "", editing: true, isNew: true }]);
  };

  const updateRule = (index: number, field: "keyword" | "reply", value: string) => {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const saveRule = (index: number) => {
    if (!rules[index].keyword.trim()) { toast.error("Keyword is required"); return; }
    setRules(prev => prev.map((r, i) => i === index ? { ...r, editing: false, isNew: false } : r));
    toast.success("Rule saved");
  };

  const deleteRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
    toast.success("Rule deleted");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
      {/* Bot Status */}
      <div className="rounded-lg border border-border bg-card p-5 card-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5"><Bot className="h-5 w-5 text-primary" /></div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Bot Status</h3>
              <p className="text-sm text-muted-foreground">{botActive ? "Bot is currently active and responding to messages" : "Bot is paused — messages won't get auto-replies"}</p>
            </div>
          </div>
          <button onClick={handleToggleBot} className={`relative h-7 w-12 rounded-full transition-colors ${botActive ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-sm transition-transform ${botActive ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Personality */}
      <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-4">
        <h3 className="text-base font-semibold text-foreground">Bot Personality</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Bot Name <span className="text-destructive">*</span></label>
            <input type="text" value={botName} onChange={(e) => setBotName(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden">
              <option>English</option><option>Hindi</option><option>Both</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Welcome Message <span className="text-destructive">*</span></label>
          <textarea value={welcomeMsg} onChange={(e) => setWelcomeMsg(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden" rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Fallback Message</label>
          <textarea value={fallbackMsg} onChange={(e) => setFallbackMsg(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden" rows={2} />
        </div>
        <button onClick={() => handleSave("personality")} disabled={saving === "personality"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow disabled:opacity-60">
          {saving === "personality" ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Lead Capture Flow */}
      <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-3">
        <h3 className="text-base font-semibold text-foreground">Lead Capture Flow</h3>
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3">
            <div className="flex flex-col gap-1 shrink-0 mt-1">
              <button onClick={() => i > 0 && moveStep(i, -1)} disabled={i === 0} className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => i < steps.length - 1 && moveStep(i, 1)} disabled={i === steps.length - 1} className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex-1 min-w-0">
              {s.editing ? (
                <div className="space-y-2">
                  <input value={s.title} onChange={(e) => updateStep(s.id, "title", e.target.value)} className="w-full rounded-md border border-border px-2 py-1 text-sm outline-hidden" placeholder="Step title" />
                  <input value={s.message} onChange={(e) => updateStep(s.id, "message", e.target.value)} className="w-full rounded-md border border-border px-2 py-1 text-sm outline-hidden" placeholder="Bot message" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Step {i + 1}: {s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">"{s.message}"</p>
                </>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => toggleEditStep(s.id)} className="rounded p-1 text-muted-foreground hover:bg-muted">
                {s.editing ? <Check className="h-3.5 w-3.5 text-primary" /> : <Pencil className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => setShowDeleteStep(s.id)} className="rounded p-1 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        <button onClick={addStep} className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors w-full justify-center">
          <Plus className="h-4 w-4" /> Add Step
        </button>
      </div>

      {/* AI Settings */}
      <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-4">
        <h3 className="text-base font-semibold text-foreground">AI Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">AI Provider</label>
            <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden">
              <option>Claude</option><option>OpenAI</option><option>Gemini</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">API Key</label>
            <input type="password" placeholder="sk-..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Max Response Length: {maxLength} tokens</label>
          <input type="range" min={50} max={500} value={maxLength} onChange={(e) => setMaxLength(Number(e.target.value))} className="mt-2 w-full accent-primary" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowTestChat(true); setTestMessages([]); }} className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">Test AI Response</button>
          <button onClick={() => handleSave("ai")} disabled={saving === "ai"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow disabled:opacity-60">
            {saving === "ai" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Auto-replies */}
      <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-3">
        <h3 className="text-base font-semibold text-foreground">Auto-Reply Rules</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-3 py-2 font-medium text-muted-foreground">Keyword</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Reply</th>
                <th className="px-3 py-2 font-medium text-muted-foreground w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-3 py-2">
                    {r.editing ? (
                      <input value={r.keyword} onChange={(e) => updateRule(i, "keyword", e.target.value)} placeholder="keyword" className="w-full rounded-md border border-border px-2 py-1 text-xs outline-hidden" />
                    ) : (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">{r.keyword}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.editing ? (
                      <input value={r.reply} onChange={(e) => updateRule(i, "reply", e.target.value)} placeholder="Reply message" className="w-full rounded-md border border-border px-2 py-1 text-xs outline-hidden" />
                    ) : (
                      <span className="text-muted-foreground">{r.reply}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {r.editing ? (
                        <button onClick={() => saveRule(i)} className="rounded p-1 text-primary hover:bg-primary/10"><Save className="h-3.5 w-3.5" /></button>
                      ) : (
                        <button onClick={() => setRules(prev => prev.map((rule, idx) => idx === i ? { ...rule, editing: true } : rule))} className="rounded p-1 text-muted-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                      )}
                      <button onClick={() => deleteRule(i)} className="rounded p-1 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addRule} className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
          <Plus className="h-4 w-4" /> Add New Rule
        </button>
      </div>

      {/* Delete Step Confirm */}
      {showDeleteStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4" onClick={() => setShowDeleteStep(null)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Step</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to remove this step?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteStep(null)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => deleteStep(showDeleteStep)} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Test Chat Modal */}
      {showTestChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4" onClick={() => setShowTestChat(false)}>
          <div className="w-full max-w-md rounded-lg bg-card card-shadow modal-scale-in flex flex-col h-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Test {botName}</span>
              </div>
              <button onClick={() => setShowTestChat(false)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 wa-chat-pattern custom-scrollbar">
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-wa-received px-3 py-2 shadow-xs text-sm text-foreground">{welcomeMsg}</div>
              </div>
              {testMessages.map((m, i) => (
                <div key={i} className={`flex ${m.sent ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 shadow-xs text-sm ${m.sent ? "bg-wa-received text-foreground" : "bg-wa-sent text-foreground"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border px-4 py-3">
              <input type="text" value={testInput} onChange={(e) => setTestInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTestSend()} placeholder="Type a test message..." className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm outline-hidden" />
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