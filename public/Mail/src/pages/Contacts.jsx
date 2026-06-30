import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Phone, Mail as MailIcon } from "lucide-react";
import { useMail } from "../context/MailContext";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";

export default function Contacts() {
  const { contacts } = useMail();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");

  const groups = ["All", "Work", "Friends", "Family", "Clients", "Favorites"];

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase());
      const matchesGroup = group === "All" || (group === "Favorites" ? c.favorite : c.group === group);
      return matchesQuery && matchesGroup;
    });
  }, [contacts, query, group]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Contacts</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
            className="glass rounded-2xl py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              group === g ? "bg-violet-600 text-white" : "glass text-slate-600 dark:text-slate-300"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No contacts found" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 60).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              whileHover={{ y: -3 }}
              className="glass rounded-3xl p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar name={c.name} color={c.avatarColor} initials={c.initials} size={46} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.company}</p>
                </div>
                {c.favorite && <Star size={14} className="ml-auto shrink-0 text-amber-400" fill="#fbbf24" />}
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1.5 truncate"><MailIcon size={12} /> {c.email}</p>
                <p className="flex items-center gap-1.5"><Phone size={12} /> {c.phone}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
