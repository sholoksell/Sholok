import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMail } from "../context/MailContext";
import MailCard from "../components/MailCard";
import EmptyState from "../components/EmptyState";

export default function FolderDetail() {
  const { folderId } = useParams();
  const { folders, emails } = useMail();
  const folder = folders.find((f) => f.id === folderId);
  const label = folder?.name || folderId;

  const items = emails.filter(
    (m) => m.labels.includes(label) || m.folder === folderId
  );

  return (
    <div className="space-y-4">
      <Link to="/folders" className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-500">
        <ArrowLeft size={16} /> All Folders
      </Link>
      <h1 className="text-xl font-bold capitalize text-slate-800 dark:text-white">{label}</h1>
      {items.length === 0 ? (
        <EmptyState title="No emails in this folder" />
      ) : (
        <div className="space-y-2">
          {items.map((mail, i) => (
            <MailCard key={mail.id} mail={mail} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
