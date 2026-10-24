import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { useAuth } from "@/store/authContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<"customer" | "seller">("customer");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register({ name, email, password, role });
      toast.success(`Welcome ${u.name}!`);
      navigate(role === "seller" ? "/seller" : "/");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="container max-w-md py-12">
      <h1 className="text-3xl font-bold mb-2">Create your account</h1>
      <p className="text-muted-foreground mb-8">Join Sholok — buy or open your own Smart Store</p>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password (min 6 characters)</Label>
          <Input id="password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Account type</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`p-3 rounded-lg border text-sm transition ${role === "customer" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className="font-medium">🛒 Customer</div>
              <div className="text-xs text-muted-foreground">Shop on the marketplace</div>
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`p-3 rounded-lg border text-sm transition ${role === "seller" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className="font-medium">🏪 Seller</div>
              <div className="text-xs text-muted-foreground">Open a Smart Store</div>
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground mt-6 text-center">
        Already a member? <Link to="/login" className="text-primary font-medium">Sign in</Link>
      </p>
    </div>
  );
}
