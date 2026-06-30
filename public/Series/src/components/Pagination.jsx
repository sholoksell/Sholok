import { ChevronLeft, ChevronRight } from 'lucide-react';

function bnNum(n) {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n)
    .split('')
    .map((d) => (map[d] !== undefined ? map[d] : d))
    .join('');
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-brand-700 disabled:opacity-30 dark:border-white/10 dark:text-gold-400"
      >
        <ChevronRight size={16} />
      </button>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-2">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="text-gray-400">...</span>}
          <button
            type="button"
            onClick={() => onChange(p)}
            className={`grid h-9 w-9 place-items-center rounded-full text-sm font-medium transition ${
              p === page ? 'bg-brand-600 text-white' : 'border border-black/10 text-gray-600 dark:border-white/10 dark:text-gray-300'
            }`}
          >
            {bnNum(p)}
          </button>
        </span>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-brand-700 disabled:opacity-30 dark:border-white/10 dark:text-gold-400"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );
}

export default Pagination;
