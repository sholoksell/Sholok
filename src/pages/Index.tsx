import Header from "@/components/portal/Header";
import HomeHero from "@/components/portal/HomeHero";
import NewsStand from "@/components/portal/NewsStand";
import BlogSection from "@/components/portal/BlogSection";
import ShoppingSection from "@/components/portal/ShoppingSection";
import RealEstateSection from "@/components/portal/RealEstateSection";
import CafeSection from "@/components/portal/CafeSection";
import SmartStoreCarousel from "@/components/portal/SmartStoreCarousel";
import Footer from "@/components/portal/Footer";
import WeatherWidget from "@/components/portal/WeatherWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Hash } from "lucide-react";
import { Link } from "react-router-dom";

const TRENDING_TOPICS = [
  { en: "Bangladesh Economy", bn: "বাংলাদেশ অর্থনীতি", path: "/news?q=economy" },
  { en: "Health Tips",        bn: "স্বাস্থ্য টিপস",    path: "/news?q=health" },
  { en: "Technology",         bn: "প্রযুক্তি",          path: "/news?q=technology" },
  { en: "Sports",             bn: "খেলাধুলা",          path: "/news?q=sports" },
  { en: "Politics",           bn: "রাজনীতি",           path: "/news?q=politics" },
  { en: "Entertainment",      bn: "বিনোদন",            path: "/news?q=entertainment" },
  { en: "Education",          bn: "শিক্ষা",             path: "/news?q=education" },
  { en: "Science",            bn: "বিজ্ঞান",            path: "/news?q=science" },
];

const Index = () => {
  const { language, t } = useLanguage();
  const isBn = language === "BN";

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        {/* Service navigation shortcuts */}
        <HomeHero />

        {/* Two-column layout: main content + sidebar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-5 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

            {/* ── Main content column (3/4) ── */}
            <div className="lg:col-span-3 space-y-5">
              <NewsStand />
              <BlogSection />
              <ShoppingSection />
              <RealEstateSection />
              <CafeSection />
              <SmartStoreCarousel />
            </div>

            {/* ── Sidebar column (1/4) — desktop only ── */}
            <aside className="hidden lg:flex flex-col gap-4">

              {/* Sign-in / Welcome widget */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                  {isBn ? "শলোকে স্বাগতম" : "Welcome to Sholok"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("signInPrompt")}
                </p>
                <Link
                  to="/login"
                  className="block w-full py-2 text-center text-sm font-bold rounded-lg transition-colors text-white"
                  style={{ backgroundColor: "#5D0096" }}
                >
                  {t("login")}
                </Link>
                <div className="mt-3 flex justify-center gap-2 text-xs text-muted-foreground">
                  <a href="#" className="hover:underline">{t("idLookup")}</a>
                  <span>|</span>
                  <Link to="/register" className="hover:underline">{t("signup")}</Link>
                </div>
              </div>

              {/* Trending topics */}
              <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" style={{ color: "#5D0096" }} />
                  <h3 className="text-sm font-bold text-foreground">
                    {isBn ? "ট্রেন্ডিং বিষয়" : "Trending Topics"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_TOPICS.map((topic, i) => (
                    <Link
                      key={i}
                      to={topic.path}
                      className="flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground hover:text-white transition-colors"
                      style={{ ["--hover-bg" as string]: "#5D0096" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#5D0096";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "";
                        (e.currentTarget as HTMLAnchorElement).style.color = "";
                      }}
                    >
                      <Hash className="w-2.5 h-2.5 flex-shrink-0" />
                      {isBn ? topic.bn : topic.en}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Weather widget */}
              <WeatherWidget />

              {/* Ad space */}
              <div className="bg-secondary/30 rounded-xl border border-border p-4 min-h-[100px] flex items-center justify-center relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/10" />
                <span className="relative text-sm font-bold text-muted-foreground group-hover:scale-105 transition-transform">
                  {t("adSpace")}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
