import { Search, X, Tag, LayoutGrid } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { transliterateWord, transliterateText, buildSearchTerms } from "@/lib/transliteration";
import { searchService, SuggestionItem, getLocalizedName } from "@/services/search.service";

interface SearchBarProps { initialQuery?: string; }
type InputMode = "EN" | "BN";
const MODE_KEY = "sholok_search_input_mode";
const getMode = (): InputMode => {
  try { const v = localStorage.getItem(MODE_KEY); return v === "BN" ? "BN" : "EN"; } catch { return "EN"; }
};

const SearchBar = ({ initialQuery = "" }: SearchBarProps) => {
  const [query,      setQuery]    = useState(initialQuery);
  const [inputMode,  setMode]     = useState<InputMode>(getMode);
  const [apiResults, setApi]      = useState<SuggestionItem[]>([]);
  const [dictHints,  setHints]    = useState<{ en: string; bn: string }[]>([]);
  const [showDrop,   setDrop]     = useState(false);

  const navigate  = useNavigate();
  const { t, language } = useLanguage();
  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const timer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);
  useEffect(() => { try { localStorage.setItem(MODE_KEY, inputMode); } catch {} }, [inputMode]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Live search + dict hints (debounced 300ms) ──────────────────────────
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setApi([]); setHints([]); setDrop(false); return; }

    timer.current = setTimeout(async () => {
      const { q, qEn } = buildSearchTerms(query.trim(), inputMode);
      // Dictionary prefix hints via backend API (both modes)
      const lastWord = query.trim().split(/\s+/).pop() ?? "";
      if (lastWord.length >= 2) {
        try {
          const res = await fetch(`/api/dictionary/suggest?q=${encodeURIComponent(lastWord.toLowerCase())}&limit=5`);
          if (res.ok) setHints(await res.json());
          else setHints([]);
        } catch { setHints([]); }
      } else {
        setHints([]);
      }
      // Live API suggestions
      try {
        const results = await searchService.getSuggestions(q, qEn);
        setApi(results);
      } catch { setApi([]); }
      setDrop(true);
    }, 300);
  }, [query, inputMode]);

  // ── Space key: commit current word as Bangla ────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputMode !== "BN") return;
    if (e.key === " ") {
      e.preventDefault();
      const parts = query.split(/(\s+)/);
      // Convert the last non-space token
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i].trim()) { parts[i] = transliterateWord(parts[i]); break; }
      }
      setQuery(parts.join("") + " ");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = query.trim(); if (!raw) return;
    // Commit any pending last word first
    const committed = inputMode === "BN" ? transliterateText(raw) : raw;
    setDrop(false);
    const { q, qEn } = buildSearchTerms(raw, inputMode);
    const params = new URLSearchParams({ q: committed || q });
    if (qEn) params.set("qEn", qEn);
    navigate(`/search?${params.toString()}`);
  };

  const pickApiSuggestion = (s: SuggestionItem) => {
    setDrop(false);
    if (s.type === "category") navigate(`/search?q=${encodeURIComponent(getLocalizedName(s, "EN"))}`);
    else window.location.href = `/shopping/product/${s.slug}`;
  };

  const pickDictHint = (bn: string) => {
    const words = query.trim().split(/\s+/);
    words[words.length - 1] = bn;
    setQuery(words.join(" ") + " ");
    setHints([]); inputRef.current?.focus();
  };

  // Live word preview
  const lastWord     = query.trim().split(/\s+/).pop() ?? "";
  const wordPreview  = inputMode === "BN" && lastWord ? transliterateWord(lastWord) : "";
  const showPreview  = wordPreview && wordPreview !== lastWord;
  const hasDropContent = dictHints.length > 0 || apiResults.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4" ref={wrapRef}>
      <form onSubmit={handleSearch} className="relative flex items-center">

        {/* S Logo */}
        <div className="absolute left-4 z-10">
          <Link to="/" tabIndex={-1}>
            <span className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl select-none">S</span>
          </Link>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => hasDropContent && setDrop(true)}
          placeholder={t("searchPlaceholder")}
          className="search-input pl-14 pr-28"
          lang={inputMode === "BN" ? "bn" : "en"}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear */}
        {query && (
          <button type="button" tabIndex={-1}
            onClick={() => { setQuery(""); setApi([]); setHints([]); setDrop(false); }}
            className="absolute right-[7.5rem] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* বাং / EN toggle */}
        <div className="absolute right-14 flex items-center gap-0.5 rounded-full bg-secondary p-0.5 select-none z-10">
          {(["BN","EN"] as InputMode[]).map(m => (
            <button key={m} type="button"
              onClick={() => { setMode(m); setHints([]); setApi([]); setDrop(false); inputRef.current?.focus(); }}
              className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                inputMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {m === "BN" ? "বাং" : "EN"}
            </button>
          ))}
        </div>

        <button type="submit" className="search-button"><Search className="w-5 h-5" /></button>
      </form>

      {/* Live word preview strip */}
      {showPreview && (
        <div className="mt-1 px-14 flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground opacity-60">→</span>
          <button type="button"
            className="text-primary font-semibold hover:underline"
            onClick={() => pickDictHint(wordPreview)}
            title="ক্লিক করুন বা Space চাপুন">
            {wordPreview}
          </button>
          <span className="text-muted-foreground opacity-40 text-[10px]">Space চাপুন</span>
        </div>
      )}

      {/* ── Unified Dropdown ──────────────────────────────────────────────── */}
      {showDrop && hasDropContent && (
        <div className="absolute left-0 right-0 mx-4 mt-1 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Dictionary hints (BN mode) */}
          {dictHints.length > 0 && (
            <div className="border-b border-border">
              {dictHints.map((h, i) => (
                <button key={i} type="button" onMouseDown={() => pickDictHint(h.bn)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left">
                  <Search className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="font-semibold text-sm text-foreground">{h.bn}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{h.en}</span>
                </button>
              ))}
            </div>
          )}

          {/* Live API product/category results */}
          {apiResults.map((s, i) => {
            const label = getLocalizedName(s, language);
            return (
              <button key={i} type="button" onMouseDown={() => pickApiSuggestion(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left">
                {s.type === "product" && s.thumbnail
                  ? <img src={s.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-secondary" />
                  : <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-base">
                      {s.type === "category"
                        ? (s.icon || <LayoutGrid className="w-4 h-4 text-muted-foreground" />)
                        : <Tag className="w-4 h-4 text-muted-foreground" />}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{label}</p>
                  {s.type === "product" && s.regularPrice != null && (
                    <p className="text-xs text-muted-foreground">
                      {s.salePrice != null
                        ? <><span className="text-primary font-semibold">৳{s.salePrice}</span> <span className="line-through">৳{s.regularPrice}</span></>
                        : `৳${s.regularPrice}`}
                    </p>
                  )}
                  {s.type === "category" && (
                    <p className="text-xs text-muted-foreground">{language === "BN" ? "বিভাগ" : "Category"}</p>
                  )}
                </div>
                <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}

          {/* Footer */}
          {query.trim() && (
            <button type="button" onMouseDown={handleSearch}
              className="w-full border-t border-border px-4 py-2.5 flex items-center gap-2 text-sm text-primary hover:bg-secondary/30 transition-colors">
              <Search className="w-3.5 h-3.5" />
              {language === "BN"
                ? `"${inputMode === "BN" ? transliterateText(query.trim()) : query.trim()}" এর সব ফলাফল দেখুন`
                : `See all results for "${query.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
