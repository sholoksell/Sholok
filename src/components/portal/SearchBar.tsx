import { Mic, MicOff, Camera, Search, X, Tag, LayoutGrid, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { transliterateWord, transliterateText, buildSearchTerms } from "@/lib/transliteration";
import { searchService, SuggestionItem, getLocalizedName } from "@/services/search.service";
import { ImageSearchModal } from "@/components/portal/ImageSearchModal";

interface SearchBarProps { initialQuery?: string; hero?: boolean; }
type InputMode = "EN" | "BN";
const MODE_KEY = "sholok_search_input_mode";
const getMode = (): InputMode => {
  try { const v = localStorage.getItem(MODE_KEY); return v === "BN" ? "BN" : "EN"; } catch { return "EN"; }
};

const SearchBar = ({ initialQuery = "", hero = false }: SearchBarProps) => {
  const [query,      setQuery]    = useState(initialQuery);
  const [inputMode,  setMode]     = useState<InputMode>(getMode);
  const [apiResults, setApi]      = useState<SuggestionItem[]>([]);
  const [dictHints,  setHints]    = useState<{ en: string; bn: string }[]>([]);
  const [showDrop,   setDrop]     = useState(false);
  const [isListening,   setListening]   = useState(false);
  const [imageFile,     setImageFile]   = useState<File | null>(null);

  const navigate       = useNavigate();
  const { t, language } = useLanguage();
  const inputRef       = useRef<HTMLInputElement>(null);
  const wrapRef        = useRef<HTMLDivElement>(null);
  const imageInputRef  = useRef<HTMLInputElement>(null);
  const timer          = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Live search (debounced 300ms) — dictionary hint API removed (endpoint not available)
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setApi([]); setHints([]); setDrop(false); return; }

    timer.current = setTimeout(async () => {
      const { q, qEn } = buildSearchTerms(query.trim(), inputMode);
      try {
        const results = await searchService.getSuggestions(q, qEn);
        setApi(results);
      } catch { setApi([]); }
      setDrop(true);
    }, 300);
  }, [query, inputMode]);

  // Space key: commit current word as Bangla
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputMode !== "BN") return;
    if (e.key === " ") {
      e.preventDefault();
      const parts = query.split(/(\s+)/);
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
    const committed = inputMode === "BN" ? transliterateText(raw) : raw;
    setDrop(false);
    const { q, qEn } = buildSearchTerms(raw, inputMode);
    const params = new URLSearchParams({ q: committed || q });
    if (qEn) params.set("qEn", qEn);
    navigate(`/search?${params.toString()}`);
  };

  // ── Voice search ────────────────────────────────────────────────────────────
  const handleVoiceSearch = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = inputMode === "BN" ? "bn-BD" : "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    try { rec.start(); } catch { setListening(false); return; }
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
      setListening(false);
      navigate(`/search?q=${encodeURIComponent(text)}`);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
  };

  // ── Image search ────────────────────────────────────────────────────────────
  const handleImageSearch = () => imageInputRef.current?.click();
  const handleImageFile   = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
    e.target.value = "";
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

  const lastWord    = query.trim().split(/\s+/).pop() ?? "";
  const wordPreview = inputMode === "BN" && lastWord ? transliterateWord(lastWord) : "";
  const showPreview = wordPreview && wordPreview !== lastWord;
  const hasDropContent = dictHints.length > 0 || apiResults.length > 0;

  // ── Shared dropdown JSX ──────────────────────────────────────────────────────
  const dropdown = showDrop && hasDropContent ? (
    <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-2xl z-[51] overflow-hidden">
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
  ) : null;

  // ── Hero variant (homepage) ──────────────────────────────────────────────────
  if (hero) {
    const toolbarBtn = "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all select-none";
    const toolbarIdle = "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/50";
    return (
      <div className="w-full relative" ref={wrapRef}>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

        {/* Clean wide search form */}
        <form onSubmit={handleSearch}>
          <div className={`flex items-center h-12 sm:h-14 rounded-full border-2 px-3 sm:px-5 gap-2 transition-all duration-200 ${
            isListening
              ? "border-red-400 bg-red-50/60 dark:bg-red-900/20 ring-2 ring-red-300/40"
              : "border-primary bg-card focus-within:ring-2 focus-within:ring-primary/20"
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => hasDropContent && setDrop(true)}
              placeholder={isListening
                ? (language === "BN" ? "শুনছি…" : "Listening…")
                : t("searchPlaceholder")}
              className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base sm:text-lg px-1"
              lang={inputMode === "BN" ? "bn" : "en"}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button type="button" tabIndex={-1}
                onClick={() => { setQuery(""); setApi([]); setHints([]); setDrop(false); }}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-shrink-0 h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-primary text-primary-foreground flex items-center gap-1.5 font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "BN" ? "সার্চ" : "Search"}</span>
            </button>
          </div>
        </form>

        {/* Word preview */}
        {showPreview && (
          <div className="mt-1 px-4 flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground opacity-60">→</span>
            <button type="button" className="text-primary font-semibold hover:underline"
              onClick={() => pickDictHint(wordPreview)} title="ক্লিক করুন বা Space চাপুন">
              {wordPreview}
            </button>
            <span className="text-muted-foreground opacity-40 text-[10px]">Space চাপুন</span>
          </div>
        )}

        {dropdown}

        {/* Search options toolbar */}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          {/* Voice */}
          <button type="button" onClick={handleVoiceSearch}
            title={language === "BN" ? "ভয়েস সার্চ" : "Voice search"}
            className={`${toolbarBtn} ${isListening ? "border border-red-400 bg-red-50/60 dark:bg-red-900/20 text-red-500 animate-pulse" : toolbarIdle}`}>
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{language === "BN" ? "ভয়েস" : "Voice"}</span>
          </button>

          {/* Image search */}
          <button type="button" onClick={handleImageSearch}
            title={language === "BN" ? "ছবি দিয়ে সার্চ" : "Search by image"}
            className={`${toolbarBtn} ${toolbarIdle}`}>
            <Camera className="w-4 h-4" />
            <span>{language === "BN" ? "ছবি" : "Image"}</span>
          </button>

          {/* AI Mode */}
          <Link to="/search?mode=ai"
            className={`${toolbarBtn} ${toolbarIdle} text-primary border-primary/30 hover:border-primary/60`}>
            <Sparkles className="w-4 h-4" />
            <span>{language === "BN" ? "AI মোড" : "AI Mode"}</span>
          </Link>

          {/* BN / EN toggle */}
          <div className={`${toolbarBtn} ${toolbarIdle} p-1 gap-0.5`} role="group" aria-label="Input language">
            {(["BN", "EN"] as InputMode[]).map(m => (
              <button key={m} type="button"
                onClick={() => { setMode(m); setHints([]); setApi([]); setDrop(false); inputRef.current?.focus(); }}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  inputMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {m === "BN" ? "বাং" : "EN"}
              </button>
            ))}
          </div>
        </div>

        <ImageSearchModal file={imageFile} onClose={() => setImageFile(null)} />
      </div>
    );
  }

  // ── Compact variant (header on non-home pages) ───────────────────────────────
  return (
    <div className="w-full relative" ref={wrapRef}>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      <form onSubmit={handleSearch}>
        <div className={`flex items-center h-12 rounded-full border-2 px-2 gap-1 transition-all duration-200 ${
          isListening
            ? "border-red-400 bg-red-50/60 dark:bg-red-900/20 ring-2 ring-red-300/40"
            : "border-primary bg-card focus-within:ring-2 focus-within:ring-primary/20"
        }`}>
          <Link to="/" tabIndex={-1} className="flex-shrink-0 ml-1">
            <span className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl select-none">S</span>
          </Link>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => hasDropContent && setDrop(true)}
            placeholder={isListening
              ? (language === "BN" ? "শুনছি…" : "Listening…")
              : t("searchPlaceholder")}
            className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base px-2"
            lang={inputMode === "BN" ? "bn" : "en"}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button type="button" tabIndex={-1}
              onClick={() => { setQuery(""); setApi([]); setHints([]); setDrop(false); }}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={handleVoiceSearch}
            title={language === "BN" ? "ভয়েস সার্চ" : "Voice search"}
            className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
              isListening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}>
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button type="button" onClick={handleImageSearch}
            title={language === "BN" ? "ছবি দিয়ে সার্চ" : "Search by image"}
            className="flex-shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors hidden sm:flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </button>
          <div className="flex-shrink-0 h-5 w-px bg-border mx-0.5" />
          <div className="flex-shrink-0 flex items-center gap-0.5 rounded-full bg-secondary p-0.5 select-none">
            {(["BN", "EN"] as InputMode[]).map(m => (
              <button key={m} type="button"
                onClick={() => { setMode(m); setHints([]); setApi([]); setDrop(false); inputRef.current?.focus(); }}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                  inputMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {m === "BN" ? "বাং" : "EN"}
              </button>
            ))}
          </div>
          <button type="submit"
            className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors mr-0.5">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="mt-1 px-14 flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground opacity-60">→</span>
          <button type="button" className="text-primary font-semibold hover:underline"
            onClick={() => pickDictHint(wordPreview)} title="ক্লিক করুন বা Space চাপুন">
            {wordPreview}
          </button>
          <span className="text-muted-foreground opacity-40 text-[10px]">Space চাপুন</span>
        </div>
      )}

      {dropdown}
      <ImageSearchModal file={imageFile} onClose={() => setImageFile(null)} />
    </div>
  );
};

export default SearchBar;
