import Header from "@/components/portal/Header";
import ServiceGrid from "@/components/portal/ServiceGrid";
import ShoppingSection from "@/components/portal/ShoppingSection";
import RealEstateSection from "@/components/portal/RealEstateSection";
import CafeSection from "@/components/portal/CafeSection";
import Footer from "@/components/portal/Footer";
import WeatherWidget from "@/components/portal/WeatherWidget";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        <ServiceGrid />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-2">
          {/* Main Content Column */}
          <div className="lg:col-span-3 space-y-2">
            <ShoppingSection />
            <RealEstateSection />
            <CafeSection />
          </div>

          {/* Sidebar Column — desktop only */}
          <div className="hidden lg:flex flex-col gap-6">
            <WeatherWidget />

            <div className="bg-card rounded-xl border border-border p-5 text-center shadow-sm">
              <p className="text-sm text-muted-foreground mb-4">{t("signInPrompt")}</p>
              <a
                href="/login"
                className="block w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t("login")}
              </a>
              <div className="mt-3 flex justify-center gap-2 text-xs text-muted-foreground">
                <a href="#" className="hover:underline">{t("idLookup")}</a>
                <span>|</span>
                <a href="/register" className="hover:underline">{t("signup")}</a>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-xl border border-border p-4 flex-1 min-h-[120px] flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-portal-blue/10 to-portal-green/10" />
              <span className="relative font-bold text-muted-foreground group-hover:scale-105 transition-transform">
                {t("adSpace")}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
