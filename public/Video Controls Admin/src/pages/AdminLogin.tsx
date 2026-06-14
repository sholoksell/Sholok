import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminAuthApi, setAdminToken, isAdminLoggedIn } from "@/lib/api";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if already has valid admin session
  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAdminLoggedIn()) {
        setChecking(false);
        return;
      }
      try {
        const data = await adminAuthApi.verify();
        if (data.user?.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }
      } catch {}
      setChecking(false);
    };
    checkAdmin();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminAuthApi.login({ email: email.trim(), password });

      if (data.user.role !== "admin") {
        setError("This account does not have admin privileges.");
        setLoading(false);
        return;
      }

      setAdminToken(data.token);
      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="gradient-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary grid place-items-center mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">Sholok Watching Administration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              Sign in to Admin
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Sholok Watching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
