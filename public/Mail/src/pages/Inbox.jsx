import { useMemo, useState } from "react";
import { CheckSquare, Square, Archive, Trash2, Inbox as InboxIcon } from "lucide-react";
import { useMail } from "../context/MailContext";
import MailCard from "../components/MailCard";
import { MailSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 12;

export default function Inbox() {
  const { emails, archiveEmail, deleteEmail } = useMail();
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading] = useState(false);

  const inboxEmails = useMemo(() => {
    let list = emails.filter((m) => m.folder === "inbox" || m.folder === "important");
    if (filter === "unread") list = list.filter((m) => !m.read);
    if (filter === "starred") list = list.filter((m) => m.starred);
    if (filter === "pinned") list = list.filter((m) => m.pinned);
    return list;
  }, [emails, filter]);

  const totalPages = Math.max(1, Math.ceil(inboxEmails.length / PAGE_SIZE));
  const pageItems = inboxEmails.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelected(selected.length === pageItems.length ? [] : pageItems.map((m) => m.id));

  const bulkArchive = () => {
    selected.forEach(archiveEmail);
    setSelected([]);
  };
  const bulkDelete = () => {
    selected.forEach(deleteEmail);
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Inbox</h1>
        <div className="flex flex-wrap gap-2">
          {["all", "unread", "starred", "pinned"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 text-sm capitalize transition-colors ${
                filter === f ? "bg-violet-600 text-white" : "glass text-slate-600 dark:text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass flex items-center gap-3 rounded-2xl p-2.5">
        <button onClick={toggleSelectAll} className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm text-slate-600 dark:text-slate-300">
          {selected.length === pageItems.length && pageItems.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
          Select all
        </button>
        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={bulkArchive} className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-500/10">
              <Archive size={14} /> Archive
            </button>
            <button onClick={bulkDelete} className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm text-rose-500 hover:bg-rose-500/10">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <MailSkeleton />
      ) : pageItems.length === 0 ? (
        <EmptyState icon={InboxIcon} title="No emails here" subtitle="Try a different filter or check back later." />
      ) : (
        <div className="space-y-2">
          {pageItems.map((mail, i) => (
            <MailCard key={mail.id} mail={mail} selected={selected.includes(mail.id)} onSelect={toggleSelect} index={i} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
