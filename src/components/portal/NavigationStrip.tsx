import { Mail, Coffee, FileText, ShoppingCart, Newspaper, MapPin, BookOpen, Monitor, Trophy, DollarSign, Shirt, Utensils, Book, Lightbulb, Activity, Gamepad2, Flag, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const NavigationStrip = () => {
    const { t } = useLanguage();

    const navItems = [
        { icon: Mail, label: "mail", path: "/mail" },
        { icon: Coffee, label: "cafe", path: "/cafe" },
        { icon: FileText, label: "blog", path: "/blog" },
        { icon: ShoppingCart, label: "shopping", path: "/shopping/", external: true },
        { icon: Newspaper, label: "news", path: "/news" },
        { icon: MapPin, label: "maps", path: "/maps" },
        { icon: Languages, label: "translate", path: "/translate" },
        { icon: BookOpen, label: "webtoon", path: "/media" },
    ];

    const categories = [
        { label: "all", icon: null, active: true },
        { label: "entertainment", icon: Monitor },
        { label: "sports", icon: Trophy },
        { label: "economy", icon: DollarSign },
        { label: "webtoon", icon: BookOpen },
        { label: "fashionBeauty", icon: Shirt },
        { label: "food", icon: Utensils },
        { label: "bookstore", icon: Book },
        { label: "knowledge", icon: Lightbulb },
        { label: "health", icon: Activity, path: "/health" },
        { label: "game", icon: Gamepad2 },
        { label: "koreanSeries", icon: Flag },
    ];

    return (
        <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto">
                {/* Top Nav Strip - Services */}
                <div className="flex items-center gap-6 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border/50">
                    {navItems.map((item, index) =>
                        item.external ? (
                            <a
                                key={index}
                                href={item.path}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{t(item.label)}</span>
                            </a>
                        ) : (
                            <Link
                                key={index}
                                to={item.path}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{t(item.label)}</span>
                            </Link>
                        )
                    )}
                </div>

                {/* Bottom Nav Strip - Categories */}
                <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            to={cat.path || `/search?q=${t(cat.label)}`}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${cat.active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            {cat.icon && <cat.icon className="w-4 h-4" />}
                            <span>{t(cat.label)}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavigationStrip;
