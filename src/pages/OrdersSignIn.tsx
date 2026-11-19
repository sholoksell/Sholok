import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAppSelector } from "@/store/hooks";

const SHOPPING_URL = "https://shopping.sholok.com";

const OrdersSignIn = () => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const isBn = language === "BN";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // If already authenticated, go straight to shopping
  if (isAuthenticated) {
    const dest = `${SHOPPING_URL}/orders`;
    window.location.href = dest;
    return null;
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(isBn ? "ইমেইল বা মোবাইল নম্বর দিন" : "Enter your email or mobile number");
      return;
    }
    setError("");
    try { localStorage.setItem("sholok_order_email", email.trim()); } catch {}
    window.location.href = `${SHOPPING_URL}/?email=${encodeURIComponent(email.trim())}`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>

      {/* Logo */}
      <div className="flex justify-center pt-8 pb-4">
        <Link to="/home">
          <span
            className="text-3xl font-black tracking-tight select-none"
            style={{ color: "#1a0028", fontFamily: "'Segoe UI', system-ui, sans-serif" }}
          >
            SHOLOK
          </span>
        </Link>
      </div>

      {/* Sign-in card */}
      <div className="flex justify-center px-4">
        <div
          className="bg-white rounded-lg w-full max-w-sm px-6 py-6"
          style={{ border: "1px solid #d5d9d9" }}
        >
          <h1 className="text-2xl font-normal text-gray-900 mb-5">
            {isBn ? "সাইন ইন" : "Sign in"}
          </h1>

          <form onSubmit={handleContinue}>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              {isBn ? "মোবাইল নম্বর বা ইমেইল" : "Enter mobile number or email"}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full px-3 py-2 rounded text-sm text-gray-900 outline-none"
              style={{
                border: error ? "1px solid #c40000" : "1px solid #888",
                boxShadow: error ? "0 0 0 3px rgba(196,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.1) inset",
              }}
              autoFocus
            />
            {error && (
              <p className="text-xs mt-1" style={{ color: "#c40000" }}>{error}</p>
            )}

            <button
              type="submit"
              className="w-full mt-4 py-2 rounded text-sm font-normal text-gray-900"
              style={{
                backgroundColor: "#f0c14b",
                border: "1px solid #a88734",
                borderBottomColor: "#907c24",
                boxShadow: "0 1px 0 rgba(255,255,255,.4) inset",
              }}
            >
              {isBn ? "চালিয়ে যান" : "Continue"}
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-4 leading-relaxed">
            {isBn
              ? "চালিয়ে যাওয়ার মাধ্যমে আপনি শলোকের "
              : "By continuing, you agree to Sholok's "}
            <a href="/terms" className="text-[#0066C0] hover:text-[#c45500] hover:underline">
              {isBn ? "ব্যবহারের শর্তাবলী" : "Conditions of Use"}
            </a>
            {isBn ? " এবং " : " and "}
            <a href="/privacy" className="text-[#0066C0] hover:text-[#c45500] hover:underline">
              {isBn ? "গোপনীয়তা নীতি" : "Privacy Notice"}
            </a>
            {isBn ? "-তে সম্মত হচ্ছেন।" : "."}
          </p>

          <div className="mt-4">
            <a
              href="/forgot-password"
              className="text-sm text-[#0066C0] hover:text-[#c45500] hover:underline"
            >
              {isBn ? "সাইন ইন করতে সমস্যা?" : "Need help signing in?"}
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex justify-center mt-6 px-4">
        <div className="w-full max-w-sm flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {isBn ? "শলোকে নতুন?" : "New to Sholok?"}
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
      </div>

      {/* Create account button */}
      <div className="flex justify-center mt-4 px-4">
        <Link
          to="/register"
          className="w-full max-w-sm block text-center py-2 rounded text-sm font-normal text-gray-900 transition-colors"
          style={{
            border: "1px solid #d5d9d9",
            backgroundColor: "#f0f2f2",
            boxShadow: "0 1px 0 rgba(255,255,255,.6) inset",
          }}
        >
          {isBn ? "আপনার শলোক অ্যাকাউন্ট তৈরি করুন" : "Create your Sholok account"}
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="mt-10">
        <div className="h-px" style={{ background: "linear-gradient(to right, transparent, #c6c6c6 25%, #c6c6c6 75%, transparent)" }} />
        <div className="flex justify-center gap-6 py-4 flex-wrap px-4">
          {[
            { label: isBn ? "ব্যবহারের শর্ত" : "Conditions of Use", href: "/terms" },
            { label: isBn ? "গোপনীয়তা নীতি" : "Privacy Notice", href: "/privacy" },
            { label: isBn ? "সহায়তা" : "Help", href: "/help" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="text-xs text-[#0066C0] hover:text-[#c45500] hover:underline">
              {item.label}
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 pb-6">
          © 2024–2026, Sholok Inc. {isBn ? "বা এর সহযোগীরা" : "or its affiliates"}
        </p>
      </div>
    </div>
  );
};

export default OrdersSignIn;
