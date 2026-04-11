import { useState, useMemo } from "react";
import { Search, Plus, Download, Eye, Pencil, Trash2, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Lead {
  id: number;
  name: string;
  initials: string;
  phone: string;
  email: string;
  status: "New" | "Contacted" | "Converted" | "Lost";
  source: "WhatsApp" | "Campaign" | "Manual" | "Instagram" | "Facebook";
  date: string;
  color: string;
  notes: string;
}

const initialLeads: Lead[] = [
  { id: 1, name: "Rahul Sharma", initials: "RS", phone: "+91 98765 43210", email: "rahul@gmail.com", status: "Contacted", source: "WhatsApp", date: "2025-01-10", color: "bg-blue-500", notes: "" },
  { id: 2, name: "Priya Patel", initials: "PP", phone: "+91 87654 32109", email: "priya@gmail.com", status: "New", source: "Campaign", date: "2025-01-09", color: "bg-pink-500", notes: "" },
  { id: 3, name: "Amit Kumar", initials: "AK", phone: "+91 76543 21098", email: "amit@yahoo.com", status: "Converted", source: "WhatsApp", date: "2025-01-08", color: "bg-orange-500", notes: "" },
  { id: 4, name: "Sneha Joshi", initials: "SJ", phone: "+91 65432 10987", email: "sneha@outlook.com", status: "New", source: "Manual", date: "2025-01-07", color: "bg-purple-500", notes: "" },
  { id: 5, name: "Vikram Singh", initials: "VS", phone: "+91 54321 09876", email: "vikram@gmail.com", status: "Lost", source: "Campaign", date: "2025-01-06", color: "bg-teal-500", notes: "" },
  { id: 6, name: "Neha Gupta", initials: "NG", phone: "+91 43210 98765", email: "neha@gmail.com", status: "Contacted", source: "WhatsApp", date: "2025-01-05", color: "bg-red-500", notes: "" },
  { id: 7, name: "Rohan Mehta", initials: "RM", phone: "+91 32109 87654", email: "rohan@gmail.com", status: "New", source: "Manual", date: "2025-01-04", color: "bg-indigo-500", notes: "" },
  { id: 8, name: "Anjali Das", initials: "AD", phone: "+91 21098 76543", email: "anjali@gmail.com", status: "Converted", source: "Campaign", date: "2025-01-03", color: "bg-yellow-600", notes: "" },
];

const statusColors: Record<string, string> = {
  New: "bg-info/10 text-info",
  Contacted: "bg-warning/10 text-warning",
  Converted: "bg-primary/10 text-primary",
  Lost: "bg-destructive/10 text-destructive",
};

const bgColors = ["bg-blue-500", "bg-pink-500", "bg-orange-500", "bg-purple-500", "bg-teal-500", "bg-red-500", "bg-indigo-500", "bg-yellow-600"];

const ITEMS_PER_PAGE = 5;

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkStatusChange, setBulkStatusChange] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("+91 ");
  const [formEmail, setFormEmail] = useState("");
  const [formSource, setFormSource] = useState<Lead["source"]>("WhatsApp");
  const [formStatus, setFormStatus] = useState<Lead["status"]>("New");
  const [formNotes, setFormNotes] = useState("");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      const matchSource = sourceFilter === "All" || l.source === sourceFilter;
      return matchSearch && matchStatus && matchSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedLeads = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === paginatedLeads.length ? [] : paginatedLeads.map(l => l.id));

  const resetForm = () => {
    setFormName(""); setFormPhone("+91 "); setFormEmail(""); setFormSource("WhatsApp"); setFormStatus("New"); setFormNotes("");
  };

  const openAddModal = () => { resetForm(); setShowAddModal(true); setEditLead(null); };
  const openEditModal = (lead: Lead) => {
    setFormName(lead.name); setFormPhone(lead.phone); setFormEmail(lead.email);
    setFormSource(lead.source); setFormStatus(lead.status); setFormNotes(lead.notes);
    setEditLead(lead); setShowAddModal(true);
  };

  const handleSaveLead = () => {
    if (!formName.trim() || !formPhone.trim()) { toast.error("Please fill all required fields"); return; }
    const initials = formName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    if (editLead) {
      setLeads(prev => prev.map(l => l.id === editLead.id ? { ...l, name: formName, initials, phone: formPhone, email: formEmail, source: formSource, status: formStatus, notes: formNotes } : l));
      toast.success("Lead updated successfully");
    } else {
      const newLead: Lead = { id: Date.now(), name: formName, initials, phone: formPhone, email: formEmail, status: formStatus, source: formSource, date: new Date().toISOString().split("T")[0], color: bgColors[Math.floor(Math.random() * bgColors.length)], notes: formNotes };
      setLeads(prev => [newLead, ...prev]);
      toast.success("Lead added successfully");
    }
    setShowAddModal(false); resetForm(); setEditLead(null);
  };

  const handleDelete = (id: number) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setShowDeleteConfirm(null);
    toast.success("Lead deleted successfully");
  };

  const handleBulkDelete = () => {
    setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
    setSelectedIds([]);
    setShowBulkDeleteConfirm(false);
    toast.success(`${selectedIds.length} leads deleted`);
  };

  const handleBulkStatusChange = (status: Lead["status"]) => {
    setLeads(prev => prev.map(l => selectedIds.includes(l.id) ? { ...l, status } : l));
    setSelectedIds([]);
    setBulkStatusChange(false);
    toast.success(`Status updated for ${selectedIds.length} leads`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Phone", "Email", "Status", "Source", "Date"];
    const rows = filtered.map(l => [l.name, l.phone, l.email, l.status, l.source, l.date]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowdesk-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exported successfully");
  };

  const handleViewLeadStatusChange = (status: Lead["status"]) => {
    if (!viewLead) return;
    setLeads(prev => prev.map(l => l.id === viewLead.id ? { ...l, status } : l));
    setViewLead(prev => prev ? { ...prev, status } : null);
    toast.success("Status updated");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Leads</h3>
        <button onClick={openAddModal} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex flex-1 items-center gap-2 rounded-md bg-muted px-3 py-2 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name, email, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-hidden">
          <option>All</option><option>New</option><option>Contacted</option><option>Converted</option><option>Lost</option>
        </select>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }} className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-hidden">
          <option>All</option><option>WhatsApp</option><option>Campaign</option><option>Manual</option><option>Instagram</option><option>Facebook</option>
        </select>
        <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2 relative">
          <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
          <button onClick={() => setShowBulkDeleteConfirm(true)} className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20">Delete Selected</button>
          <button onClick={() => setBulkStatusChange(!bulkStatusChange)} className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20">Change Status</button>
          {bulkStatusChange && (
            <div className="absolute top-full left-32 mt-1 rounded-lg border border-border bg-card py-1 card-shadow z-50">
              {(["New", "Contacted", "Converted", "Lost"] as const).map(s => (
                <button key={s} onClick={() => handleBulkStatusChange(s)} className="flex w-full px-4 py-2 text-sm text-foreground hover:bg-muted">{s}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card card-shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === paginatedLeads.length && paginatedLeads.length > 0} onChange={toggleAll} className="accent-primary" /></th>
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
            {paginatedLeads.map((lead, i) => (
              <tr key={lead.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} className="accent-primary" /></td>
                <td className="px-4 py-3 text-muted-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground ${lead.color}`}>{lead.initials}</div>
                    <span className="font-medium text-foreground truncate max-w-[120px]" title={lead.name}>{lead.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[150px]" title={lead.email}>{lead.email}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[lead.status]}`}>{lead.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.source}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewLead(lead)} title="View" className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => openEditModal(lead)} title="Edit" className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setShowDeleteConfirm(lead.id)} title="Delete" className="rounded p-1.5 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} leads</p>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setCurrentPage(p)} className={`rounded-md px-3 py-1 text-sm ${p === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4" onClick={() => { setShowAddModal(false); setEditLead(null); }}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{editLead ? "Edit Lead" : "Add New Lead"}</h3>
              <button onClick={() => { setShowAddModal(false); setEditLead(null); }} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter full name" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone Number <span className="text-destructive">*</span></label>
                <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Source</label>
                  <select value={formSource} onChange={(e) => setFormSource(e.target.value as Lead["source"])} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden">
                    <option>WhatsApp</option><option>Campaign</option><option>Manual</option><option>Instagram</option><option>Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as Lead["status"])} className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden">
                    <option>New</option><option>Contacted</option><option>Converted</option><option>Lost</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Add notes..." className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-hidden" rows={2} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setShowAddModal(false); setEditLead(null); }} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSaveLead} className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow">{editLead ? "Update Lead" : "Save Lead"}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4" onClick={() => setViewLead(null)}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
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
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-muted-foreground">Status</span>
                <select value={viewLead.status} onChange={(e) => handleViewLeadStatusChange(e.target.value as Lead["status"])} className="rounded-md border border-border px-2 py-1 text-xs outline-hidden">
                  <option>New</option><option>Contacted</option><option>Converted</option><option>Lost</option>
                </select>
              </div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Source</span><span className="font-medium text-foreground">{viewLead.source}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Date Added</span><span className="font-medium text-foreground">{viewLead.date}</span></div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <textarea defaultValue={viewLead.notes} className="mt-1 w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm outline-hidden" rows={3} placeholder="Add notes about this lead..." />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setViewLead(null); navigate("/conversations"); }} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <MessageSquare className="h-4 w-4" /> Send Message
              </button>
              <button onClick={() => setViewLead(null)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Lead</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this lead?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete {selectedIds.length} Leads</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete the selected leads?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBulkDeleteConfirm(false)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}