import { FileText, ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const articles = [
    {
        title: "Premier League: Manchester City vs Arsenal Preview",
        category: "sports",
        icon: "⚽",
        time: "4 min",
        date: "Jan 9, 2024",
        image: null
    },
    {
        title: "Global Economy Outlook: What to Expect in Q1 2024",
        category: "economy",
        icon: "📈",
        time: "8 min",
        date: "Jan 8, 2024",
        image: null
    },
    {
        title: "Winter Fashion Trends 2024: Cozy Meets Chic",
        category: "fashionBeauty",
        icon: "👢",
        time: "5 min",
        date: "Jan 7, 2024",
        image: null
    },
    {
        title: "Authentic Biryani Recipe: Secrets from Master Chefs",
        category: "food",
        icon: "🥘",
        time: "10 min",
        date: "Jan 7, 2024",
        image: null
    }
];

const BlogSection = () => {
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-secondary/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-foreground" />
                    <h2 className="text-xl font-bold text-foreground">{t("blogArticles")}</h2>
                </div>
                <Link to="/blog" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t("viewAll")} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Featured Card */}
                <div className="md:col-span-1 bg-card rounded-xl border border-border overflow-hidden">
                    <div className="aspect-video bg-secondary flex items-center justify-center relative">
                        <span className="absolute top-4 left-4 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">{t("featured")}</span>
                        <span className="text-6xl">🎬</span>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">{t("koreanSeries")}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Top 10 Must-Watch K-Dramas of 2024</h3>
                        <p className="text-xs text-muted-foreground">Discover the latest hits taking the world by storm...</p>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {articles.map((article, index) => (
                        <Link key={index} to={`/blog/${index}`} className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                {article.icon}
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-portal-green mb-1 block">{t(article.category)}</span>
                                <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2">{article.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.time}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogSection;
