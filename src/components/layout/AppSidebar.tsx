import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  Bot,
  Settings,
  LogOut,
  MessageCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Conversations", path: "/conversations", icon: MessageSquare },
  { title: "Leads", path: "/leads", icon: Users },
  { title: "Campaigns", path: "/campaigns", icon: Megaphone },
  { title: "Bot Settings", path: "/bot-settings", icon: Bot },
  { title: "Settings", path: "/settings", icon: Settings },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] flex flex-col text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg, #0A1628 0%, #111B21 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-sidebar-foreground">FlowDesk</h1>
            <p className="text-xs text-sidebar-foreground/60">Smart WhatsApp CRM</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-5 h-px bg-primary/20" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-l-[3px] border-primary bg-primary/10 text-primary"
                    : "border-l-[3px] border-transparent text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
                }`}
                style={isActive ? { boxShadow: "-2px 0 12px rgba(37,211,102,0.15)" } : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">Admin User</p>
              <p className="truncate text-xs text-sidebar-foreground/50">admin@flowdesk.com</p>
            </div>
            <button
              onClick={() => setShowLogout(true)}
              className="rounded-md p-1.5 text-sidebar-foreground/50 hover:bg-white/10 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-sidebar-foreground/30">v1.0.0</p>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowLogout(false)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Confirm Logout</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => { setShowLogout(false); navigate("/login"); }} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}