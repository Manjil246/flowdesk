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
  Package,
  FolderTree,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Conversations", path: "/conversations", icon: MessageSquare },
  { title: "Leads", path: "/leads", icon: Users },
  { title: "Campaigns", path: "/campaigns", icon: Megaphone },
  { title: "Categories", path: "/categories", icon: FolderTree },
  { title: "Products", path: "/products", icon: Package },
  { title: "Orders", path: "/orders", icon: ShoppingBag },
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
        <div className="fixed inset-0 z-40 bg-foreground/15 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-[260px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[4px_0_32px_rgba(15,23,42,0.04)] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">FlowDesk</h1>
            <p className="text-xs text-muted-foreground">Smart WhatsApp CRM</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground lg:hidden"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-5 h-px bg-border" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/products" &&
                location.pathname.startsWith("/products")) ||
              (item.path === "/orders" && location.pathname.startsWith("/orders"));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-l-[3px] border-primary bg-primary/[0.08] text-primary"
                    : "border-l-[3px] border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border bg-sidebar-muted/40 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Admin User</p>
              <p className="truncate text-xs text-muted-foreground">admin@flowdesk.com</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground/70">v1.0.0</p>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={() => setShowLogout(false)}>
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