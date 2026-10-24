import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { questionsApi } from "@/lib/api";
import { useAuth } from "@/store/authContext";
import { toast } from "sonner";

interface Answer {
  _id?: string;
  body: string;
  isSeller: boolean;
  user?: { name: string; avatar?: string };
  createdAt?: string;
}
interface Question {
  _id: string;
  body: string;
  user?: { name: string; avatar?: string };
  answers: Answer[];
  createdAt?: string;
  status: string;
}

export default function ProductQA({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [items,    setItems]    = useState<Question[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [draft,    setDraft]    = useState("");
  const [posting,  setPosting]  = useState(false);
  const [answerFor, setAnswerFor] = useState<string | null>(null);
  const [answer,    setAnswer]    = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await questionsApi.forProduct(productId);
      setItems(res?.questions || []);
    } catch { /* silently */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [productId]);

  const ask = async () => {
    if (!user) return toast.error("Please sign in to ask a question.");
    if (draft.trim().length < 3) return toast.error("Question is too short");
    setPosting(true);
    try {
      await questionsApi.ask(productId, draft.trim());
      setDraft("");
      toast.success("Question posted");
      load();
    } catch (err: any) { toast.error(err.message); } finally { setPosting(false); }
  };

  const submitAnswer = async (qid: string) => {
    if (!user) return toast.error("Please sign in to answer.");
    if (!answer.trim()) return;
    try {
      await questionsApi.answer(qid, answer.trim());
      setAnswer(""); setAnswerFor(null);
      toast.success("Answer posted");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-display font-bold text-xl">Questions & Answers</h3>
        <span className="text-sm text-muted-foreground">({items.length})</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Textarea
          rows={2}
          placeholder={user ? "Ask the seller a question…" : "Sign in to ask a question"}
          value={draft}
          disabled={!user}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <Button onClick={ask} disabled={posting || !user}><Send className="w-4 h-4 mr-2" />Post question</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions yet — be the first to ask.</p>
      ) : (
        <div className="space-y-3">
          {items.map((q, i) => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary shrink-0 flex items-center justify-center text-sm font-bold">
                  {q.user?.name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{q.user?.name || "Anonymous"}</div>
                  <p className="mt-1">{q.body}</p>
                </div>
              </div>

              {q.answers.length > 0 && (
                <div className="mt-3 ml-12 space-y-2 border-l-2 border-border pl-4">
                  {q.answers.map((a, idx) => (
                    <div key={a._id || idx} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.user?.name || "User"}</span>
                        {a.isSeller && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-primary text-white">Seller</span>}
                      </div>
                      <p className="text-foreground/80 mt-0.5">{a.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {answerFor === q._id ? (
                <div className="mt-3 ml-12">
                  <Textarea rows={2} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer…" />
                  <div className="flex gap-2 justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setAnswerFor(null); setAnswer(""); }}>Cancel</Button>
                    <Button size="sm" onClick={() => submitAnswer(q._id)}>Post answer</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 ml-12">
                  <button onClick={() => setAnswerFor(q._id)} className="text-xs text-primary hover:underline">Answer</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
