import { useState } from "react";
import { Copy, CheckCircle2, Plus, Shield, Crown, User } from "lucide-react";
import { toast } from "sonner";

const tabs = ["General", "WhatsApp API", "Notifications", "Team"];

const teamMembers = [
  { name: "Admin User", email: "admin@serribot.com", role: "Owner", initials: "AD", color: "bg-primary" },
  { name: "Ravi Kapoor", email: "ravi@serribot.com", role: "Admin", initials: "RK", color: "bg-blue-500" },
  { name: "Meera Shah", email: "meera@serribot.com", role: "Agent", initials: "MS", color: "bg-pink-500" },
];

const roleIcons: Record<string, typeof Crown> = { Owner: Crown, Admin: Shield, Agent: User };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [notifications, setNotifications] = useState({ newLead: true, newMessage: true, campaignComplete: false, botError: true });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === "General" && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-foreground">General Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Business Name</label>
              <input type="text" defaultValue="SerriBot Technologies" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Business Email</label>
              <input type="email" defaultValue="hello@serribot.com" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Timezone</label>
              <select defaultValue="IST" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none">
                <option value="IST">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="EST">US/Eastern (EST)</option>
                <option value="PST">US/Pacific (PST)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Logo</label>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted text-xs text-muted-foreground">Logo</div>
                <button className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">Upload</button>
              </div>
            </div>
          </div>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Save Changes</button>
        </div>
      )}

      {/* WhatsApp API */}
      {activeTab === "WhatsApp API" && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-foreground">WhatsApp API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Phone Number ID</label>
              <input type="password" defaultValue="1234567890" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Access Token</label>
              <div className="mt-1 flex gap-2">
                <input type="password" defaultValue="EAAxxxxxxxxxxxxxx" className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none" />
                <button onClick={() => copyToClipboard("EAAxxxxxxxxxxxxxx")} className="rounded-md border border-border px-3 py-2 text-muted-foreground hover:bg-muted">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">WABA ID</label>
              <input type="password" defaultValue="9876543210" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Webhook URL</label>
              <div className="mt-1 flex gap-2">
                <input type="text" readOnly value="https://your-domain.com/webhook" className="flex-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground outline-none" />
                <button onClick={() => copyToClipboard("https://your-domain.com/webhook")} className="rounded-md border border-border px-3 py-2 text-muted-foreground hover:bg-muted">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Webhook Verify Token</label>
              <input type="password" placeholder="Enter verify token..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => toast.success("Connection successful! ✅")} className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">Test Connection</button>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Save Changes</button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "Notifications" && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-foreground">Notification Preferences</h3>
          {([
            { key: "newLead" as const, label: "New lead notification", desc: "Get notified when a new lead is captured" },
            { key: "newMessage" as const, label: "New message notification", desc: "Get notified for incoming messages" },
            { key: "campaignComplete" as const, label: "Campaign completion alert", desc: "Alert when a campaign finishes sending" },
            { key: "botError" as const, label: "Bot error alert", desc: "Get notified if the bot encounters errors" },
          ]).map((n) => (
            <div key={n.key} className="flex items-center justify-between rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <button onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))} className={`relative h-7 w-12 rounded-full transition-colors ${notifications[n.key] ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${notifications[n.key] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Team */}
      {activeTab === "Team" && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Team Members</h3>
            <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> Invite Member
            </button>
          </div>
          <div className="space-y-3">
            {teamMembers.map((m) => {
              const RoleIcon = roleIcons[m.role] || User;
              return (
                <div key={m.email} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${m.color}`}>{m.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <RoleIcon className="h-3 w-3" /> {m.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
