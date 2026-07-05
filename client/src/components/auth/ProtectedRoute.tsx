import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function ProtectedGate() {
  const { user, loading, refresh } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      void refresh();
    }
  }, [user, refresh]);

  if (loading) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export default function AdminLayoutRoute() {
  return (
    <AuthProvider>
      <ProtectedGate />
    </AuthProvider>
  );
}
