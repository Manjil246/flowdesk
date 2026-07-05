import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

const pageTitles: Record<string, string> = {
  "/admin/categories": "Categories",
  "/admin/products": "Products",
  "/admin/products/new": "New product",
  "/admin/orders": "Orders",
  "/admin/contact": "Contact Messages",
};

function resolvePageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/admin/products/")) return "Edit product";
  if (pathname.startsWith("/admin/orders/")) return "Order details";
  return "Admin";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = resolvePageTitle(location.pathname);

  return (
    <div className="admin-shell flex min-h-screen w-full bg-background">
      <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-[260px]">
        <AppHeader title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto page-fade-in p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
