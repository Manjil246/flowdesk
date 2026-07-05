import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BrandLogo from "@/user/components/BrandLogo";
import { fetchCurrentAdmin, loginAdmin } from "@/lib/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const redirectTo =
    searchParams.get("redirect")?.startsWith("/admin") &&
    !searchParams.get("redirect")?.startsWith("/admin/login")
      ? searchParams.get("redirect")!
      : "/admin/orders";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await fetchCurrentAdmin();
        if (!cancelled && user) {
          navigate(redirectTo, { replace: true });
        }
      } catch {
        // Not logged in — show form.
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await loginAdmin({ email, password });
      toast.success("Welcome back");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-sm border border-border bg-card p-8 card-shadow modal-scale-in">
        <div className="mb-8 flex flex-col items-center">
          <BrandLogo className="mb-4" imageClassName="h-14 max-h-14" />
          <p className="admin-kicker mt-2">
            Admin
          </p>
          <h1 className="admin-display-title mt-2 text-3xl">Welcome back</h1>
          <p className="mt-2 text-center font-body text-sm text-muted-foreground">
            Sign in to manage orders, products, and more.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[1px] text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@stylesutra.com.np"
              autoComplete="username"
              className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 font-body text-sm outline-hidden focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[1px] text-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-sm border border-border bg-background px-3 py-2.5 pr-10 font-body text-sm outline-hidden focus:border-ring focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-foreground px-4 py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => toast.info("Password reset coming soon")}
            className="w-full text-center font-body text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
