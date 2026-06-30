import { Star } from "lucide-react";
import { useMail } from "../context/MailContext";
import MailCard from "../components/MailCard";
import EmptyState from "../components/EmptyState";

export default function Starred() {
  const { starredEmails } = useMail();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Starred</h1>
      {starredEmails.length === 0 ? (
        <EmptyState icon={Star} title="No starred emails" />
      ) : (
        <div className="space-y-2">
          {starredEmails.map((mail, i) => (
            <MailCard key={mail.id} mail={mail} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
