import { useState } from "react";
import { Plus, X, Upload, Send, Calendar, ChevronRight, ChevronLeft, Megaphone, CheckCircle2, BarChart3 } from "lucide-react";

const campaignStats = [
  { title: "Total Campaigns", value: "12", icon: Megaphone, color: "text-primary", bg: "bg-primary/10" },
  { title: "Messages Delivered", value: "8,420", icon: CheckCircle2, color: "text-info", bg: "bg-info/10" },
  { title: "Avg Open Rate", value: "87%", icon: BarChart3, color: "text-warning", bg: "bg-warning/10" },
];

const campaigns = [
  { id: 1, name: "Diwali Offer 2025", status: "Sent", recipients: 450, sent: 450, delivered: 438, read: 392, date: "2025-01-05" },
  { id: 2, name: "New Year Promo", status: "Scheduled", recipients: 300, sent: 0, delivered: 0, read: 0, date: "2025-01-12" },
  { id: 3, name: "Product Launch", status: "Draft", recipients: 0, sent: 0, delivered: 0, read: 0, date: "2025-01-10" },
  { id: 4, name: "Feedback Survey", status: "Sent", recipients: 200, sent: 200, delivered: 195, read: 165, date: "2025-01-03" },
  { id: 5, name: "Welcome Series", status: "Failed", recipients: 100, sent: 100, delivered: 12, read: 5, date: "2025-01-01" },
];

const statusColors: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Scheduled: "bg-info/10 text-info",
  Sent: "bg-primary/10 text-primary",
  Failed: "bg-destructive/10 text-destructive",
};

export default function CampaignsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [template, setTemplate] = useState("");
  const [scheduleType, setScheduleType] = useState("now");

  const resetCreate = () => {
    setShowCreate(false);
    setStep(1);
    setCampaignName("");
    setTemplate("");
    setScheduleType("now");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Campaigns</h3>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {campaignStats.map((s) => (
          <div key={s.title} className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className={`rounded-lg p-3 ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Campaign</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Recipients</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Sent</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Delivered</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Read</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.recipients}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.sent}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.delivered}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.read}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={resetCreate}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Create Campaign</h3>
              <button onClick={resetCreate} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
                  {s < 3 && <div className={`h-0.5 w-8 ${s < step ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Campaign Name</label>
                  <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Enter campaign name..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Select Template</label>
                  <select value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none">
                    <option value="">Choose a template...</option>
                    <option value="welcome">Welcome Message</option>
                    <option value="promo">Promotional Offer</option>
                    <option value="followup">Follow-up Message</option>
                  </select>
                </div>
                {template && (
                  <div className="rounded-md bg-muted/50 border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Preview</p>
                    <p className="text-sm text-foreground">
                      {template === "welcome" && "Hello {{name}}! 👋 Welcome to our service. We're excited to have you on board!"}
                      {template === "promo" && "Hi {{name}}! 🎉 Don't miss our exclusive offer — get 20% off today only! Use code SAVE20."}
                      {template === "followup" && "Hi {{name}}, just following up on our last conversation. Let me know if you have any questions!"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">Upload CSV File</p>
                  <p className="text-xs text-muted-foreground mt-1">or drag and drop your file here</p>
                  <button className="mt-3 rounded-md border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/5">Browse Files</button>
                </div>
                <div className="text-center text-sm text-muted-foreground">— or —</div>
                <button className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">Select from Existing Leads (248 available)</button>
                <div className="rounded-md bg-primary/5 border border-primary/20 px-4 py-2 text-sm text-primary font-medium">📋 Recipients: 0 selected</div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <input type="radio" name="schedule" value="now" checked={scheduleType === "now"} onChange={() => setScheduleType("now")} className="accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Send Now</p>
                    <p className="text-xs text-muted-foreground">Send immediately to all recipients</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <input type="radio" name="schedule" value="later" checked={scheduleType === "later"} onChange={() => setScheduleType("later")} className="accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Schedule for Later</p>
                    <p className="text-xs text-muted-foreground">Choose a date and time</p>
                  </div>
                </label>
                {scheduleType === "later" && (
                  <div className="flex gap-3">
                    <input type="date" className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none" />
                    <input type="time" className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none" />
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-between">
              <button onClick={() => step > 1 ? setStep(step - 1) : resetCreate} className="flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" /> {step > 1 ? "Back" : "Cancel"}
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={resetCreate} className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Send className="h-4 w-4" /> Launch Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
