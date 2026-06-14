import { useState } from "react";
import { ChevronLeft, ChevronRight, Grid3X3, List } from "lucide-react";
import { Link } from "react-router-dom";

const tabs = ["News Stand", "Entertainment", "Sports", "Economy", "Shopping"];

const newsOutlets = [
  { name: "Daily Star", logo: "DS" },
  { name: "Prothom Alo", logo: "PA" },
  { name: "BD News", logo: "BD" },
  { name: "Dhaka Tribune", logo: "DT" },
  { name: "Channel i", logo: "Ci" },
  { name: "Somoy TV", logo: "ST" },
  { name: "NTV", logo: "NT" },
  { name: "ATN News", logo: "AN" },
  { name: "Independent", logo: "IN" },
  { name: "Jamuna TV", logo: "JT" },
  { name: "RTV", logo: "RT" },
  { name: "Bonik Barta", logo: "BB" },
  { name: "Samakal", logo: "SK" },
  { name: "Ittefaq", logo: "IT" },
  { name: "Kaler Kantho", logo: "KK" },
  { name: "Jugantor", logo: "JG" },
  { name: "Manab Zamin", logo: "MZ" },
  { name: "Bangladesh Post", logo: "BP" },
  { name: "Financial Express", logo: "FE" },
  { name: "New Age", logo: "NA" },
];

const NewsStand = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="bg-card rounded-xl portal-shadow overflow-hidden animate-fade-in">
      {/* Tabs */}
      <div className="flex items-center border-b border-border overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`news-tab whitespace-nowrap ${activeTab === index ? "news-tab-active" : ""
              }`}
          >
            {tab}
            {tab === "Sports" && (
              <span className="ml-1 px-1.5 py-0.5 bg-portal-red text-primary-foreground text-[10px] rounded-full">
                LIVE
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Headline */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">All Sources ▼</span>
          <span className="text-sm text-foreground">|</span>
          <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
            Breaking: New trade agreement signed with neighboring countries
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">News Stand</span>
          <span className="hover:text-foreground cursor-pointer">News Home</span>
        </div>
      </div>

      {/* News Outlets Grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">

          {newsOutlets.map((outlet, index) => (
            <Link
              key={index}
              to={`/search?q=${outlet.name} News`}
              className="flex items-center justify-center h-12 bg-secondary rounded-lg hover:bg-accent transition-colors cursor-pointer"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="text-sm font-semibold text-foreground/70">{outlet.logo}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 pb-4 flex items-center justify-center gap-4">
        <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm text-muted-foreground">News Sources 1/4</span>
        <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="ml-4 flex items-center gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${viewMode === "list" ? "bg-secondary" : ""}`}
          >
            <List className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${viewMode === "grid" ? "bg-secondary" : ""}`}
          >
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsStand;
