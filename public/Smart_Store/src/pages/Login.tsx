import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { useAuth } from "@/store/authContext";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      navigate(location.state?.from || (u.role === "seller" ? "/seller" : u.role === "admin" ? "/admin" : "/"));
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="container max-w-md py-12">
      <h1 className="text-3xl font-bold mb-2">Sign in</h1>
      <p className="text-muted-foreground mb-8">Welcome back to Sholok Smart Store</p>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground mt-6 text-center">
        New to Sholok? <Link to="/register" className="text-primary font-medium">Create an account</Link>
      </p>
    </div>
  );
}
