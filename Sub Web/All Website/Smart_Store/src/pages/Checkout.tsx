import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, CreditCard, Truck, ShieldCheck, Sparkles, Lock, Tag, X } from "lucide-react";
import { useCart } from "@/store/cartContext";
import { useAuth } from "@/store/authContext";
import { ordersApi, couponsApi, paymentsApi } from "@/lib/api";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Address", icon: Truck },
  { id: 2, title: "Payment", icon: CreditCard },
  { id: 3, title: "Review", icon: ShieldCheck },
] as const;

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Address state
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone:    "",
    street:   "",
    city:     "",
    state:    "",
    zip:      "",
    country:  "Bangladesh",
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe" | "sslcommerz" | "naverpay">("cod");

  // Coupon
  const [couponCode,  setCouponCode]  = useState("");
  const [couponInfo,  setCouponInfo]  = useState<{ code: string; discount: number } | null>(null);
  const [validating,  setValidating]  = useState(false);
  const [placing,     setPlacing]     = useState(false);

  const shipping = total > 11000 ? 0 : 880;
  const tax = total * 0.07;
  const discount = couponInfo?.discount || 0;
  const grand = Math.max(0, total + shipping + tax - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    try {
      const res = await couponsApi.validate(couponCode.trim().toUpperCase(), total);
      const d   = res?.discount ?? res?.coupon?.value ?? 0;
      setCouponInfo({ code: couponCode.trim().toUpperCase(), discount: d });
      toast.success(`Coupon applied: −৳${d.toLocaleString()}`);
    } catch (err: any) {
      toast.error(err.message || "Invalid coupon");
      setCouponInfo(null);
    } finally { setValidating(false); }
  };

  const handlePlace = async () => {
    if (items.length === 0) return toast.error("Your cart is empty");
    setPlacing(true);
    try {
      const orderPayload = {
        items: items.map((it: any) => ({
          productId: it.id, quantity: it.quantity, variant: it.variant,
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponInfo?.code,
        note: "",
      };
      const res = await ordersApi.place(orderPayload);
      const order = res?.order || res?.data;
      const orderId = order?._id || order?.id;

      // Online payment flows
      if (orderId && paymentMethod === "naverpay") {
        const reservation = await paymentsApi.naverpayReserve(orderId);
        toast.success("Naver Pay reserved — redirecting…");
        // In a real flow: open Naver Pay JS SDK with reservation.paymentId.
        // For now we mark the order paid via approve endpoint as a stub.
        await paymentsApi.naverpayApprove(orderId, reservation.paymentId);
      } else if (orderId && paymentMethod === "sslcommerz") {
        const init = await paymentsApi.sslcommerzInit(orderId);
        if (init?.gatewayUrl) { window.location.href = init.gatewayUrl; return; }
      }

      toast.success("Order placed!", { description: `Order ${order?.orderNumber || orderId}` });
      setTimeout(() => navigate("/account"), 600);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally { setPlacing(false); }
  };

  return (
    <div className="container py-8 lg:py-12 max-w-6xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to shopping
      </Link>

      <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-10">Complete your order in 3 quick steps.</p>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 max-w-xl">
        {steps.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ scale: active ? 1.05 : 1, backgroundColor: done || active ? "hsl(var(--foreground))" : "hsl(var(--secondary))" }}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div key="d" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="w-4 h-4 text-background" />
                      </motion.div>
                    ) : (
                      <motion.div key="i" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <s.icon className={`w-4 h-4 ${active ? "text-background" : "text-muted-foreground"}`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={`text-xs font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-secondary mx-3 relative overflow-hidden rounded-full">
                  <motion.div initial={false} animate={{ scaleX: step > s.id ? 1 : 0 }} className="absolute inset-0 origin-left bg-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Form */}
        <div className="bg-card rounded-3xl shadow-soft border border-border/60 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="addr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-bold mb-5">Shipping address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                  <Field label="Phone"     value={address.phone}    onChange={(e) => setAddress({ ...address, phone:    e.target.value })} />
                  <Field label="Address"   className="sm:col-span-2" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                  <Field label="City"      value={address.city}     onChange={(e) => setAddress({ ...address, city:     e.target.value })} />
                  <Field label="ZIP"       value={address.zip}      onChange={(e) => setAddress({ ...address, zip:      e.target.value })} />
                  <Field label="Country"   className="sm:col-span-2" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-bold mb-5">Payment method</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { id: "cod",        label: "Cash on Delivery" },
                    { id: "naverpay",   label: "Naver Pay (Korea) — secure 1-tap" },
                    { id: "stripe",     label: "Credit / Debit card (Stripe)" },
                    { id: "sslcommerz", label: "SSLCommerz (bKash, Nagad, Cards — BD)" },
                  ].map((m) => (
                    <label key={m.id} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === m.id ? "border-foreground bg-secondary/40" : "border-border"}`}>
                      <input
                        type="radio" name="pay"
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id as any)}
                        className="accent-foreground"
                      />
                      <span className="font-medium text-sm">{m.label}</span>
                      <Lock className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                    </label>
                  ))}
                </div>

                {/* Coupon */}
                <div className="rounded-2xl border border-dashed border-border p-4">
                  <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Promo / Coupon code
                  </div>
                  {couponInfo ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-accent-mint">{couponInfo.code} — −৳{couponInfo.discount.toLocaleString()}</span>
                      <button onClick={() => { setCouponInfo(null); setCouponCode(""); }} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><X className="w-3 h-3" /> Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g. SHOLOK10"
                        className="flex-1 h-10 px-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-card focus:border-border text-sm focus:outline-none" />
                      <button onClick={applyCoupon} disabled={validating} className="h-10 px-4 rounded-xl bg-foreground text-background text-xs font-semibold disabled:opacity-50">
                        {validating ? "Checking…" : "Apply"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="rev" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-bold mb-5">Review your order</h2>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Your cart is empty. Add a few favorites first!</p>
                  ) : items.map((it) => (
                    <div key={it.id} className="flex gap-3 p-3 rounded-2xl bg-secondary/40">
                      <img src={it.image} alt={it.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{it.brand}</p>
                        <p className="font-medium text-sm line-clamp-1">{it.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm tabular-nums">৳{(it.price * it.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-2xl bg-gradient-soft flex items-center gap-3">
                  <Sparkles className="w-4 h-4 gradient-text" />
                  <p className="text-xs">Estimated delivery in <strong>2-3 days</strong> based on your address.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="h-11 px-5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 3 ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep((s) => s + 1)}
                className="h-11 px-6 rounded-2xl bg-foreground text-background text-sm font-semibold flex items-center gap-1.5"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePlace}
                disabled={placing}
                className="h-11 px-6 rounded-2xl bg-gradient-primary text-white text-sm font-semibold flex items-center gap-1.5 shadow-elegant disabled:opacity-60"
              >
                {placing ? "Placing…" : "Place order"} <Check className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="bg-card rounded-3xl shadow-soft border border-border/60 p-6 h-fit sticky top-24">
          <h3 className="font-display text-lg font-bold mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            <Row l="Items" v={`${items.length}`} />
            <Row l="Subtotal" v={`৳${total.toLocaleString()}`} />
            <Row l="Shipping" v={shipping === 0 ? <span className="text-accent-mint font-semibold">Free</span> : `৳${shipping.toLocaleString()}`} />
            <Row l="Tax (7%)" v={`৳${Math.round(tax).toLocaleString()}`} />
            {discount > 0 && <Row l="Coupon" v={<span className="text-accent-mint">−৳{discount.toLocaleString()}</span>} />}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <motion.span key={grand} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-display text-2xl font-bold tabular-nums">
              ৳{Math.round(grand).toLocaleString()}
            </motion.span>
          </div>
          <div className="mt-4 p-3 rounded-2xl bg-gradient-soft text-xs text-foreground/80 flex gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-accent-mint mt-0.5" />
            <span>256-bit encryption · 30-day money-back guarantee</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, className, ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1.5 block">{label}</span>
      <input {...props} className="w-full h-11 px-4 rounded-2xl bg-secondary/50 border border-transparent focus:bg-card focus:border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
    </label>
  );
}

function Row({ l, v }: { l: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-medium tabular-nums">{v}</span>
    </div>
  );
}
