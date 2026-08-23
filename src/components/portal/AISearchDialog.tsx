import { useState, useEffect, useRef } from "react";
import {
  X, Sparkles, Search, AlertCircle, Loader2,
  ShoppingBag, FolderOpen, Bot, Settings2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchService, SuggestionItem, getLocalizedName } from "@/services/search.service";
import { getGlobalSuggestions } from "@/services/globalSearch.service";
import { transliterateText } from "@/lib/transliteration";

interface AISearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const EXAMPLES = [
  { en: "show me fruits under 500 taka",              bn: "৫০০ টাকার মধ্যে ফল দেখাও"       },
  { en: "fresh vegetables near me",                   bn: "তাজা সবজি দেখাও"                 },
  { en: "ami kom dame bhalo phone khujtesi",          bn: "কম দামে ভালো ফোন খুঁজছি"        },
  { en: "snacks under 200 taka",                      bn: "২০০ টাকার মধ্যে snacks দেখাও"   },
];

type ResultState = {
  answer:          string | null;
  products:        SuggestionItem[];
  categories:      SuggestionItem[];
  interpreted?:    string;
  configError?:    boolean;
  configMessage?:  string;
};

const AISearchDialog = ({ isOpen, onClose, onSearch }: AISearchDialogProps) => {
  const { language } = useLanguage();
  const [aiQuery,  setAiQuery]  = useState("");
  const [results,  setResults]  = useState<ResultState | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAiQuery("");
      setResults(null);
      setError("");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const doAiSearch = async () => {
    const q = aiQuery.trim();
    if (!q || loading) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await searchService.aiSearch(q, language);

      if (data.success || data.configError) {
        setResults({
          answer:         data.answer ?? null,
          products:       data.products  ?? [],
          categories:     data.categories ?? [],
          interpreted:    data.interpretedQuery,
          configError:    data.configError,
          configMessage:  data.message,
        });
        return;
      }

      // success:false without configError → API error, try local fallback
      throw new Error(data.message || "AI search unavailable");

    } catch (err: any) {
      // Fallback: use existing global search (includes Banglish expansion)
      try {
        const suggestions = await getGlobalSuggestions(q, undefined, language);
        setResults({
          answer:     null,
          products:   suggestions.filter((s) => s.type === "product").map((s) => ({
            type: "product" as const,
            name: s.name, nameBn: s.nameBn, slug: s.slug || "",
            thumbnail: s.thumbnail, regularPrice: s.regularPrice, salePrice: s.salePrice,
          })),
          categories: suggestions.filter((s) => s.type === "category").map((s) => ({
            type: "category" as const,
            name: s.name, nameBn: s.nameBn, slug: s.slug || "", icon: s.icon,
          })),
          configError: true,
          configMessage: language === "BN"
            ? "AI উত্তর পাওয়া যায়নি — ডেটাবেস ফলাফল দেখানো হচ্ছে।"
            : "AI answer unavailable — showing database results.",
        });
      } catch {
        setError(
          language === "BN"
            ? "সার্চে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
            : "Search failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const hasProducts    = (results?.products.length  ?? 0) > 0;
  const hasCategories  = (results?.categories.length ?? 0) > 0;
  const hasDbResults   = hasProducts || hasCategories;
  const noDbResults    = results !== null && !hasDbResults;
  const hasAiAnswer    = !!results?.answer;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={language === "BN" ? "AI সার্চ" : "AI Search"}
        aria-describedby="ai-dialog-desc"
        className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-[6vh] z-[60]
          w-auto sm:w-full sm:max-w-2xl bg-card border border-border rounded-2xl shadow-2xl
          max-h-[88vh] flex flex-col overflow-hidden
          animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600
              flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base leading-tight">
                {language === "BN" ? "AI সার্চ" : "AI Search"}
              </h2>
              <p id="ai-dialog-desc" className="text-xs text-muted-foreground leading-tight">
                {language === "BN"
                  ? "স্বাভাবিক ভাষায় যা চান বলুন"
                  : "Describe what you're looking for in plain language"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={language === "BN" ? "বন্ধ করুন" : "Close"}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Query input */}
          <div className="p-5 space-y-3">
            <textarea
              ref={textareaRef}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doAiSearch(); }
              }}
              placeholder={
                language === "BN"
                  ? "যেমন: ৫০০০০ টাকার মধ্যে ভালো ফোন কোনটা?"
                  : "e.g. Show me good phones under 50000 taka"
              }
              rows={3}
              aria-label={language === "BN" ? "AI সার্চ কোয়েরি" : "AI search query"}
              className="w-full px-4 py-3 bg-secondary/50 rounded-xl border border-border
                text-foreground placeholder:text-muted-foreground text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            />

            <button
              onClick={doAiSearch}
              disabled={loading || !aiQuery.trim()}
              aria-busy={loading}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600
                hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl transition-all flex items-center
                justify-center gap-2 shadow-sm active:scale-[.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === "BN" ? "AI খুঁজছে..." : "AI is searching..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === "BN" ? "AI দিয়ে সার্চ করুন" : "Search with AI"}</span>
                </>
              )}
            </button>

            {/* Example queries — shown before first search */}
            {!results && !loading && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {language === "BN" ? "উদাহরণ প্রশ্ন" : "Try these"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAiQuery(language === "BN" ? ex.bn : ex.en)}
                      className="text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary
                        text-xs text-muted-foreground hover:text-foreground transition-colors
                        border border-transparent hover:border-border/40"
                    >
                      {language === "BN" ? ex.bn : ex.en}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Loading indicator ──────────────────────────────────────────── */}
          {loading && (
            <div className="mx-5 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl
              bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600
                flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {language === "BN" ? "AI খুঁজছে..." : "AI is searching..."}
                </p>
                <p className="text-xs text-violet-500 dark:text-violet-400">
                  {language === "BN"
                    ? "Sholok ডেটাবেস এবং AI বিশ্লেষণ চলছে"
                    : "Querying Sholok database and generating answer"}
                </p>
              </div>
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {error && (
            <div className="mx-5 mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl
              bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Results ───────────────────────────────────────────────────── */}
          {results && !loading && (
            <div className="px-5 pb-5 space-y-5">

              {/* Config notice (no API key / auth error) */}
              {results.configError && results.configMessage && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl
                  bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-sm">
                  <Settings2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-700 dark:text-amber-300">{results.configMessage}</span>
                </div>
              )}

              {/* 🤖 AI Answer */}
              {hasAiAnswer && (
                <div className="rounded-xl border border-violet-200 dark:border-violet-800/50
                  bg-violet-50 dark:bg-violet-900/20 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5
                    border-b border-violet-200 dark:border-violet-800/50
                    bg-violet-100/60 dark:bg-violet-900/30">
                    <Bot className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                      {language === "BN" ? "AI উত্তর" : "AI Answer"}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {results.answer}
                    </p>
                  </div>
                </div>
              )}

              {/* Interpreted query pill */}
              {results.interpreted && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">
                    {language === "BN" ? "সার্চ করা হয়েছে:" : "Searched for:"}
                  </span>{" "}
                  <span className="text-foreground">{results.interpreted}</span>
                </p>
              )}

              {/* 📂 Related Categories */}
              {hasCategories && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {language === "BN" ? "সম্পর্কিত বিভাগ" : "Related Categories"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((c, i) => (
                      <Link
                        key={i}
                        to={`/search?q=${encodeURIComponent(c.name || getLocalizedName(c, "EN"))}`}
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          bg-secondary hover:bg-secondary/70 transition-colors text-sm text-foreground"
                      >
                        {c.icon && <span className="text-base leading-none">{c.icon}</span>}
                        <span>{getLocalizedName(c, language)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 🛒 Relevant Products */}
              {hasProducts && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {language === "BN" ? "সম্পর্কিত পণ্য" : "Relevant Products"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {results.products.slice(0, 6).map((p, i) => (
                      <a
                        key={i}
                        href={`/shopping/product/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-xl
                          hover:bg-secondary/50 transition-colors group"
                      >
                        {p.thumbnail
                          ? <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-secondary" />
                          : <div className="w-10 h-10 rounded-lg bg-secondary flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate
                            group-hover:text-primary transition-colors">
                            {getLocalizedName(p, language)}
                          </p>
                          {p.regularPrice != null && (
                            <p className="text-xs">
                              {p.salePrice != null ? (
                                <>
                                  <span className="text-primary font-semibold">৳{p.salePrice}</span>
                                  {" "}
                                  <span className="text-muted-foreground line-through ml-1">৳{p.regularPrice}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">৳{p.regularPrice}</span>
                              )}
                            </p>
                          )}
                        </div>
                        <Search className="w-3.5 h-3.5 text-muted-foreground opacity-0
                          group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* No Sholok results note */}
              {noDbResults && !hasAiAnswer && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm font-medium">
                    {language === "BN"
                      ? "Sholok-এ কোনো মিলন্ত পণ্য বা বিভাগ পাওয়া যায়নি"
                      : "No matching Sholok products or categories found"}
                  </p>
                  <p className="text-xs mt-1">
                    {language === "BN"
                      ? "ভিন্ন শব্দ দিয়ে চেষ্টা করুন"
                      : "Try different keywords or browse by category"}
                  </p>
                </div>
              )}

              {noDbResults && hasAiAnswer && (
                <p className="text-xs text-muted-foreground italic text-center">
                  {language === "BN"
                    ? "এই মুহূর্তে Sholok-এ কোনো মিলন্ত পণ্য নেই।"
                    : "No matching products currently available in Sholok's inventory."}
                </p>
              )}

              {/* View all results button */}
              {(hasDbResults || hasAiAnswer) && (
                <button
                  onClick={() => onSearch(aiQuery)}
                  className="w-full py-2.5 border border-border rounded-xl text-sm text-primary
                    hover:bg-secondary/30 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Search className="w-4 h-4" />
                  {language === "BN" ? "সব ফলাফল দেখুন" : "View all results"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AISearchDialog;
