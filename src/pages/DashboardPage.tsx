import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, Send, Bot, ArrowUp, Plus, Eye, Megaphone, X, Search } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const stats = [
  { title: "Total Leads", value: "248", subtitle: "+12 this week", icon: Users, color: "text-primary", bgColor: "bg-primary/10", trend: "up", gradient: "from-white to-[#F0FFF4]", borderColor: "border-l-primary" },
  { title: "Active Conversations", value: "43", subtitle: "Right now", icon: MessageSquare, color: "text-info", bgColor: "bg-info/10", pulse: true, gradient: "from-white to-[#EFF6FF]", borderColor: "border-l-info" },
  { title: "Messages Sent Today", value: "1,204", subtitle: "Across all campaigns", icon: Send, color: "text-purple-500", bgColor: "bg-purple-500/10", gradient: "from-white to-[#FAF5FF]", borderColor: "border-l-purple-500" },
  { title: "Bot Response Rate", value: "94.2%", subtitle: "Last 7 days", icon: Bot, color: "text-warning", bgColor: "bg-warning/10", gradient: "from-white to-[#FFF7ED]", borderColor: "border-l-warning" },
];

const activities = [
  { initials: "RS", name: "Rahul Sharma", action: "sent a message", time: "2 min ago", color: "border-l-primary", type: "message" },
  { initials: "PP", name: "Priya Patel", action: "New lead captured", time: "5 min ago", color: "border-l-info", type: "lead" },
  { initials: "DO", name: "Diwali Offer", action: "Campaign sent to 450 contacts", time: "1 hr ago", color: "border-l-purple-500", type: "campaign" },
  { initials: "AK", name: "Amit Kumar", action: "Bot replied", time: "3 min ago", color: "border-l-primary", type: "message" },
  { initials: "SJ", name: "Sneha Joshi", action: "requested a brochure", time: "15 min ago", color: "border-l-primary", type: "message" },
  { initials: "VS", name: "Vikram Singh", action: "New lead captured", time: "30 min ago", color: "border-l-info", type: "lead" },
  { initials: "NG", name: "Neha Gupta", action: "marked as converted", time: "2 hr ago", color: "border-l-primary", type: "lead" },
];

const chartData = [
  { day: "Mon", messages: 180 },
  { day: "Tue", messages: 220 },
  { day: "Wed", messages: 190 },
  { day: "Thu", messages: 310 },
  { day: "Fri", messages: 280 },
  { day: "Sat", messages: 150 },
  { day: "Sun", messages: 120 },
];

const botLogs = [
  { phone: "+91 98765 43210", message: "What is the price?", reply: "Our plans start at ₹999/month.", time: "2 min ago" },
  { phone: "+91 87654 32109", message: "Hello", reply: "Hi! How can I help you today?", time: "5 min ago" },
  { phone: "+91 76543 21098", message: "I want a demo", reply: "Let me schedule a demo for you!", time: "10 min ago" },
  { phone: "+91 65432 10987", message: "Thanks!", reply: "You're welcome! 😊", time: "15 min ago" },
  { phone: "+91 54321 09876", message: "Is this available?", reply: "Yes, it's available! Would you like to know more?", time: "20 min ago" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showBotLogs, setShowBotLogs] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [logSearch, setLogSearch] = useState("");

  const filteredLogs = botLogs.filter(l =>
    l.phone.includes(logSearch) || l.message.toLowerCase().includes(logSearch.toLowerCase())
  );

  const handleActivityClick = (type: string) => {
    if (type === "message") navigate("/conversations");
    else if (type === "lead") navigate("/leads");
    else if (type === "campaign") navigate("/campaigns");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className={`rounded-lg border border-border border-l-4 ${stat.borderColor} bg-gradient-to-br ${stat.gradient} p-5 card-shadow`}>
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              {stat.trend === "up" && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <ArrowUp className="h-3 w-3" /> 12%
                </span>
              )}
              {stat.pulse && <span className="h-3 w-3 animate-pulse-dot rounded-full bg-primary" />}
            </div>
            <p className="mt-4 text-[32px] font-extrabold text-foreground leading-tight">{stat.value}</p>
            <p className="text-sm font-medium text-foreground">{stat.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-lg border border-border bg-card p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            <button onClick={() => setShowAllActivity(true)} className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div
                key={i}
                onClick={() => handleActivityClick(a.type)}
                className={`flex items-center gap-3 rounded-md border-l-[3px] ${a.color} bg-muted/30 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{a.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-foreground">
                    <span className="font-medium">{a.name}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 card-shadow">
          <h3 className="mb-4 text-base font-semibold text-foreground">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => navigate("/campaigns")} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors btn-hover-shadow">
              <Send className="h-4 w-4" /> Send Bulk Message
            </button>
            <button onClick={() => navigate("/leads")} className="flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
              <Plus className="h-4 w-4" /> Add New Lead
            </button>
            <button onClick={() => navigate("/campaigns")} className="flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
              <Megaphone className="h-4 w-4" /> Create Campaign
            </button>
            <button onClick={() => setShowBotLogs(true)} className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
              <Eye className="h-4 w-4" /> View Bot Logs
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-5 card-shadow">
        <h3 className="mb-4 text-base font-semibold text-foreground">Messages This Week</h3>
        <div className="h-[300px] rounded-lg bg-muted/20 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }} />
              <Legend />
              <Line type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bot Logs Modal */}
      {showBotLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowBotLogs(false)}>
          <div className="w-full max-w-2xl rounded-lg bg-card p-6 card-shadow modal-scale-in max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Bot Logs</h3>
              <button onClick={() => setShowBotLogs(false)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="Search logs..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {filteredLogs.map((l, i) => (
                <div key={i} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{l.phone}</span>
                    <span className="text-xs text-muted-foreground">{l.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">User: {l.message}</p>
                  <p className="text-xs text-primary mt-0.5">Bot: {l.reply}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Activity Modal */}
      {showAllActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowAllActivity(false)}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 card-shadow modal-scale-in max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">All Activity</h3>
              <button onClick={() => setShowAllActivity(false)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {activities.map((a, i) => (
                <div key={i} onClick={() => { setShowAllActivity(false); handleActivityClick(a.type); }} className={`flex items-center gap-3 rounded-md border-l-[3px] ${a.color} bg-muted/30 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{a.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm"><span className="font-medium text-foreground">{a.name}</span> <span className="text-muted-foreground">{a.action}</span></p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}