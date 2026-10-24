import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { reviewsApi } from "@/lib/api";
import { useAuth } from "@/store/authContext";
import { toast } from "sonner";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase?: boolean;
  user?: { name: string; avatar?: string };
  createdAt?: string;
  sellerReply?: { text: string; repliedAt?: string };
}

export default function ProductReviews({ productId, fallback = [] }: { productId: string; fallback?: any[] }) {
  const { user } = useAuth();
  const [items,   setItems]   = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title,  setTitle]  = useState("");
  const [body,   setBody]   = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.forProduct(productId);
      setItems(res?.reviews || []);
    } catch {
      // fall back to provided mock reviews
      setItems(fallback as any);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [productId]);

  const submit = async () => {
    if (!user) return toast.error("Please sign in to review.");
    if (!body.trim()) return toast.error("Write a short review");
    setPosting(true);
    try {
      await reviewsApi.create(productId, { rating, title, body });
      toast.success("Review posted");
      setBody(""); setTitle(""); setRating(5); setShowForm(false);
      load();
    } catch (err: any) { toast.error(err.message); } finally { setPosting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold">Customer reviews</h3>
        {user && !showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)}>Write a review</Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-4 mb-6 space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`Rate ${n}`}>
                <Star className={`w-5 h-5 ${n <= rating ? "fill-accent-amber text-accent-amber" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={3} placeholder="Share your experience…" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit} disabled={posting}><Send className="w-4 h-4 mr-2" />Post</Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first to share!</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {items.map((r, i) => (
            <motion.div
              key={r._id || i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl bg-card border border-border/60 p-5 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-soft flex items-center justify-center text-base font-bold">
                  {r.user?.name?.[0] || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    {r.user?.name || "Anonymous"}
                    {r.isVerifiedPurchase && <Check className="w-3 h-3 text-accent-mint" />}
                  </p>
                  {r.createdAt && <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>}
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[...Array(r.rating || 5)].map((_, k) => <Star key={k} className="w-3 h-3 fill-accent-amber text-accent-amber" />)}
                </div>
              </div>
              {r.title && <h4 className="font-semibold text-sm mb-1">{r.title}</h4>}
              <p className="text-sm text-foreground/75 leading-relaxed">{r.body}</p>
              {r.sellerReply?.text && (
                <div className="mt-3 ml-3 border-l-2 border-primary/40 pl-3 text-sm bg-primary/5 rounded-r-lg p-2">
                  <p className="text-[11px] font-semibold text-primary mb-1">Seller reply</p>
                  <p>{r.sellerReply.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
