import { TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const trends = [
  { rank: 1, title: "K-Drama New Releases", category: "entertainment", change: "+15%" },
  { rank: 2, title: "Premier League Results", category: "sports", change: "+12%" },
  { rank: 3, title: "Stock Market Today", category: "economy", change: "+8%" },
  { rank: 4, title: "Solo Leveling Anime", category: "webtoon", change: "+45%" },
  { rank: 5, title: "Winter Fashion 2024", category: "fashionBeauty", change: "+6%" },
  { rank: 6, title: "GTA 6 Trailer", category: "game", change: "+120%" },
  { rank: 7, title: "Healthy Recipes", category: "food", change: "+10%" },
  { rank: 8, title: "AI Technology", category: "knowledge", change: "+25%" },
];

const TrendingWidget = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-portal-green" />
          <h2 className="text-xl font-bold text-foreground">{t("trendingNow")}</h2>
        </div>
        <Link to="/trending" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          {t("viewAll")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {trends.map((trend) => (
          <Link
            key={trend.rank}
            to={`/search?q=${trend.title}`}
            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-portal-green w-6 font-primary">{trend.rank}</span>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {trend.title}
                </h3>
                <p className="text-xs text-muted-foreground">{t(trend.category)}</p>
              </div>
            </div>
            <div className="px-2 py-1 bg-portal-green/10 text-portal-green text-xs font-bold rounded">
              {trend.change}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingWidget;
