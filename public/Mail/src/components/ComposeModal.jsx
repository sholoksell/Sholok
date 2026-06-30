import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Minus, Paperclip, Smile, Bold, Italic, Underline, List,
  Link as LinkIcon, Clock, Send, Trash2,
} from "lucide-react";
import { useMail } from "../context/MailContext";
import { useUI } from "../context/UIContext";

export default function ComposeModal() {
  const { composeOpen, setComposeOpen, setDrafts } = useMail();
  const { pushToast } = useUI();
  const [minimized, setMinimized] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [form, setForm] = useState({ to: "", cc: "", bcc: "", subject: "", body: "" });

  if (!composeOpen) return null;

  const close = () => {
    setComposeOpen(false);
    setMinimized(false);
    setForm({ to: "", cc: "", bcc: "", subject: "", body: "" });
  };

  const saveDraft = () => {
    if (form.to || form.subject || form.body) {
      setDrafts((prev) => [
        {
          id: `draft-${Date.now()}`,
          to: form.to,
          subject: form.subject || "(no subject)",
          preview: form.body.slice(0, 80),
          lastEdited: new Date().toISOString(),
        },
        ...prev,
      ]);
      pushToast("Draft saved", "success");
    }
    close();
  };

  const send = () => {
    pushToast("Email sent (UI only)", "success");
    close();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1, height: minimized ? 56 : "auto" }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed bottom-5 right-5 z-50 w-[420px] max-w-[92vw] overflow-hidden rounded-3xl shadow-2xl glass-strong"
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-sky-500 px-4 py-3 text-white">
          <span className="text-sm font-semibold">New Message</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized((m) => !m)} className="rounded-md p-1 hover:bg-white/20">
              <Minus size={16} />
            </button>
            <button onClick={close} className="rounded-md p-1 hover:bg-white/20">
              <X size={16} />
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center border-b border-slate-200/60 dark:border-slate-700/60 py-1.5">
              <span className="w-10 text-xs text-slate-400">To</span>
              <input
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button onClick={() => setShowCc((s) => !s)} className="text-xs text-violet-500 hover:underline">
                Cc/Bcc
              </button>
            </div>
            {showCc && (
              <>
                <div className="flex items-center border-b border-slate-200/60 dark:border-slate-700/60 py-1.5">
                  <span className="w-10 text-xs text-slate-400">Cc</span>
                  <input
                    value={form.cc}
                    onChange={(e) => setForm({ ...form, cc: e.target.value })}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="flex items-center border-b border-slate-200/60 dark:border-slate-700/60 py-1.5">
                  <span className="w-10 text-xs text-slate-400">Bcc</span>
                  <input
                    value={form.bcc}
                    onChange={(e) => setForm({ ...form, bcc: e.target.value })}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </>
            )}
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="border-b border-slate-200/60 dark:border-slate-700/60 bg-transparent py-1.5 text-sm font-medium outline-none"
              placeholder="Subject"
            />
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={8}
              className="resize-none bg-transparent text-sm outline-none"
              placeholder="Write your message..."
            />

            <div className="flex items-center gap-1 border-t border-slate-200/60 dark:border-slate-700/60 pt-2 text-slate-400">
              {[Bold, Italic, Underline, List, LinkIcon, Paperclip, Smile, Clock].map((Icon, i) => (
                <button key={i} className="rounded-lg p-1.5 hover:bg-violet-500/10 hover:text-violet-500">
                  <Icon size={15} />
                </button>
              ))}
            </div>

            <div className="mt-1 flex items-center justify-between">
              <button
                onClick={send}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-md shadow-violet-600/30 hover:opacity-90"
              >
                <Send size={15} /> Send
              </button>
              <div className="flex items-center gap-1 text-slate-400">
                <button onClick={saveDraft} className="rounded-lg p-2 hover:bg-violet-500/10 text-xs">
                  Save draft
                </button>
                <button onClick={close} className="rounded-lg p-2 hover:bg-rose-500/10 hover:text-rose-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
