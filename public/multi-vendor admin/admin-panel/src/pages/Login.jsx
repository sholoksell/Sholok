import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("admin@sholok.store");
  const [password, setPassword] = useState("admin123456");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back, Admin!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sholok Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Smart Store Management Panel</p>
        </div>

        {/* Form */}
        <div className="card border border-[#2a2a4a]">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to continue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="admin@sholok.store" required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2 py-2.5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#2a2a4a]">
            <p className="text-xs text-slate-500 text-center">Default: admin@sholok.store / admin123456</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Sholok Smart Store — Smart_Store_New DB
        </p>
      </div>
    </div>
  );
}
