import { Phone } from "lucide-react";

export default function TopBar() {
  return (
    <div className="bg-[#D31710] text-xs text-white">
      <div className="container flex h-9 items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-1.5">
          <a
            href="tel:+8801716509407"
            className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+880 1716509407</span>
          </a>
        </div>
        <span className="flex-1 text-center font-medium">Welcome to Sholok</span>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-white/80">English</span>
        </div>
      </div>
    </div>
  );
}
