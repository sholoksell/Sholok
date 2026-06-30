import { motion } from "framer-motion";
import { Star, Pin, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { useMail } from "../context/MailContext";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

const PRIORITY_COLORS = {
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  normal: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  low: "bg-slate-400/15 text-slate-500 dark:text-slate-400",
};

export default function MailCard({ mail, selected, onSelect, index = 0 }) {
  const { toggleStar, togglePin } = useMail();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4) }}
      whileHover={{ y: -2 }}
      className={`group relative flex items-center gap-3 rounded-2xl p-3 transition-colors glass hover:shadow-lg ${
        !mail.read ? "border-l-4 border-violet-500" : "border-l-4 border-transparent"
      }`}
    >
      <input
        type="checkbox"
        checked={!!selected}
        onChange={() => onSelect?.(mail.id)}
        className="size-4 accent-violet-600"
        aria-label="Select email"
      />
      <Avatar name={mail.sender.name} color={mail.sender.avatarColor} initials={mail.sender.initials} />
      <Link to={`/mail/${mail.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`truncate text-sm ${!mail.read ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
            {mail.sender.name}
          </span>
          {mail.pinned && <Pin size={12} className="text-violet-500" />}
          {mail.priority !== "normal" && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[mail.priority]}`}>
              {mail.priority}
            </span>
          )}
          <span className="ml-auto shrink-0 text-xs text-slate-400">{timeAgo(mail.date)}</span>
        </div>
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{mail.subject}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{mail.preview}</p>
      </Link>
      {mail.hasAttachment && <Paperclip size={14} className="text-slate-400" />}
      <button
        onClick={() => toggleStar(mail.id)}
        aria-label="Toggle star"
        className="text-slate-300 hover:text-amber-400"
      >
        <Star size={18} fill={mail.starred ? "#fbbf24" : "none"} className={mail.starred ? "text-amber-400" : ""} />
      </button>
      <button
        onClick={() => togglePin(mail.id)}
        aria-label="Toggle pin"
        className="text-slate-300 hover:text-violet-500"
      >
        <Pin size={16} fill={mail.pinned ? "#7c3aed" : "none"} className={mail.pinned ? "text-violet-500" : ""} />
      </button>
    </motion.div>
  );
}
