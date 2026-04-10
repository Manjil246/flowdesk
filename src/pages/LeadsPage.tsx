import { useState, useMemo } from "react";
import { Search, Plus, Download, Eye, Pencil, Trash2, X, MessageSquare } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  initials: string;
  phone: string;
  email: string;
  status: "New" | "Contacted" | "Converted" | "Lost";
  source: "WhatsApp" | "Campaign" | "Manual";
  date: string;
  color: string;
}

const leadsData: Lead[] = [
  { id: 1, name: "Rahul Sharma", initials: "RS", phone: "+91 98765 43210", email: "rahul@gmail.com", status: "Contacted", source: "WhatsApp", date: "2025-01-10", color: "bg-blue-500" },
  { id: 2, name: "Priya Patel", initials: "PP", phone: "+91 87654 32109", email: "priya@gmail.com", status: "New", source: "Campaign", date: "2025-01-09", color: "bg-pink-500" },
  { id: 3, name: "Amit Kumar", initials: "AK", phone: "+91 76543 21098", email: "amit@yahoo.com", status: "Converted", source: "WhatsApp", date: "2025-01-08", color: "bg-orange-500" },
  { id: 4, name: "Sneha Joshi", initials: "SJ", phone: "+91 65432 10987", email: "sneha@outlook.com", status: "New", source: "Manual", date: "2025-01-07", color: "bg-purple-500" },
  { id: 5, name: "Vikram Singh", initials: "VS", phone: "+91 54321 09876", email: "vikram@gmail.com", status: "Lost", source: "Campaign", date: "2025-01-06", color: "bg-teal-500" },
  { id: 6, name: "Neha Gupta", initials: "NG", phone: "+91 43210 98765", email: "neha@gmail.com", status: "Contacted", source: "WhatsApp", date: "2025-01-05", color: "bg-red-500" },
  { id: 7, name: "Rohan Mehta", initials: "RM", phone: "+91 32109 87654", email: "rohan@gmail.com", status: "New", source: "Manual", date: "2025-01-04", color: "bg-indigo-500" },
  { id: 8, name: "Anjali Das", initials: "AD", phone: "+91 21098 76543", email: "anjali@gmail.com", status: "Converted", source: "Campaign", date: "2025-01-03", color: "bg-yellow-600" },
];

const statusColors: Record<string, string> = {
  New: "bg-info/10 text-info",
  Contacted: "bg-warning/10 text-warning",
  Converted: "bg-primary/10 text-primary",
  Lost: "bg-destructive/10 text-destructive",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return leadsData.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      const matchSource = sourceFilter === "All" || l.source === sourceFilter;
      return matchSearch && matchStatus && matchSource;
    });
  }, [search, statusFilter, sourceFilter]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((l) => l.id));
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Leads</h3>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex flex-1 items-center gap-2 rounded-md bg-muted px-3 py-2 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none">
          <option>All</option><option>New</option><option>Contacted</option><option>Converted</option><option>Lost</option>
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none">
          <option>All</option><option>WhatsApp</option><option>Campaign</option><option>Manual</option>
        </select>
        <button className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2">
          <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
          <button className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20">Delete Selected</button>
          <button className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20">Change Status</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-primary" /></th>
              <th className="px-4 py-3 font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Source</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => (
              <tr key={lead.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} className="accent-primary" /></td>
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground ${lead.color}`}>{lead.initials}</div>
                    <span className="font-medium text-foreground">{lead.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.email}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[lead.status]}`}>{lead.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.source}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewLead(lead)} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Eye className="h-4 w-4" /></button>
                    <button className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <button className="rounded p-1.5 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing 1-{filtered.length} of 48 leads</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={`rounded-md px-3 py-1 text-sm ${p === 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Lead Detail Modal */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setViewLead(null)}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Lead Details</h3>
              <button onClick={() => setViewLead(null)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-primary-foreground ${viewLead.color}`}>{viewLead.initials}</div>
              <div>
                <p className="text-lg font-semibold text-foreground">{viewLead.name}</p>
                <p className="text-sm text-muted-foreground">{viewLead.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Phone</span><span className="font-medium text-foreground">{viewLead.phone}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Status</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[viewLead.status]}`}>{viewLead.status}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Source</span><span className="font-medium text-foreground">{viewLead.source}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Date Added</span><span className="font-medium text-foreground">{viewLead.date}</span></div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <textarea className="mt-1 w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" rows={3} placeholder="Add notes about this lead..." />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <MessageSquare className="h-4 w-4" /> Send Message
              </button>
              <button onClick={() => setViewLead(null)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
