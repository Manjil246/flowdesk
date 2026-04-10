import { useState, useRef } from "react";
import { Copy, Plus, Shield, Crown, User, Eye, EyeOff, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const tabs = ["General", "WhatsApp API", "Notifications", "Team"];

interface TeamMember {
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
}

const initialTeam: TeamMember[] = [
  { name: "Admin User", email: "admin@flowdesk.com", role: "Owner", initials: "AD", color: "bg-primary" },
  { name: "Ravi Kapoor", email: "ravi@flowdesk.com", role: "Admin", initials: "RK", color: "bg-blue-500" },
  { name: "Meera Shah", email: "meera@flowdesk.com", role: "Agent", initials: "MS", color: "bg-pink-500" },
];

const roleIcons: Record<string, typeof Crown> = { Owner: Crown, Admin: Shield, Agent: User };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [notifications, setNotifications] = useState({ newLead: true, newMessage: true, campaignComplete: false, botError: true });
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Agent");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Masked field states
  const [showPhoneId, setShowPhoneId] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showWabaId, setShowWabaId] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Settings saved"); }, 1000);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTimeout(() => { setTesting(false); toast.success("✅ Connection successful! WhatsApp API is configured correctly."); }, 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      toast.success("Logo uploaded");
    }
  };

  const handleToggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Notification preference saved");
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) { toast.error("Please enter an email"); return; }
    const initials = inviteEmail.slice(0, 2).toUpperCase();
    setTeam(prev => [...prev, { name: inviteEmail.split("@")[0], email: inviteEmail, role: inviteRole, initials, color: "bg-teal-500" }]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail(""); setShowInvite(false);
  };

  const handleRemoveMember = (email: string) => {
    setTeam(prev => prev.filter(m => m.email !== email));
    setShowRemoveConfirm(null);
    toast.success("Team member removed");
  };

  const handleRoleChange = (email: string, newRole: string) => {
    setTeam(prev => prev.map(m => m.email === email ? { ...m, role: newRole } : m));
    toast.success("Role updated");
  };

  const MaskedField = ({ label, defaultValue, show, onToggle, copyable }: { label: string; defaultValue: string; show: boolean; onToggle: () => void; copyable?: boolean }) => (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="mt-1 flex gap-2">
        <div className="relative flex-1">
          <input type={show ? "text" : "password"} defaultValue={defaultValue} className="w-full rounded-md border border-border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {copyable && (
          <button onClick={() => copyToClipboard(defaultValue)} className="rounded-md border border-border px-3 py-2 text-muted-foreground hover:bg-muted"><Copy className="h-4 w-4" /></button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{tab}</button>
        ))}
      </div>

      {/* General */}
      {activeTab === "General" && (
        <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-4">
          <h3 className="text-base font-semibold text-foreground">General Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Business Name</label>
              <input type="text" defaultValue="FlowDesk Technologies" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Business Email</label>
              <input type="email" defaultValue="hello@flowdesk.com" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
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
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted text-xs text-muted-foreground">Logo</div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">Upload</button>
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* WhatsApp API */}
      {activeTab === "WhatsApp API" && (
        <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-4">
          <h3 className="text-base font-semibold text-foreground">WhatsApp API Configuration</h3>
          <div className="space-y-4">
            <MaskedField label="Phone Number ID" defaultValue="1234567890" show={showPhoneId} onToggle={() => setShowPhoneId(!showPhoneId)} />
            <MaskedField label="Access Token" defaultValue="EAAxxxxxxxxxxxxxx" show={showToken} onToggle={() => setShowToken(!showToken)} copyable />
            <MaskedField label="WABA ID" defaultValue="9876543210" show={showWabaId} onToggle={() => setShowWabaId(!showWabaId)} />
            <div>
              <label className="text-sm font-medium text-foreground">Webhook URL</label>
              <div className="mt-1 flex gap-2">
                <input type="text" readOnly value="https://api.flowdesk.app/webhook" className="flex-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground outline-none" />
                <button onClick={() => copyToClipboard("https://api.flowdesk.app/webhook")} className="rounded-md border border-border px-3 py-2 text-muted-foreground hover:bg-muted"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <MaskedField label="Webhook Verify Token" defaultValue="" show={showVerifyToken} onToggle={() => setShowVerifyToken(!showVerifyToken)} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleTestConnection} disabled={testing} className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-60">
              {testing ? "Testing..." : "Test Connection"}
            </button>
            <button onClick={handleSave} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "Notifications" && (
        <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-4">
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
              <button onClick={() => handleToggleNotif(n.key)} className={`relative h-7 w-12 rounded-full transition-colors ${notifications[n.key] ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${notifications[n.key] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Team */}
      {activeTab === "Team" && (
        <div className="rounded-lg border border-border bg-card p-5 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Team Members</h3>
            <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow">
              <Plus className="h-4 w-4" /> Invite Member
            </button>
          </div>
          <div className="space-y-3">
            {team.map((m) => {
              const RoleIcon = roleIcons[m.role] || User;
              return (
                <div key={m.email} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${m.color}`}>{m.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  {m.role !== "Owner" ? (
                    <select value={m.role} onChange={(e) => handleRoleChange(m.email, e.target.value)} className="rounded-md border border-border px-2 py-1 text-xs outline-none">
                      <option>Admin</option><option>Manager</option><option>Agent</option>
                    </select>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      <RoleIcon className="h-3 w-3" /> {m.role}
                    </span>
                  )}
                  {m.role !== "Owner" && (
                    <button onClick={() => setShowRemoveConfirm(m.email)} className="rounded p-1.5 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowInvite(false)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none">
                  <option>Admin</option><option>Manager</option><option>Agent</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowInvite(false)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleInvite} className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 btn-hover-shadow">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowRemoveConfirm(null)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Remove Member</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to remove this team member?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRemoveConfirm(null)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => handleRemoveMember(showRemoveConfirm)} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}