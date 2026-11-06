import { Phone } from "lucide-react";
import { useLang } from "@/store/languageContext";

export default function TopBar() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="bg-[#D31710] text-xs text-white">
      <div className="container flex h-9 items-center justify-between gap-4">
        {/* Phone */}
        <div className="hidden sm:flex items-center gap-1.5">
          <a href="tel:+8801716509407" className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
            <Phone className="w-3.5 h-3.5" />
            <span>+880 1716509407</span>
          </a>
        </div>

        {/* Center text */}
        <span className="flex-1 text-center font-medium">{t("welcome")}</span>

        {/* Language switcher */}
        <div className="hidden sm:flex items-center gap-0.5 bg-white/20 rounded-full p-0.5">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-0.5 rounded-full text-xs font-semibold transition-all ${
              lang === "en" ? "bg-white text-[#D31710]" : "text-white hover:bg-white/20"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("bn")}
            className={`px-3 py-0.5 rounded-full text-xs font-semibold transition-all ${
              lang === "bn" ? "bg-white text-[#D31710]" : "text-white hover:bg-white/20"
            }`}
          >
            বাং
          </button>
        </div>
      </div>
    </div>
  );
}
