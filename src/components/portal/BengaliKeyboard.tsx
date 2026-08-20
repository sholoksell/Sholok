import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BengaliKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onEnter: () => void;
  onClear: () => void;
}

const KEYBOARD_ROWS = [
  { label: "স্বরবর্ণ",   chars: ["অ","আ","ই","ঈ","উ","ঊ","ঋ","এ","ঐ","ও","ঔ"] },
  { label: "কারচিহ্ন",   chars: ["া","ি","ী","ু","ূ","ৃ","ে","ৈ","ো","ৌ","্"] },
  { label: "",            chars: ["ক","খ","গ","ঘ","ঙ","চ","ছ","জ","ঝ","ঞ"] },
  { label: "",            chars: ["ট","ঠ","ড","ঢ","ণ","ত","থ","দ","ধ","ন"] },
  { label: "",            chars: ["প","ফ","ব","ভ","ম","য","র","ল","শ","ষ"] },
  { label: "",            chars: ["স","হ","ড়","ঢ়","য়","ৎ","ং","ঃ","ঁ","৳"] },
  { label: "সংখ্যা",     chars: ["০","১","২","৩","৪","৫","৬","৭","৮","৯"] },
];

const BengaliKeyboard = ({
  isOpen,
  onClose,
  onInsert,
  onBackspace,
  onSpace,
  onEnter,
  onClear,
}: BengaliKeyboardProps) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  // On mobile: keys are slightly smaller to fit 10-11 per row within ~343px
  const btn =
    "min-w-[1.625rem] sm:min-w-[2rem] h-8 sm:h-9 px-1 sm:px-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground " +
    "transition-all text-sm font-medium text-foreground active:scale-95 select-none border border-border/40 " +
    "focus:outline-none focus:ring-1 focus:ring-primary/40 touch-manipulation";

  return (
    <div
      className={[
        // Mobile: fixed at bottom of screen, slides up from bottom
        "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl",
        // Desktop (sm+): absolute below the search bar
        "sm:absolute sm:bottom-auto sm:top-full sm:left-0 sm:right-0 sm:rounded-2xl sm:mt-2",
        "bg-card border border-border shadow-2xl p-3 sm:p-4",
        "animate-in fade-in duration-200",
      ].join(" ")}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Mobile drag handle */}
      <div className="sm:hidden w-10 h-1 bg-border/60 rounded-full mx-auto mb-3" aria-hidden="true" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⌨️</span>
          <span className="text-sm font-semibold text-foreground">
            {language === "BN" ? "বাংলা কীবোর্ড" : "Bengali Keyboard"}
          </span>
        </div>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onClose(); }}
          className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
          aria-label="Close keyboard"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Key rows */}
      <div className="space-y-1.5">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri}>
            {row.label && (
              <p className="text-[10px] text-muted-foreground mb-1 px-0.5">{row.label}</p>
            )}
            <div className="flex flex-wrap gap-1 justify-start">
              {row.chars.map((char, ci) => (
                <button
                  key={ci}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onInsert(char); }}
                  className={btn}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-2.5 sm:my-3 border-t border-border" />

      {/* Action row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onClear(); }}
          className="px-3 h-9 rounded-lg bg-secondary hover:bg-destructive/10 hover:text-destructive
            text-xs font-medium text-muted-foreground transition-colors border border-border/40 touch-manipulation"
        >
          {language === "BN" ? "মুছুন" : "Clear"}
        </button>

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onBackspace(); }}
          className="px-3 h-9 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium
            text-foreground transition-colors border border-border/40 flex items-center gap-1 touch-manipulation"
          title={language === "BN" ? "ব্যাকস্পেস" : "Backspace"}
        >
          ⌫
        </button>

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onSpace(); }}
          className="flex-1 min-w-[80px] h-9 rounded-lg bg-secondary hover:bg-secondary/80 text-xs
            font-medium text-muted-foreground transition-colors border border-border/40 touch-manipulation"
        >
          {language === "BN" ? "স্পেস" : "Space"}
        </button>

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onEnter(); }}
          className="px-4 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground
            text-xs font-semibold transition-colors flex items-center gap-1.5 touch-manipulation"
        >
          <span>{language === "BN" ? "অনুসন্ধান" : "Search"}</span>
          <span className="text-base">→</span>
        </button>
      </div>

      {/* Tip */}
      <p className="mt-2 text-[10px] text-muted-foreground/60 text-center">
        {language === "BN"
          ? "বাংলা ইউনিকোড সরাসরি ইনপুট"
          : "Direct Bangla Unicode input"}
      </p>
    </div>
  );
};

export default BengaliKeyboard;
