import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"viewer" | "creator">("viewer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ username, email, password, displayName, role });
      }
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setUsername("");
      setDisplayName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gradient-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
              <span className="text-xl font-black italic text-primary-foreground leading-none" style={{ fontFamily: "'Segoe UI','Arial Black',sans-serif" }}>S</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Sholok Watching</span>
          </div>
          <DialogTitle className="text-center text-xl">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "register" && (
            <>
              <div>
                <label className="text-sm font-semibold mb-1 block">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=""
                  className="bg-background/50"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder=""
                  className="bg-background/50"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-semibold mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              className="bg-background/50"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="bg-background/50"
              required
              minLength={6}
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="text-sm font-semibold mb-1 block">I want to</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("viewer")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-smooth ${role === "viewer" ? "gradient-primary text-white shadow-glow" : "bg-secondary"}`}
                >
                  Watch Videos
                </button>
                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-smooth ${role === "creator" ? "gradient-primary text-white shadow-glow" : "bg-secondary"}`}
                >
                  Create Content
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full gradient-primary border-0 rounded-full font-semibold shadow-glow">
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="text-primary font-semibold hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
