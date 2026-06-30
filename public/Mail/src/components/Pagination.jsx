import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-xl p-2 text-slate-500 hover:bg-violet-500/10 disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
          <button
            onClick={() => onChange(p)}
            className={`min-w-9 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
              p === page
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-600 hover:bg-violet-500/10 dark:text-slate-300"
            }`}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-xl p-2 text-slate-500 hover:bg-violet-500/10 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
