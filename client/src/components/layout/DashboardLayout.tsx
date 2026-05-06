import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/conversations": "Conversations",
  "/admin/leads": "Leads Management",
  "/admin/campaigns": "Campaigns",
  "/admin/bot-settings": "Bot Configuration",
  "/admin/settings": "Settings",
  "/admin/categories": "Categories",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-[260px]">
        <AppHeader title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto page-fade-in">{children}</main>
      </div>
    </div>
  );
}
