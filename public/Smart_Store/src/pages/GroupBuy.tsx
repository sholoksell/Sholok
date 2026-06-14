import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Clock, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { groupBuysApi } from "@/lib/api";
import { useAuth } from "@/store/authContext";
import { toast } from "sonner";

interface Deal {
  _id:        string;
  title:      string;
  description?: string;
  groupPrice: number;
  originalPrice: number;
  minMembers: number;
  maxMembers?: number;
  currentMembers: string[];
  endsAt:     string;
  status:     "open" | "success" | "failed" | "cancelled";
  product?:   { _id: string; name: string; images?: { url: string }[]; price: number };
}

const fmt = (v: number) => `৳${v.toLocaleString()}`;

function timeLeft(end: string) {
  const ms = new Date(end).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  return `${h}h ${m}m left`;
}

export default function GroupBuyPage() {
  const { user } = useAuth();
  const [deals,  setDeals]  = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await groupBuysApi.active();
      setDeals(res?.deals || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load group buys");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const join = async (id: string) => {
    if (!user) return toast.error("Please sign in to join.");
    try {
      await groupBuysApi.join(id);
      toast.success("You joined the group buy!");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const leave = async (id: string) => {
    try {
      await groupBuysApi.leave(id);
      toast("You left the group buy.");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="container py-10">
      <header className="mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-primary text-white text-xs font-semibold mb-4">
          <Users className="w-3.5 h-3.5" /> Group Buying
        </div>
        <h1 className="text-4xl font-display font-bold mb-2">Buy together. Save more.</h1>
        <p className="text-muted-foreground">
          Join active group buys to unlock exclusive bulk discounts. The deal triggers when enough buyers join before the deadline.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading deals…</div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <Tag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No active group buys right now</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon for new collaborative deals.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, i) => {
            const joined  = !!user && deal.currentMembers.some((m) => String(m) === String(user._id));
            const filled  = deal.currentMembers.length;
            const goal    = deal.minMembers;
            const pct     = Math.min(100, (filled / goal) * 100);
            const savings = deal.originalPrice - deal.groupPrice;

            return (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
              >
                {deal.product?.images?.[0]?.url && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={deal.product.images[0].url} alt={deal.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-lg leading-tight mb-1">{deal.title}</h3>
                  {deal.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{deal.description}</p>}

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold">{fmt(deal.groupPrice)}</span>
                    <span className="text-sm line-through text-muted-foreground">{fmt(deal.originalPrice)}</span>
                    <span className="ml-auto text-xs font-semibold text-accent-pink">Save {fmt(savings)}</span>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{filled}/{goal} joined</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeLeft(deal.endsAt)}</span>
                  </div>

                  <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
                    <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="mt-auto flex gap-2">
                    {deal.product && (
                      <Link to={`/product/${deal.product._id}`} className="flex-1">
                        <Button variant="outline" className="w-full">View <ArrowRight className="w-4 h-4 ml-1" /></Button>
                      </Link>
                    )}
                    {joined ? (
                      <Button variant="secondary" onClick={() => leave(deal._id)} className="flex-1">Leave</Button>
                    ) : (
                      <Button onClick={() => join(deal._id)} className="flex-1">Join</Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
