import { motion } from "framer-motion";
import {
  Sparkles, Activity, TrendingUp, Cloud, Leaf, ArrowRight,
  Sun, CloudRain, Snowflake, Flower2, Thermometer, Gift, BrainCircuit,
} from "lucide-react";
import { Link } from "react-router-dom";
import { products, Product } from "@/data/mockData";
import ProductCard from "./ProductCard";
import { useMemo } from "react";

// ── Bangladesh 6 Seasons ───────────────────────────────────────────────────────
type BdSeason = {
  id: string; months: number[]; bn: string; en: string; sub: string;
  emoji: string; tempRange: string; desc: string; icon: React.ElementType;
  gradient: string; glow: string; bg: string;
  productCategories: string[]; weatherTag: string; tip: string;
};

const BD_SEASONS: BdSeason[] = [
  {
    id: "grishma", months: [4, 5], bn: "Grishma", en: "Grishma · Summer",
    sub: "Baishakh – Joishtho", emoji: "☀️", tempRange: "32–40°C",
    desc: "Scorching heat & high humidity", icon: Sun,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glow: "shadow-amber-500/40",
    bg: "from-amber-50/70 to-orange-50/70 dark:from-amber-950/25 dark:to-orange-950/25",
    productCategories: ["Accessories", "Audio", "Tech", "Fashion"],
    weatherTag: "Beat the Heat 🥵",
    tip: "Sunglasses, earbuds & cool tech gear for Bangladesh's hottest days",
  },
  {
    id: "barsha", months: [6, 7], bn: "Barsha", en: "Barsha · Monsoon",
    sub: "Asharh – Shraban", emoji: "🌧️", tempRange: "26–32°C",
    desc: "Heavy rainfall & lush greenery", icon: CloudRain,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    glow: "shadow-blue-500/40",
    bg: "from-blue-50/70 to-cyan-50/70 dark:from-blue-950/25 dark:to-cyan-950/25",
    productCategories: ["Accessories", "Home", "Audio"],
    weatherTag: "Monsoon Ready 🌿",
    tip: "Waterproof bags, cozy candles & indoor audio for rainy Bangladesh days",
  },
  {
    id: "sharat", months: [8, 9], bn: "Sharat", en: "Sharat · Autumn",
    sub: "Bhadra – Ashwin", emoji: "⛅", tempRange: "28–34°C",
    desc: "Clear skies & mild fresh breeze", icon: Cloud,
    gradient: "from-yellow-500 via-amber-400 to-orange-400",
    glow: "shadow-yellow-500/40",
    bg: "from-yellow-50/70 to-amber-50/70 dark:from-yellow-950/25 dark:to-amber-950/25",
    productCategories: ["Fashion", "Accessories", "Tech"],
    weatherTag: "Clear & Fresh ⛅",
    tip: "Autumn fashion & everyday tech picks for clear Bangladesh skies",
  },
  {
    id: "hemanta", months: [10, 11], bn: "Hemanta", en: "Hemanta · Late Autumn",
    sub: "Kartik – Agrahayan", emoji: "🍂", tempRange: "18–28°C",
    desc: "Cool evenings, harvest season", icon: Leaf,
    gradient: "from-orange-500 via-amber-600 to-yellow-600",
    glow: "shadow-orange-500/40",
    bg: "from-orange-50/70 to-amber-50/70 dark:from-orange-950/25 dark:to-amber-950/25",
    productCategories: ["Home", "Accessories", "Fashion"],
    weatherTag: "Harvest Vibes 🍁",
    tip: "Cozy home décor, warm accessories & lifestyle picks for autumn evenings",
  },
  {
    id: "shita", months: [12, 1], bn: "Shita", en: "Shita · Winter",
    sub: "Poush – Magh", emoji: "❄️", tempRange: "8–18°C",
    desc: "Cold foggy mornings in Bangladesh", icon: Snowflake,
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    glow: "shadow-cyan-500/40",
    bg: "from-cyan-50/70 to-blue-50/70 dark:from-cyan-950/25 dark:to-blue-950/25",
    productCategories: ["Home", "Accessories", "Audio"],
    weatherTag: "Winter Warmth ☕",
    tip: "Candles, mugs, cozy bags & audio gear for cold Bangladesh mornings",
  },
  {
    id: "basanta", months: [2, 3], bn: "Basanta", en: "Basanta · Spring",
    sub: "Falgun – Chaitra", emoji: "🌸", tempRange: "20–30°C",
    desc: "Warm breeze, flowers in bloom", icon: Flower2,
    gradient: "from-pink-500 via-rose-500 to-fuchsia-500",
    glow: "shadow-pink-500/40",
    bg: "from-pink-50/70 to-rose-50/70 dark:from-pink-950/25 dark:to-rose-950/25",
    productCategories: ["Fashion", "Accessories", "Home"],
    weatherTag: "Spring Bloom 🌺",
    tip: "Sneakers, sunglasses & fresh fashion picks for spring in Bangladesh",
  },
];

// ── Bangladesh Festivals ─────────────────────────────────────────────────────────
const BD_FESTIVALS = [
  { months: [3],    name: "Eid ul-Fitr",     bn: "Eid ul-Fitr",     emoji: "🌙", gradient: "from-emerald-500 to-teal-500",    cats: ["Fashion", "Accessories", "Home"] },
  { months: [4],    name: "Pahela Baishakh", bn: "Pahela Baishakh", emoji: "🎊", gradient: "from-red-500 to-orange-500",      cats: ["Fashion", "Home", "Accessories"] },
  { months: [5, 6], name: "Eid ul-Adha",     bn: "Eid ul-Adha",    emoji: "🌿", gradient: "from-green-500 to-emerald-600",   cats: ["Fashion", "Accessories", "Tech"] },
  { months: [10],   name: "Durga Puja",      bn: "Durga Puja",      emoji: "🪔", gradient: "from-yellow-500 to-orange-500",   cats: ["Home", "Accessories", "Fashion"] },
  { months: [12],   name: "Bijoy Dibosh",    bn: "Bijoy Dibosh",    emoji: "🇧🇩", gradient: "from-red-500 to-green-600",       cats: ["Audio", "Tech", "Fashion"] },
  { months: [1, 2], name: "Winter Carnival", bn: "Winter Carnival",  emoji: "🎪", gradient: "from-violet-500 to-fuchsia-500", cats: ["Home", "Audio", "Accessories"] },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────
function pseudoRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}
function aiScore(p: Product) {
  return p.rating * 500 + p.reviews * 0.4 + (p.badge ? 300 : 0) + pseudoRand(p.id) * 80;
}// Boost score for products matching season — seasonalFor gets the biggest boost
function seasonalScore(p: Product, seasonId: string, seasonCats: string[]) {
  const exactBoost   = p.seasonalFor?.includes(seasonId) ? 5000 : 0; // exact seasonal product
  const catBoost     = seasonCats.includes(p.category)   ? 1500 : 0; // category match
  return aiScore(p) + exactBoost + catBoost;
}

// ── Section Header ───────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, title, subtitle, gradient, badge }: {
  icon: React.ElementType; label: string; title: string;
  subtitle: string; gradient: string; badge?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-end justify-between mb-8 gap-4 flex-wrap"
    >
      <div className="flex items-start gap-4">
        <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase tracking-widest font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {label}
            </span>
            {badge && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white font-bold`}>{badge}</span>
            )}
          </div>
          <h2 className="font-display text-2xl lg:text-3xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Link to="/search" className="text-sm font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all group text-muted-foreground hover:text-foreground">
        See all
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </motion.div>
  );
}

function ProductGrid({ items, sectionId }: { items: Product[]; sectionId: string }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {items.map((p, i) => (
        <ProductCard key={`${sectionId}-${p.id}`} product={p} index={i} />
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────────
export default function AISections() {
  const month = new Date().getMonth() + 1;

  const season = useMemo(
    () => BD_SEASONS.find((s) => s.months.includes(month)) ?? BD_SEASONS[0],
    [month],
  );

  const festival = useMemo(
    () =>
      BD_FESTIVALS.find((f) => f.months.some((m) => m >= month && m <= month + 2)) ??
      BD_FESTIVALS.find((f) => f.months.some((m) => m >= month)) ??
      BD_FESTIVALS[2],
    [month],
  );

  // 1. Recommended for You — seasonalFor exact match first, then category, then score
  const recommended = useMemo(
    () =>
      [...products]
        .sort((a, b) => seasonalScore(b, season.id, season.productCategories) - seasonalScore(a, season.id, season.productCategories))
        .slice(0, 4),
    [season],
  );

  // 2. Based on Activity — audio/tech interest boosted by season
  const activityBased = useMemo(() => {
    const interests = ["Audio", "Tech"];
    return [...products]
      .sort((a, b) => {
        const aScore = (interests.includes(a.category) ? 1500 : 0) + seasonalScore(a, season.id, season.productCategories);
        const bScore = (interests.includes(b.category) ? 1500 : 0) + seasonalScore(b, season.id, season.productCategories);
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [season]);

  // 3. Trending Now — most reviews, seasonal picks float to top
  const trending = useMemo(
    () =>
      [...products]
        .sort((a, b) => {
          const aBoost = seasonalScore(a, season.id, season.productCategories);
          const bBoost = seasonalScore(b, season.id, season.productCategories);
          return (b.reviews * 0.6 + bBoost) - (a.reviews * 0.6 + aBoost);
        })
        .slice(0, 4),
    [season],
  );

  // 4. Season Picks — strictly products with seasonalFor matching current season (+ category fallback)
  const seasonPicks = useMemo(() => {
    const exact = products.filter((p) => p.seasonalFor?.includes(season.id));
    const catFill = products
      .filter((p) => !p.seasonalFor?.includes(season.id) && season.productCategories.includes(p.category))
      .sort((a, b) => aiScore(b) - aiScore(a));
    return [...exact.sort((a, b) => aiScore(b) - aiScore(a)), ...catFill].slice(0, 4);
  }, [season]);

  // 5. Festival Deals — festival cats × seasonal boost
  const festivalPicks = useMemo(
    () =>
      products
        .filter((p) => festival.cats.includes(p.category))
        .sort((a, b) => seasonalScore(b, season.id, season.productCategories) - seasonalScore(a, season.id, season.productCategories))
        .slice(0, 4),
    [festival, season],
  );

  const SeasonIcon = season.icon;

  return (
    <div className="space-y-24 lg:space-y-32 py-8">

      {/* ── Bangladesh Season Detection Banner ─────────────────────────────── */}
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${season.bg} border border-foreground/10 p-6 lg:p-8`}
        >
          {/* Animated blobs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br ${season.gradient} opacity-10 blur-3xl pointer-events-none`}
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, -15, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -left-14 -bottom-14 w-56 h-56 rounded-full bg-gradient-to-br ${season.gradient} opacity-10 blur-2xl pointer-events-none`}
          />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Spinning season icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${season.gradient} flex items-center justify-center shadow-xl ${season.glow} shrink-0`}
            >
              <SeasonIcon className="w-8 h-8 text-white" />
            </motion.div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold gradient-text flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3" /> Seasonal Detection · Bangladesh 🇧🇩
                </span>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 font-mono font-bold"
                >
                  ● LIVE
                </motion.span>
              </div>
              <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
                <h2 className="font-display text-3xl lg:text-4xl font-bold">{season.emoji} {season.en}</h2>
                <span className="text-sm text-muted-foreground">{season.sub}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">{season.tip}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 shrink-0 text-center">
              <div className="bg-background/50 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-foreground/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Temperature</p>
                <p className="font-bold text-sm flex items-center justify-center gap-0.5">
                  <Thermometer className="w-3 h-3" /> {season.tempRange}
                </p>
              </div>
              <div className="bg-background/50 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-foreground/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Weather</p>
                <p className="font-bold text-sm">{season.weatherTag}</p>
              </div>
              <div className="bg-background/50 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-foreground/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Upcoming Festival</p>
                <p className="font-bold text-sm">{festival.emoji} {festival.bn}</p>
              </div>
            </div>
          </div>

          {/* 6 Season pills */}
          <div className="relative mt-6 pt-5 border-t border-foreground/10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">
              Bangladesh 6 Seasons — Current Season
            </p>
            <div className="flex flex-wrap gap-2">
              {BD_SEASONS.map((s) => {
                const active = s.id === season.id;
                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-default ${
                      active
                        ? `bg-gradient-to-r ${s.gradient} text-white shadow-md scale-105`
                        : "bg-background/60 border border-foreground/10 text-muted-foreground"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.bn}</span>
                    {active && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-[8px] bg-white/20 px-1 rounded-full"
                      >
                        ● Now
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Section 1: Recommended for You ──────────────────────────────────────── */}
      <section className="container">
        <SectionHeader
          icon={Sparkles}
          label={`${season.en} Personalized`}
          title="Recommended for You"
          subtitle={`${season.emoji} Hand-picked for Bangladesh's ${season.en} season — ${season.weatherTag}`}
          gradient="from-violet-500 to-fuchsia-500"
          badge={`${season.emoji} ${season.en.split(" · ")[1] ?? season.en}`}
        />
        <ProductGrid items={recommended} sectionId="rec" />
      </section>

      {/* ── Section 2: Based on Activity ────────────────────────────────────────── */}
      <section className="container">
        <SectionHeader
          icon={Activity}
          label="Activity Based"
          title="Based on Your Activity"
          subtitle={`${season.emoji} Audio & Tech you explored — tuned for ${season.en}`}
          gradient="from-pink-500 to-rose-500"
          badge="New Pick"
        />
        <ProductGrid items={activityBased} sectionId="activity" />
      </section>

      {/* ── Section 3: Trending Now ──────────────────────────────────────────────── */}
      <section className="container">
        <SectionHeader
          icon={TrendingUp}
          label="Real-time Trends · Bangladesh"
          title="Trending Now"
          subtitle={`${season.emoji} What everyone in Bangladesh is buying this ${season.en.split(" · ")[1] ?? season.en}`}
          gradient="from-amber-500 to-orange-500"
          badge="🔥 HOT"
        />
        <ProductGrid items={trending} sectionId="trending" />
      </section>

      {/* ── Section 4: Season / Weather Picks ───────────────────────────────────── */}
      <section className="container">
        {/* Season context pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`flex flex-wrap items-center gap-3 bg-gradient-to-r ${season.bg} border border-foreground/10 rounded-2xl px-5 py-3.5 mb-8`}
        >
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${season.gradient} flex items-center justify-center shrink-0`}>
            <SeasonIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className={`text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${season.gradient} bg-clip-text text-transparent`}>
              Weather Detection · {season.weatherTag}
            </p>
            <p className="text-sm font-semibold">{season.emoji} {season.en} — {season.desc} · {season.tempRange}</p>
          </div>
          <span className={`text-[10px] px-3 py-1 rounded-full bg-gradient-to-r ${season.gradient} text-white font-bold shrink-0`}>
            {season.en}
          </span>
        </motion.div>

        <SectionHeader
          icon={SeasonIcon}
          label={`${season.en} Picks`}
          title={`${season.emoji} ${season.en} Picks`}
          subtitle={season.tip}
          gradient={season.gradient}
        />
        <ProductGrid items={seasonPicks} sectionId="season" />
      </section>

      {/* ── Section 5: Upcoming Festival Deals ──────────────────────────────────── */}
      <section className="container">
        {/* Festival banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${festival.gradient} p-5 mb-8 text-white`}
        >
          {/* shimmer sweep */}
          <motion.div
            animate={{ x: [-300, 800] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-y-0 w-40 bg-white/15 blur-2xl skew-x-12 pointer-events-none"
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="text-4xl">{festival.emoji}</span>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-75">
                Upcoming Festival Deals · Bangladesh
              </p>
              <p className="font-display text-xl font-bold">
                {festival.name} — Special Deals
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/20 border border-white/30 font-semibold shrink-0">
              Featured
            </span>
          </div>
        </motion.div>

        <SectionHeader
          icon={Gift}
          label={`${festival.name} · Festival Deals`}
          title={`${festival.emoji} ${festival.name} Special Deals`}
          subtitle={`Curated picks for the upcoming ${festival.name} celebration`}
          gradient={festival.gradient}
          badge="DEAL"
        />
        <ProductGrid items={festivalPicks} sectionId="festival" />
      </section>

    </div>
  );
}
