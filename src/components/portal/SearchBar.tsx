import { Search, X, Keyboard, Mic, Camera, Sparkles, MicOff, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { transliterateText } from "@/lib/transliteration";
import { searchService } from "@/services/search.service";
import {
  getGlobalSuggestions,
  GlobalSuggestionItem,
  GLOBAL_TYPE_META,
  getItemUrl,
} from "@/services/globalSearch.service";
import BengaliKeyboard from "@/components/portal/BengaliKeyboard";
import AISearchDialog from "@/components/portal/AISearchDialog";
import { useImageClassifier } from "@/hooks/useImageClassifier";

interface SearchBarProps {
  initialQuery?: string;
  /** "hero" = large centered (homepage), "default" = compact (other pages) */
  variant?: "default" | "hero";
}

/**
 * Silently transliterate Banglish → Bengali for the backend qEn param only.
 * The user's original typed text is NEVER modified.
 */
function getSearchParams(raw: string): { q: string; qEn?: string } {
  const q = raw.trim();
  if (!q) return { q: "" };
  const bn = transliterateText(q);
  return { q, qEn: bn !== q ? bn : undefined };
}

const SearchBar = ({ initialQuery = "", variant = "default" }: SearchBarProps) => {
  const [query,          setQuery]        = useState(initialQuery);
  const [suggestions,    setSuggestions]  = useState<GlobalSuggestionItem[]>([]);
  const [showDrop,       setDrop]         = useState(false);
  const [activeIdx,      setActiveIdx]    = useState(-1);
  const [isKeyboardOpen, setKbOpen]       = useState(false);
  const [isListening,    setIsListening]  = useState(false);
  const [voiceMsg,       setVoiceMsg]     = useState("");
  const [isImageLoading, setImageLoading] = useState(false);
  const [imageMsg,       setImageMsg]     = useState("");
  const [aiOpen,         setAiOpen]       = useState(false);
  const [dropError,      setDropError]    = useState(false);

  const navigate        = useNavigate();
  const { t, language } = useLanguage();
  const { classify, modelStatus } = useImageClassifier();

  const inputRef       = useRef<HTMLInputElement>(null);
  const wrapRef        = useRef<HTMLDivElement>(null);
  const imageInputRef  = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortCtrlRef   = useRef<AbortController | null>(null);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHero = variant === "hero";

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  // Ctrl/Cmd+K → focus search
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // Close dropdown + keyboard on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDrop(false);
        setKbOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Debounced live suggestions
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveIdx(-1);
    setDropError(false);
    if (!query.trim()) { setSuggestions([]); setDrop(false); return; }

    timerRef.current = setTimeout(async () => {
      abortCtrlRef.current?.abort();
      const ctrl = new AbortController();
      abortCtrlRef.current = ctrl;

      const { q, qEn } = getSearchParams(query);
      try {
        const res = await getGlobalSuggestions(q, qEn, language, ctrl.signal);
        if (!ctrl.signal.aborted) {
          setSuggestions(res);
          setDropError(false);
          if (!isKeyboardOpen) setDrop(true);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setSuggestions([]);
        setDropError(true);
      }
    }, 280);
  }, [query, isKeyboardOpen]);

  // ─── Input handlers ──────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // never transform — preserve exactly what the user typed
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Escape":  setDrop(false); setKbOpen(false); break;
      case "ArrowDown":
        e.preventDefault();
        if (showDrop) setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        if (activeIdx >= 0 && suggestions[activeIdx]) {
          e.preventDefault();
          pickSuggestion(suggestions[activeIdx]);
        }
        break;
    }
  };

  // ─── Search navigation ───────────────────────────────────────────────────
  const doSearch = useCallback((raw: string) => {
    if (!raw.trim()) return;
    setDrop(false);
    setKbOpen(false);
    const { q, qEn } = getSearchParams(raw);
    const params = new URLSearchParams({ q });
    if (qEn) params.set("qEn", qEn);
    navigate(`/search?${params.toString()}`);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(query); };

  const pickSuggestion = (s: GlobalSuggestionItem) => {
    setDrop(false);
    const { href, to } = getItemUrl(s);
    if (href) window.location.href = href;
    else if (to) navigate(to);
    else doSearch(s.name);
  };

  // ─── Voice search ────────────────────────────────────────────────────────
  const startVoiceSearch = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      const msg = language === "BN"
        ? "এই ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়"
        : "Voice search is not supported in this browser";
      setVoiceMsg(msg);
      setTimeout(() => setVoiceMsg(""), 3500);
      return;
    }
    if (isListening) { recognitionRef.current?.stop(); return; }

    const recognition = new SpeechRec();
    // en-US captures Banglish (romanized Bengali); Banglish expansion handles the rest
    recognition.lang             = "en-US";
    recognition.continuous       = false;
    recognition.interimResults   = true;
    recognition.maxAlternatives  = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceMsg(language === "BN" ? "শুনছি..." : "Listening...");
    };
    recognition.onend = () => { setIsListening(false); setVoiceMsg(""); };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript).join("");
      setQuery(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        setTimeout(() => doSearch(transcript), 200);
      }
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      const msgs: Record<string, { en: string; bn: string }> = {
        "not-allowed": { en: "Microphone permission denied",   bn: "মাইক্রোফোন অনুমতি দিন" },
        "no-speech":   { en: "No speech detected — try again", bn: "কথা শোনা যায়নি — আবার চেষ্টা করুন" },
        "network":     { en: "Network error",                  bn: "নেটওয়ার্ক সমস্যা" },
      };
      const m = msgs[event.error] || { en: "Voice recognition failed", bn: "ভয়েস সার্চ ব্যর্থ হয়েছে" };
      setVoiceMsg(language === "BN" ? m.bn : m.en);
      setTimeout(() => setVoiceMsg(""), 3500);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // ─── Image search ────────────────────────────────────────────────────────
  // Primary: Gemini 1.5 Flash (free AI, best accuracy).
  // Fallback: MobileNet + label map (runs offline in browser).
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    setImageMsg(language === "BN" ? "ছবি বিশ্লেষণ করা হচ্ছে…" : "Analyzing image…");

    try {
      const keywords = await classify(file);

      if (keywords) {
        setQuery(keywords);
        setImageMsg("");
        doSearch(keywords);
      } else {
        // Fallback: use the filename as query
        const fallback = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
        if (fallback) {
          setQuery(fallback);
          setImageMsg("");
          doSearch(fallback);
        } else {
          setImageMsg(language === "BN" ? "পণ্য চেনা যায়নি, আবার চেষ্টা করুন" : "Could not identify product, try another image");
          setTimeout(() => setImageMsg(""), 4000);
        }
      }
    } catch {
      setImageMsg(language === "BN" ? "ছবি বিশ্লেষণ ব্যর্থ হয়েছে" : "Image analysis failed");
      setTimeout(() => setImageMsg(""), 3500);
    } finally {
      setImageLoading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // ─── Bengali virtual keyboard ────────────────────────────────────────────
  const insertAtCursor = (char: string) => {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) { setQuery((q) => q + char); return; }
    const s = input.selectionStart ?? query.length;
    const e = input.selectionEnd   ?? query.length;
    const next = query.substring(0, s) + char + query.substring(e);
    setQuery(next);
    requestAnimationFrame(() => {
      input.selectionStart = s + char.length;
      input.selectionEnd   = s + char.length;
      input.focus();
    });
  };

  const backspaceAtCursor = () => {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) { setQuery((q) => q.slice(0, -1)); return; }
    const s = input.selectionStart ?? query.length;
    const e = input.selectionEnd   ?? query.length;
    let next: string; let np: number;
    if (s !== e)    { next = query.substring(0, s) + query.substring(e); np = s; }
    else if (s > 0) { next = query.substring(0, s - 1) + query.substring(e); np = s - 1; }
    else { return; }
    setQuery(next);
    requestAnimationFrame(() => { input.selectionStart = np; input.selectionEnd = np; input.focus(); });
  };

  const toggleKeyboard = () => {
    const isMobile = window.innerWidth < 640;
    const next = !isKeyboardOpen;
    setKbOpen(next);
    if (next) {
      setDrop(false);
      if (isMobile) setTimeout(() => inputRef.current?.blur(), 50);
      else inputRef.current?.focus();
    } else if (!isMobile) {
      inputRef.current?.focus();
    }
  };

  const clearInput = () => {
    setQuery(""); setSuggestions([]); setDrop(false); setKbOpen(false); setDropError(false);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string): string => {
    const q = query.trim();
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(
      new RegExp(`(${escaped})`, "gi"),
      '<mark class="bg-primary/20 text-primary rounded-sm not-italic">$1</mark>'
    );
  };

  // ─── Sizing helpers ───────────────────────────────────────────────────────
  // Desktop form row: full controls in one line
  // Mobile form row: input + keyboard + search only (mic/camera/AI move below)
  const formCls = isHero
    ? "flex items-center w-full bg-card border-2 border-primary rounded-[32px] pr-2 pl-4 h-[60px] gap-1.5 shadow-md hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/25 transition-all duration-200"
    : "flex items-center w-full bg-card border-2 border-primary rounded-full pr-1.5 pl-3 h-12 gap-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all";

  const logoSz    = isHero ? "w-9 h-9 text-xl" : "w-7 h-7 text-lg";
  const inputCls  = isHero ? "text-base sm:text-lg" : "text-sm sm:text-base";
  const srchBtnSz = isHero ? "w-11 h-11" : "w-9 h-9 sm:w-10 sm:h-10";
  const iconSz    = isHero ? "w-[18px] h-[18px]" : "w-4 h-4";

  // Desktop inline icon-buttons (mic / camera / AI)
  const iBtnDesktop = `hidden sm:flex flex-shrink-0 ${isHero ? "p-2" : "p-1.5"} rounded-full transition-colors
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`;

  const statusMsg = voiceMsg || imageMsg;

  return (
    <div className="w-full" ref={wrapRef}>

      {/* ── Search form row ──────────────────────────────────────────────── */}
      {/*   Mobile: [S][input][clear][⌨][🔍]  — mic/camera/AI are below     */}
      {/*   Desktop: [S][input][clear][🎤][📷][✨][|][⌨][🔍]                  */}
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className={formCls}
          role="search"
          aria-label={language === "BN" ? "সার্চ" : "Search"}
        >
          {/* S Logo — only in hero variant; compact Header already has its own logo */}
          {isHero && (
            <Link to="/" tabIndex={-1} aria-hidden="true" className="flex-shrink-0">
              <span className={`${logoSz} rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold select-none`}>
                S
              </span>
            </Link>
          )}

          {/* Text input — fills all remaining space */}
          <input
            ref={inputRef}
            id="sholok-search-input"
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0 && !isKeyboardOpen) setDrop(true); }}
            placeholder={t("searchPlaceholder")}
            aria-label={language === "BN" ? "অনুসন্ধান করুন" : "Search Sholok"}
            aria-autocomplete="list"
            aria-controls={showDrop ? "sholok-suggestions" : undefined}
            aria-activedescendant={activeIdx >= 0 ? `sug-${activeIdx}` : undefined}
            aria-expanded={showDrop}
            autoComplete="off"
            spellCheck={false}
            className={`flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none ${inputCls}`}
          />

          {/* Clear */}
          {query && (
            <button
              type="button"
              tabIndex={-1}
              onClick={clearInput}
              aria-label={language === "BN" ? "সার্চ মুছুন" : "Clear search"}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* ── Mic — desktop only ── */}
          <button
            type="button"
            onClick={startVoiceSearch}
            aria-label={isListening
              ? (language === "BN" ? "ভয়েস বন্ধ করুন" : "Stop listening")
              : (language === "BN" ? "ভয়েস সার্চ" : "Voice search")}
            aria-pressed={isListening}
            className={`${iBtnDesktop} ${isListening
              ? "bg-red-500 text-white animate-pulse"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          >
            {isListening ? <MicOff className={iconSz} /> : <Mic className={iconSz} />}
          </button>

          {/* ── Camera — desktop only ── */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            aria-label={language === "BN" ? "ছবি দিয়ে সার্চ" : "Search by image"}
            disabled={isImageLoading}
            className={`${iBtnDesktop} text-muted-foreground hover:text-foreground hover:bg-secondary ${isImageLoading ? "cursor-wait opacity-60" : ""}`}
          >
            {isImageLoading
              ? <Loader2 className={`${iconSz} animate-spin`} />
              : <Camera className={iconSz} />}
          </button>

          {/* ── AI — desktop only ── */}
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            aria-label={language === "BN" ? "AI সার্চ" : "AI Search"}
            aria-pressed={aiOpen}
            className={`${iBtnDesktop} ${aiOpen
              ? "text-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "text-muted-foreground hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20"}`}
          >
            <Sparkles className={iconSz} />
          </button>

          {/* Divider — desktop only */}
          <div className="hidden sm:block h-5 w-px bg-border/40 flex-shrink-0" aria-hidden="true" />

          {/* ── Bengali keyboard toggle — both mobile and desktop ── */}
          <button
            type="button"
            onClick={toggleKeyboard}
            aria-label={language === "BN" ? "বাংলা কীবোর্ড" : "Bengali Keyboard"}
            aria-pressed={isKeyboardOpen}
            className={`flex-shrink-0 ${isHero ? "p-2" : "p-1.5"} rounded-full transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
              ${isKeyboardOpen
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          >
            <Keyboard className={iconSz} />
          </button>

          {/* ── Search submit button ── */}
          <button
            type="submit"
            aria-label={language === "BN" ? "অনুসন্ধান করুন" : "Search"}
            className={`flex-shrink-0 ${srchBtnSz} rounded-full bg-primary text-primary-foreground
              flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
          >
            <Search className={isHero ? "w-5 h-5" : "w-4 h-4 sm:w-5 sm:h-5"} />
          </button>
        </form>

        {/* ── Global suggestions dropdown ──────────────────────────────────── */}
        {!isKeyboardOpen && showDrop && (
          <div
            id="sholok-suggestions"
            role="listbox"
            aria-label={language === "BN" ? "অনুসন্ধান পরামর্শ" : "Search suggestions"}
            className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto"
          >
            {dropError ? (
              <>
                <button
                  type="button"
                  onMouseDown={() => doSearch(query)}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-primary hover:bg-secondary/30 transition-colors rounded-2xl touch-manipulation"
                >
                  <Search className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {language === "BN" ? `"${query}" সার্চ করুন` : `Search for "${query}"`}
                  </span>
                </button>
              </>
            ) : suggestions.length === 0 ? (
              <button
                type="button"
                onMouseDown={() => doSearch(query)}
                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-primary hover:bg-secondary/30 transition-colors rounded-2xl touch-manipulation"
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {language === "BN" ? `"${query}" সার্চ করুন` : `Search for "${query}"`}
                </span>
              </button>
            ) : (
              <>
                {suggestions.map((s, i) => {
                  const meta      = GLOBAL_TYPE_META[s.type] ?? GLOBAL_TYPE_META.product;
                  const label     = language === "BN" ? (s.nameBn || s.name) : (s.name || s.nameBn);
                  const typeLabel = language === "BN" ? meta.labelBn : meta.label;
                  const isActive  = i === activeIdx;

                  // Determine the left-side icon/thumbnail
                  const leftNode = s.type === "product" && s.thumbnail ? (
                    <img
                      src={s.thumbnail}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-secondary"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center flex-shrink-0 text-base leading-none select-none">
                      {(s.icon && s.icon.trim()) || meta.icon}
                    </div>
                  );

                  return (
                    <button
                      key={i}
                      id={`sug-${i}`}
                      role="option"
                      aria-selected={isActive}
                      type="button"
                      onMouseDown={() => pickSuggestion(s)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left touch-manipulation
                        ${isActive ? "bg-secondary/70" : "hover:bg-secondary/40"}`}
                    >
                      {leftNode}

                      {/* Name + optional sub-text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-foreground truncate"
                          dangerouslySetInnerHTML={{ __html: highlightMatch(label) }}
                        />
                        {s.type === "product" && s.regularPrice != null && (
                          <p className="text-xs text-muted-foreground">
                            {s.salePrice != null ? (
                              <>
                                <span className="text-primary font-semibold">৳{s.salePrice}</span>
                                {" "}
                                <span className="line-through">৳{s.regularPrice}</span>
                              </>
                            ) : `৳${s.regularPrice}`}
                          </p>
                        )}
                      </div>

                      {/* Right-side type badge */}
                      <span className="text-[10px] font-medium text-muted-foreground/70 flex-shrink-0 whitespace-nowrap">
                        {typeLabel}
                      </span>
                    </button>
                  );
                })}

                {/* "Search for …" footer */}
                <button
                  type="button"
                  onMouseDown={() => doSearch(query)}
                  className="w-full border-t border-border px-4 py-2.5 flex items-center gap-2 text-sm text-primary hover:bg-secondary/30 transition-colors rounded-b-2xl touch-manipulation"
                >
                  <Search className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {language === "BN" ? `"${query}" সার্চ করুন` : `Search for "${query}"`}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Bengali virtual keyboard ──────────────────────────────────────
            MUST live inside this .relative div so that sm:absolute sm:top-full
            anchors to the search form row. Without this, absolute positioning
            walks up to the html element and top:100% puts the keyboard far
            below the visible viewport.                                        */}
        <BengaliKeyboard
          isOpen={isKeyboardOpen}
          onClose={() => setKbOpen(false)}
          onInsert={insertAtCursor}
          onBackspace={backspaceAtCursor}
          onSpace={() => insertAtCursor(" ")}
          onEnter={() => doSearch(query)}
          onClear={clearInput}
        />
      </div>

      {/* ── Mobile action buttons — hero variant only ────────────────────────
          Voice / Image / AI get their own clearly-labelled pill row so the
          search input can use the full available width on small screens.
          Hidden in compact/header mode to keep the sticky header a fixed height. */}
      <div className={`${isHero ? "flex" : "hidden"} sm:hidden items-stretch gap-2 mt-2.5`}>

        {/* Voice search */}
        <button
          type="button"
          onClick={startVoiceSearch}
          aria-label={isListening
            ? (language === "BN" ? "ভয়েস বন্ধ করুন" : "Stop listening")
            : (language === "BN" ? "ভয়েস সার্চ" : "Voice Search")}
          aria-pressed={isListening}
          className={`flex-1 flex items-center justify-center gap-1.5
            min-h-[44px] px-2 rounded-2xl border text-xs font-semibold
            transition-all touch-manipulation focus:outline-none
            focus-visible:ring-2 focus-visible:ring-primary/40
            ${isListening
              ? "bg-red-500 border-red-500 text-white animate-pulse"
              : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-secondary/50 active:scale-95"}`}
        >
          {isListening
            ? <MicOff className="w-4 h-4 flex-shrink-0" />
            : <Mic    className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">
            {language === "BN" ? "ভয়েস সার্চ" : "Voice Search"}
          </span>
        </button>

        {/* Image search */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={isImageLoading}
          aria-label={language === "BN" ? "ছবি দিয়ে খুঁজুন" : "Search by Image"}
          className={`flex-1 flex items-center justify-center gap-1.5
            min-h-[44px] px-2 rounded-2xl border border-border bg-card
            text-foreground text-xs font-semibold
            transition-all touch-manipulation focus:outline-none
            focus-visible:ring-2 focus-visible:ring-primary/40
            hover:border-primary/50 hover:bg-secondary/50 active:scale-95
            ${isImageLoading ? "opacity-60 cursor-wait" : ""}`}
        >
          {isImageLoading
            ? <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
            : <Camera  className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">
            {language === "BN" ? "ছবি দিয়ে খুঁজুন" : "Image Search"}
          </span>
        </button>

        {/* AI search */}
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label={language === "BN" ? "AI সার্চ" : "AI Search"}
          aria-pressed={aiOpen}
          className={`flex-1 flex items-center justify-center gap-1.5
            min-h-[44px] px-2 rounded-2xl border text-xs font-semibold
            transition-all touch-manipulation focus:outline-none
            focus-visible:ring-2 focus-visible:ring-violet-400/60 active:scale-95
            ${aiOpen
              ? "bg-violet-500 border-violet-500 text-white"
              : "bg-card border-border text-foreground hover:border-violet-400/60 hover:bg-violet-50 dark:hover:bg-violet-900/20"}`}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {language === "BN" ? "AI সার্চ" : "AI Search"}
          </span>
        </button>
      </div>

      {/* Shared hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleImageFile}
      />

      {/* ── Status message (voice / image feedback) ──────────────────────── */}
      {statusMsg && (
        <div
          className="mt-1.5 px-1 flex items-center gap-1.5 text-xs"
          role="status"
          aria-live="polite"
        >
          {isListening && (
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" aria-hidden="true" />
          )}
          <span className="text-muted-foreground">{statusMsg}</span>
        </div>
      )}

      {/* ── AI Search Dialog ──────────────────────────────────────────────── */}
      <AISearchDialog
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onSearch={(q) => { setAiOpen(false); doSearch(q); }}
      />
    </div>
  );
};

export default SearchBar;
