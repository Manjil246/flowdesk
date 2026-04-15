import { useState } from "react";
import { Plus, X, Upload, Send, Calendar, ChevronRight, ChevronLeft, Megaphone, CheckCircle2, BarChart3, Eye, Copy, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: number;
  name: string;
  status: string;
  recipients: number;
  sent: number;
  delivered: number;
  read: number;
  date: string;
}

const campaignStats = [
  { title: "Total Campaigns", value: "12", icon: Megaphone, color: "text-primary", bg: "bg-primary/10" },
  { title: "Messages Delivered", value: "8,420", icon: CheckCircle2, color: "text-info", bg: "bg-info/10" },
  { title: "Avg Open Rate", value: "87%", icon: BarChart3, color: "text-warning", bg: "bg-warning/10" },
];

const initialCampaigns: Campaign[] = [
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

const sampleLeads = [
  { id: 1, name: "Rahul Sharma", phone: "+91 98765 43210" },
  { id: 2, name: "Priya Patel", phone: "+91 87654 32109" },
  { id: 3, name: "Amit Kumar", phone: "+91 76543 21098" },
  { id: 4, name: "Sneha Joshi", phone: "+91 65432 10987" },
  { id: 5, name: "Vikram Singh", phone: "+91 54321 09876" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [template, setTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [scheduleType, setScheduleType] = useState("now");
  const [launching, setLaunching] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [showDetail, setShowDetail] = useState<Campaign | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const resetCreate = () => {
    setShowCreate(false); setStep(1); setCampaignName(""); setTemplate("");
    setCustomMessage(""); setScheduleType("now"); setSelectedLeadIds([]); setLeadSearch("");
  };

  const handleLaunch = () => {
    if (!campaignName.trim()) { toast.error("Campaign name is required"); return; }
    setLaunching(true);
    setTimeout(() => {
      const recipientCount = selectedLeadIds.length || 248;
      const newCampaign: Campaign = {
        id: Date.now(), name: campaignName, status: scheduleType === "now" ? "Sent" : "Scheduled",
        recipients: recipientCount, sent: scheduleType === "now" ? recipientCount : 0,
        delivered: scheduleType === "now" ? Math.floor(recipientCount * 0.97) : 0,
        read: scheduleType === "now" ? Math.floor(recipientCount * 0.85) : 0,
        date: new Date().toISOString().split("T")[0],
      };
      setCampaigns(prev => [newCampaign, ...prev]);
      setLaunching(false);
      resetCreate();
      toast.success(`Campaign launched successfully! Messages sending to ${recipientCount} recipients.`);
    }, 1500);
  };

  const handleDelete = (id: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
    toast.success("Campaign deleted");
  };

  const filteredLeads = sampleLeads.filter(l => l.name.toLowerCase().includes(leadSearch.toLowerCase()));

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (template === "welcome") return "Hello {{name}}! 👋 Welcome to our service. We're excited to have you on board!";
    if (template === "promo") return "Hi {{name}}! 🎉 Don't miss our exclusive offer — get 20% off today only! Use code SAVE20.";
    if (template === "followup") return "Hi {{name}}, just following up on our last conversation. Let me know if you have any questions!";
    return "";
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Campaigns</h3>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow">
          <Plus className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {campaignStats.map((s) => (
          <div key={s.title} className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 card-shadow">
            <div className={`rounded-lg p-3 ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card card-shadow">
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
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[c.status] || ""}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.recipients}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.sent}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.delivered}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.read}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setShowDetail(c)} title="View" className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => { setCampaigns(prev => [...prev, { ...c, id: Date.now(), name: c.name + " (Copy)", status: "Draft" }]); toast.success("Campaign duplicated"); }} title="Duplicate" className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => setShowDeleteConfirm(c.id)} title="Delete" className="rounded p-1.5 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">Showing {campaigns.length} of {campaigns.length} campaigns</p>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm p-4" onClick={resetCreate}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 card-shadow modal-scale-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Create Campaign</h3>
              <button onClick={resetCreate} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

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
                  <label className="text-sm font-medium text-foreground">Campaign Name <span className="text-destructive">*</span></label>
                  <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Enter campaign name..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Select Template</label>
                  <select value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden">
                    <option value="">Choose a template...</option>
                    <option value="welcome">Welcome Message</option>
                    <option value="promo">Promotional Offer</option>
                    <option value="followup">Follow-up Message</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Or write custom message <span className="text-xs text-muted-foreground">({customMessage.length}/1024)</span></label>
                  <textarea value={customMessage} onChange={(e) => e.target.value.length <= 1024 && setCustomMessage(e.target.value)} placeholder="Write your message..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden" rows={4} />
                </div>
                {getMessage() && (
                  <div className="rounded-md bg-muted/50 border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Preview</p>
                    <p className="text-sm text-foreground whitespace-pre-line">{getMessage()}</p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Select from Leads</p>
                  <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 mb-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} placeholder="Search leads..." className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground" />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                    {filteredLeads.map(l => (
                      <label key={l.id} className="flex items-center gap-3 rounded-md border border-border p-2 cursor-pointer hover:bg-muted/30">
                        <input type="checkbox" checked={selectedLeadIds.includes(l.id)} onChange={() => setSelectedLeadIds(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])} className="accent-primary" />
                        <span className="text-sm text-foreground">{l.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{l.phone}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">— or —</div>
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">Upload CSV File</p>
                  <button onClick={() => toast.success("CSV uploaded: 150 contacts")} className="mt-2 rounded-md border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/5">Browse Files</button>
                </div>
                <div className="rounded-md bg-primary/5 border border-primary/20 px-4 py-2 text-sm text-primary font-medium">📋 Recipients: {selectedLeadIds.length} selected</div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <input type="radio" name="schedule" value="now" checked={scheduleType === "now"} onChange={() => setScheduleType("now")} className="accent-primary" />
                  <div><p className="text-sm font-medium text-foreground">Send Now</p><p className="text-xs text-muted-foreground">Send immediately to all recipients</p></div>
                </label>
                <label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <input type="radio" name="schedule" value="later" checked={scheduleType === "later"} onChange={() => setScheduleType("later")} className="accent-primary" />
                  <div><p className="text-sm font-medium text-foreground">Schedule for Later</p><p className="text-xs text-muted-foreground">Choose a date and time</p></div>
                </label>
                {scheduleType === "later" && (
                  <div className="flex gap-3">
                    <input type="date" className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-hidden" />
                    <input type="time" className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-hidden" />
                  </div>
                )}
                <div className="rounded-md bg-muted/50 border border-border p-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Summary</p>
                  <p className="text-sm text-foreground font-medium">{campaignName || "Untitled Campaign"}</p>
                  <p className="text-xs text-muted-foreground">Recipients: {selectedLeadIds.length || 248}</p>
                  <p className="text-xs text-muted-foreground truncate">Message: {getMessage().slice(0, 80) || "No message"}...</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={() => step > 1 ? setStep(step - 1) : resetCreate} className="flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" /> {step > 1 ? "Back" : "Cancel"}
              </button>
              {step < 3 ? (
                <button onClick={() => { if (step === 1 && !campaignName.trim()) { toast.error("Please enter a campaign name"); return; } setStep(step + 1); }} className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleLaunch} disabled={launching} className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {launching ? "Launching..." : <><Send className="h-4 w-4" /> Launch Campaign</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm p-4" onClick={() => setShowDetail(null)}>
          <div className="w-full max-w-md rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{showDetail.name}</h3>
              <button onClick={() => setShowDetail(null)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Status</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[showDetail.status]}`}>{showDetail.status}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Recipients</span><span className="font-medium text-foreground">{showDetail.recipients}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Sent</span><span className="font-medium text-foreground">{showDetail.sent}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Delivered</span><span className="font-medium text-foreground">{showDetail.delivered}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Read</span><span className="font-medium text-foreground">{showDetail.read}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{showDetail.date}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Campaign</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this campaign?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}