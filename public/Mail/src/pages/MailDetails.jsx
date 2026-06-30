import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Reply, Forward, Trash2, Archive, Printer, Share2, Star, Paperclip, Download,
} from "lucide-react";
import { useMail } from "../context/MailContext";
import { useUI } from "../context/UIContext";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";

export default function MailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { emails, markRead, toggleStar, deleteEmail, archiveEmail } = useMail();
  const { pushToast } = useUI();
  const mail = emails.find((m) => m.id === id);

  useEffect(() => {
    if (mail && !mail.read) markRead(mail.id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!mail) return <EmptyState title="Email not found" subtitle="This email may have been deleted or moved." />;

  const actions = [
    { icon: Reply, label: "Reply", onClick: () => pushToast("Reply opened (UI only)") },
    { icon: Forward, label: "Forward", onClick: () => pushToast("Forward opened (UI only)") },
    {
      icon: Archive,
      label: "Archive",
      onClick: () => {
        archiveEmail(mail.id);
        pushToast("Email archived", "success");
        navigate("/inbox");
      },
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => {
        deleteEmail(mail.id);
        pushToast("Email moved to trash", "success");
        navigate("/inbox");
      },
    },
    { icon: Printer, label: "Print", onClick: () => window.print() },
    { icon: Share2, label: "Share", onClick: () => pushToast("Share link copied (UI only)") },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-500">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{mail.subject}</h1>
          <button onClick={() => toggleStar(mail.id)}>
            <Star size={22} fill={mail.starred ? "#fbbf24" : "none"} className={mail.starred ? "text-amber-400" : "text-slate-300"} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Avatar name={mail.sender.name} color={mail.sender.avatarColor} initials={mail.sender.initials} size={48} />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{mail.sender.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{mail.sender.email}</p>
          </div>
          <span className="ml-auto text-xs text-slate-400">{new Date(mail.date).toLocaleString()}</span>
        </div>

        <div className="my-5 flex flex-wrap gap-2 border-y border-slate-200/60 dark:border-slate-700/60 py-3">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-slate-600 hover:bg-violet-500/10 hover:text-violet-600 dark:text-slate-300"
            >
              <a.icon size={15} /> {a.label}
            </button>
          ))}
        </div>

        <div className="prose max-w-none whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {mail.body}
        </div>

        {mail.attachments.length > 0 && (
          <div className="mt-6 border-t border-slate-200/60 dark:border-slate-700/60 pt-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Paperclip size={14} /> Attachments ({mail.attachments.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {mail.attachments.map((att) => (
                <div key={att.id} className="glass flex items-center gap-3 rounded-2xl p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-xs font-bold text-violet-500">
                    {att.name.split(".").pop().toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{att.name}</p>
                    <p className="text-xs text-slate-400">{att.size}</p>
                  </div>
                  <button className="ml-2 text-slate-400 hover:text-violet-500">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
