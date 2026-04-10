import { Users, MessageSquare, Send, Bot, ArrowUp, TrendingUp, Plus, Eye, Megaphone } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  { title: "Total Leads", value: "248", subtitle: "+12 this week", icon: Users, color: "text-primary", bgColor: "bg-primary/10", trend: "up" },
  { title: "Active Conversations", value: "43", subtitle: "Right now", icon: MessageSquare, color: "text-info", bgColor: "bg-info/10", pulse: true },
  { title: "Messages Sent Today", value: "1,204", subtitle: "Across all campaigns", icon: Send, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { title: "Bot Response Rate", value: "94.2%", subtitle: "Last 7 days", icon: Bot, color: "text-warning", bgColor: "bg-warning/10" },
];

const activities = [
  { initials: "RS", name: "Rahul Sharma", action: "sent a message", time: "2 min ago", color: "border-l-primary" },
  { initials: "PP", name: "Priya Patel", action: "New lead captured", time: "5 min ago", color: "border-l-info" },
  { initials: "DO", name: "Diwali Offer", action: "Campaign sent to 450 contacts", time: "1 hr ago", color: "border-l-purple-500" },
  { initials: "AK", name: "Amit Kumar", action: "Bot replied", time: "3 min ago", color: "border-l-primary" },
  { initials: "SJ", name: "Sneha Joshi", action: "requested a brochure", time: "15 min ago", color: "border-l-primary" },
  { initials: "VS", name: "Vikram Singh", action: "New lead captured", time: "30 min ago", color: "border-l-info" },
  { initials: "NG", name: "Neha Gupta", action: "marked as converted", time: "2 hr ago", color: "border-l-primary" },
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

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              {stat.trend === "up" && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <ArrowUp className="h-3 w-3" /> 12%
                </span>
              )}
              {stat.pulse && (
                <span className="h-3 w-3 animate-pulse-dot rounded-full bg-primary" />
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Activity */}
        <div className="lg:col-span-3 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-foreground">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-md border-l-[3px] ${a.color} bg-muted/30 px-3 py-2.5`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {a.initials}
                </div>
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

        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-foreground">Quick Actions</h3>
          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Send className="h-4 w-4" /> Send Bulk Message
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
              <Plus className="h-4 w-4" /> Add New Lead
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
              <Megaphone className="h-4 w-4" /> Create Campaign
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
              <Eye className="h-4 w-4" /> View Bot Logs
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-foreground">Messages This Week</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
