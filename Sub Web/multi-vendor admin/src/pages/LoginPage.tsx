import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Zap, Lock, Mail, Shield, ArrowRight, Fingerprint } from "lucide-react";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("admin@nexus.io");
  const [password, setPassword] = useState("••••••••");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("2fa"); }, 1200);
  };

  const handleOtp = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
    if (next.every(v => v !== "") && val) {
      setLoading(true);
      setTimeout(() => { setLoading(false); onLogin(); }, 1000);
    }
  };

  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--gradient-neon)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "var(--gradient-purple)" }} />
        {particles.map(i => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-neon-green/30"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(160,100%,50%)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 neon-glow"
            style={{ background: "var(--gradient-neon)" }}
          >
            <Zap className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text-neon mb-1">NEXUS</h1>
          <p className="text-muted-foreground text-sm">Multi-Vendor Super Admin Platform</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card p-8"
            >
              <h2 className="text-lg font-semibold mb-1">Welcome back</h2>
              <p className="text-sm text-muted-foreground mb-6">Sign in to your admin account</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                      placeholder="admin@nexus.io"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                      placeholder="Enter password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Remember me
                  </label>
                  <button type="button" className="text-primary hover:underline">Forgot password?</button>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                  style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                      <Zap className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-neon-green" />
                  <span>Protected by 2FA • JWT Auth • Role-based Access Control</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "var(--gradient-purple)" }}
                >
                  <Fingerprint className="w-7 h-7 text-white" />
                </motion.div>
              </div>
              <h2 className="text-lg font-semibold text-center mb-1">Two-Factor Authentication</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Enter the 6-digit code from your authenticator app</p>
              <div className="flex items-center gap-2 justify-center mb-6">
                {otp.map((val, idx) => (
                  <motion.input
                    key={idx}
                    id={`otp-${idx}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    type="text"
                    value={val}
                    onChange={e => handleOtp(e.target.value, idx)}
                    maxLength={1}
                    className="w-11 h-12 text-center text-lg font-mono font-bold rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                  />
                ))}
              </div>
              {loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-neon-green">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  Verifying...
                </div>
              )}
              <button onClick={() => setStep("login")} className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground text-center transition-colors">
                ← Back to login
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-6">
          NEXUS Admin v2.0 • Secured with Enterprise SSL
        </p>
      </motion.div>
    </div>
  );
}
