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
  X,
  Package,
  FolderTree,
  ShoppingBag,
  Mail,
} from "lucide-react";
import BrandLogo from "@/user/components/BrandLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard, enabled: false },
  { title: "Conversations", path: "/admin/conversations", icon: MessageSquare, enabled: false },
  { title: "Leads", path: "/admin/leads", icon: Users, enabled: false },
  { title: "Campaigns", path: "/admin/campaigns", icon: Megaphone, enabled: false },
  { title: "Categories", path: "/admin/categories", icon: FolderTree, enabled: true },
  { title: "Products", path: "/admin/products", icon: Package, enabled: true },
  { title: "Orders", path: "/admin/orders", icon: ShoppingBag, enabled: true },
  { title: "Contact", path: "/admin/contact", icon: Mail, enabled: true },
  { title: "Bot Settings", path: "/admin/bot-settings", icon: Bot, enabled: false },
  { title: "Settings", path: "/admin/settings", icon: Settings, enabled: false },
];

function isNavActive(path: string, pathname: string): boolean {
  if (pathname === path) return true;
  if (path === "/admin/products" && pathname.startsWith("/admin/products")) return true;
  if (path === "/admin/orders" && pathname.startsWith("/admin/orders")) return true;
  if (path === "/admin/contact" && pathname.startsWith("/admin/contact")) return true;
  if (path === "/admin/categories" && pathname.startsWith("/admin/categories")) return true;
  return false;
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
    navigate("/admin/login");
  };

  const displayEmail = user?.email ?? "Admin";
  const initials = displayEmail.slice(0, 2).toUpperCase();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-[min(100vw,280px)] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 lg:w-[260px] lg:translate-x-0 lg:shadow-[4px_0_32px_rgba(15,23,42,0.04)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-stretch justify-between border-b border-border px-4">
          <BrandLogo fillHeight to="/admin/orders" onClick={onMobileClose} />
          <button
            type="button"
            className="self-center rounded-full p-2 text-muted-foreground hover:bg-secondary lg:hidden"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

            <p className="admin-kicker px-5 pt-4">
              Admin
            </p>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.enabled && isNavActive(item.path, location.pathname);
            const className = cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 font-body text-sm transition-colors border-l-[3px]",
              isActive
                ? "border-accent-foreground bg-secondary text-foreground font-medium"
                : item.enabled
                  ? "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                  : "border-transparent text-muted-foreground/45 cursor-not-allowed opacity-60",
            );

            if (!item.enabled) {
              return (
                <div
                  key={item.path}
                  aria-disabled="true"
                  title="Coming soon"
                  className={className}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  <span className="font-body text-[9px] uppercase tracking-[1px] text-muted-foreground/70">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={className}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border bg-surface/30 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground font-body text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-medium text-foreground">Admin</p>
              <p className="truncate font-body text-xs text-muted-foreground">{displayEmail}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {showLogout && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setShowLogout(false)}
        >
          <div
            className="w-full max-w-sm rounded-sm border border-border bg-card p-6 card-shadow modal-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-display-title mb-2 text-xl">Confirm logout</h3>
            <p className="mb-6 font-body text-sm text-muted-foreground">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 rounded-sm border border-border px-4 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleLogout()}
                className="flex-1 rounded-sm bg-destructive px-4 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[1px] text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
