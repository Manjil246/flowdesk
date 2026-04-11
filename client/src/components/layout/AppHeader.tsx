import { useState, useRef, useEffect } from "react";
import { Bell, Menu, ChevronDown, LogOut, User, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  title: string;
  onMenuClick: () => void;
}

const notifications = [
  { icon: "🟢", text: "New lead captured: Rahul Sharma", time: "2 min ago" },
  { icon: "💬", text: "New message from Priya Patel", time: "5 min ago" },
  { icon: "📢", text: "Campaign 'Weekend Offer' sent successfully", time: "1 hr ago" },
  { icon: "🤖", text: "Bot responded to 12 messages", time: "2 hrs ago" },
  { icon: "⚠️", text: "Access token expires in 24 hours", time: "3 hrs ago" },
];

export default function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showBotStatus, setShowBotStatus] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [botActive, setBotActive] = useState(true);

  const notifRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (botRef.current && !botRef.current.contains(e.target as Node)) setShowBotStatus(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3">
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Bot status */}
          <div className="relative" ref={botRef}>
            <button
              onClick={() => setShowBotStatus(!showBotStatus)}
              className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:flex hover:bg-primary/15 transition-colors"
            >
              <span className={`h-2 w-2 rounded-full ${botActive ? "bg-primary animate-pulse-dot" : "bg-destructive"}`} />
              {botActive ? "Bot Active" : "Bot Inactive"}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showBotStatus && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card p-4 card-shadow modal-scale-in z-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-3 w-3 rounded-full ${botActive ? "bg-primary" : "bg-destructive"}`} />
                  <span className="text-sm font-medium text-foreground">{botActive ? "Bot is Active" : "Bot is Inactive"}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Toggle bot</span>
                  <button onClick={() => { setBotActive(!botActive); toast.success(botActive ? "Bot deactivated" : "Bot activated"); }} className={`relative h-6 w-10 rounded-full transition-colors ${botActive ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${botActive ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Last active: just now</p>
              </div>
            )}
          </div>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotif(!showNotif)} className="relative rounded-full p-2 text-muted-foreground hover:bg-muted">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-badge-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card card-shadow modal-scale-in z-50">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold text-foreground">Notifications</span>
                  <button onClick={() => { setUnreadCount(0); toast.success("All notifications marked as read"); }} className="text-xs text-primary hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                      <span className="text-base mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-2.5 text-center">
                  <button onClick={() => toast.info("All notifications view coming soon")} className="text-xs text-primary hover:underline">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setShowProfile(!showProfile)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:ring-2 hover:ring-primary/30 transition-all">
              AD
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card card-shadow modal-scale-in z-50">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">AD</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                    <p className="text-xs text-muted-foreground truncate">admin@flowdesk.com</p>
                  </div>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowProfile(false); toast.info("Feature coming soon"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    <User className="h-4 w-4" /> Edit Profile
                  </button>
                  <button onClick={() => { setShowProfile(false); toast.info("Feature coming soon"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    <Lock className="h-4 w-4" /> Change Password
                  </button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => { setShowProfile(false); setShowLogoutConfirm(true); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4" onClick={() => setShowLogoutConfirm(false)}>
          <div className="w-full max-w-sm rounded-lg bg-card p-6 card-shadow modal-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Confirm Logout</h3>
              <button onClick={() => setShowLogoutConfirm(false)} className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => { setShowLogoutConfirm(false); navigate("/login"); }} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}