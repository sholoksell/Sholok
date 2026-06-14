import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Eye, Send, Heart, ShoppingBag, Sparkles, Volume2, Maximize2 } from "lucide-react";
import { liveStreams, products } from "@/data/mockData";
import { useCart } from "@/store/cartContext";

const seedChat = [
  { id: 1, user: "Maya", msg: "Just got my pair — sound is unreal!", color: "from-pink-400 to-rose-400" },
  { id: 2, user: "Jordan", msg: "Does it work with iPhone?", color: "from-violet-400 to-fuchsia-400" },
  { id: 3, user: "Priya", msg: "Cream colorway 😍", color: "from-amber-400 to-orange-400" },
  { id: 4, user: "Theo", msg: "Adding to cart now!", color: "from-cyan-400 to-blue-400" },
];

const flowingMsgs = [
  "Bought 2 of these last drop ❤️",
  "Battery life is incredible",
  "Shipped to Korea?",
  "Discount code please 🙏",
  "Looks even better in person",
  "Mira your studio is gorgeous",
];

export default function LivePage() {
  const [active, setActive] = useState(liveStreams[0]);
  const featuredProducts = active.productIds.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  const { add } = useCart();
  const [chat, setChat] = useState(seedChat);
  const [draft, setDraft] = useState("");

  // Stream new fake messages
  useEffect(() => {
    const t = setInterval(() => {
      const m = flowingMsgs[Math.floor(Math.random() * flowingMsgs.length)];
      const users = ["Sana", "Devin", "Liv", "Rafael", "Mira"];
      const u = users[Math.floor(Math.random() * users.length)];
      const colors = ["from-pink-400 to-rose-400", "from-violet-400 to-fuchsia-400", "from-amber-400 to-orange-400", "from-cyan-400 to-blue-400", "from-emerald-400 to-teal-400"];
      const c = colors[Math.floor(Math.random() * colors.length)];
      setChat((prev) => [...prev.slice(-12), { id: Date.now(), user: u, msg: m, color: c }]);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setChat((p) => [...p, { id: Date.now(), user: "You", msg: draft, color: "from-foreground to-foreground" }]);
    setDraft("");
  };

  return (
    <div className="container py-8 lg:py-10">
      <div className="flex items-center gap-3 mb-6">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-3 h-3 rounded-full bg-destructive" />
        <h1 className="font-display text-3xl lg:text-4xl font-bold">Live Shopping</h1>
        <span className="text-xs text-muted-foreground">{liveStreams.filter((l) => l.isLive).length} streams live now</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Player */}
        <div>
          <div className="relative aspect-video rounded-4xl overflow-hidden bg-foreground shadow-card">
            <motion.img
              key={active.id}
              src={active.thumbnail}
              alt={active.title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

            {/* Top bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-destructive text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Live
                </span>
                <span className="px-2.5 py-1 rounded-full glass-dark bg-white/10 text-[10px] font-bold flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {active.viewers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-full glass-dark bg-white/10 flex items-center justify-center"><Volume2 className="w-3.5 h-3.5" /></button>
                <button className="w-9 h-9 rounded-full glass-dark bg-white/10 flex items-center justify-center"><Maximize2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <h2 className="font-display text-xl lg:text-2xl font-bold mb-1">{active.title}</h2>
                <p className="text-xs text-white/80">{active.host} · {active.store}</p>
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="hidden sm:block">
                <button className="h-10 px-4 rounded-2xl bg-white text-foreground text-xs font-bold flex items-center gap-1.5 shadow-elegant">
                  <Sparkles className="w-3.5 h-3.5" /> Featured drop
                </button>
              </motion.div>
            </div>

            {/* Floating reactions */}
            <FloatingHearts />
          </div>

          {/* Featured products */}
          <h3 className="font-display text-xl font-bold mt-8 mb-4">Featured in this stream</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-3xl border border-border/60 p-3 shadow-soft hover:shadow-elegant transition-shadow"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3 relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-destructive text-white text-[10px] font-bold">LIVE</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.brand}</p>
                <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold tabular-nums">৳{p.price.toLocaleString()}</span>
                  <motion.button whileTap={{ scale: 0.92 }} onClick={() => add(p)} className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* All streams */}
          <h3 className="font-display text-xl font-bold mt-10 mb-4">More streams</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStreams.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={`text-left rounded-3xl overflow-hidden border-2 transition-all ${active.id === s.id ? "border-foreground shadow-elegant" : "border-transparent hover:border-border"}`}
              >
                <div className="relative aspect-video">
                  <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-foreground/30" />
                  {s.isLive && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center gap-1"><Radio className="w-2.5 h-2.5" /> LIVE</span>}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-foreground/60 text-white text-[10px] font-semibold flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {s.viewers.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-card">
                  <p className="text-sm font-semibold line-clamp-1">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.store}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <aside className="bg-card rounded-3xl border border-border/60 shadow-soft flex flex-col h-[640px] sticky top-24">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Radio className="w-4 h-4 text-destructive" />
            <span className="font-display font-bold">Live chat</span>
            <span className="ml-auto text-xs text-muted-foreground">{active.viewers.toLocaleString()} watching</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {chat.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-start gap-2"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.color} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>{c.user.charAt(0)}</div>
                  <div className="text-sm">
                    <span className="font-semibold mr-1.5">{c.user}</span>
                    <span className="text-foreground/80">{c.msg}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <form onSubmit={sendMsg} className="p-3 border-t border-border flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Say hi..."
              className="flex-1 h-10 px-4 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button type="button" className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/70 flex items-center justify-center" aria-label="React">
              <Heart className="w-4 h-4 text-accent-pink" />
            </button>
            <button type="submit" className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center"><Send className="w-4 h-4" /></button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function FloatingHearts() {
  const [hearts, setHearts] = useState<number[]>([]);
  useEffect(() => {
    const t = setInterval(() => setHearts((h) => [...h.slice(-10), Date.now()]), 800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="absolute right-6 bottom-20 pointer-events-none">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h}
            initial={{ y: 0, opacity: 1, scale: 0.6, x: 0 }}
            animate={{ y: -160, opacity: 0, scale: 1.2, x: (h % 2 === 0 ? 1 : -1) * 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            className="absolute right-0"
          >
            <Heart className="w-5 h-5 fill-accent-pink text-accent-pink" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
