import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X, History } from "lucide-react";
import { useMail } from "../context/MailContext";
import MailCard from "../components/MailCard";
import EmptyState from "../components/EmptyState";

const FILTERS = ["Sender", "Subject", "Keyword", "Date", "Attachment"];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState([]);
  const { emails, searchHistory, addSearchTerm } = useMail();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return emails.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.sender.name.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q)
    );
  }, [query, emails]);

  const submit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      addSearchTerm(query.trim());
      setParams({ q: query.trim() });
    }
  };

  const toggleFilter = (f) =>
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="relative">
        <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by sender, subject, keyword, date..."
          className="glass w-full rounded-2xl py-3.5 pl-11 pr-10 text-sm outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <X size={16} />
          </button>
        )}
      </form>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => toggleFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilters.includes(f) ? "bg-violet-600 text-white" : "glass text-slate-600 dark:text-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!query && (
        <div className="glass rounded-3xl p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <History size={15} /> Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((h) => (
              <button
                key={h}
                onClick={() => {
                  setQuery(h);
                  setParams({ q: h });
                }}
                className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs text-violet-600 hover:bg-violet-500/20 dark:text-violet-300"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && results.length === 0 && (
        <EmptyState title="No results found" subtitle={`We couldn't find anything matching "${query}"`} />
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((mail, i) => (
            <MailCard key={mail.id} mail={mail} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
