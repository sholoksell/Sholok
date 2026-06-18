import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    // Reload the panel — App re-reads auth from storage and shows the login screen
    window.location.href = import.meta.env.BASE_URL;
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm cursor-pointer hover:bg-secondary transition-colors">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t("searchAnything")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-secondary transition-colors text-muted-foreground"
              title="Toggle language"
            >
              {language === "bn" ? "বাং" : "EN"}
            </button>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green pulse-dot" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full flex items-center justify-center font-black text-xs tracking-widest shrink-0" style={{ background: "var(--gradient-neon)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.15em", boxShadow: "0 0 12px hsl(160,100%,50%,0.4)" }}>
                <span className="text-black">Sholok</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
