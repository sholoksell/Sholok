import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, AlignJustify, ArrowUpRight, Zap, TrendingUp, Tag, LayoutGrid, Home,
  ShoppingBag, Briefcase, Star, Heart, Activity, Smile, Layers, BookOpen, Gift, Car,
  ShoppingCart, ChevronRight, Package, Cpu, Coffee, Dumbbell,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { categoriesApi } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Shop", icon: LayoutGrid },
  { to: "/#flash-sale", label: "Flash Sale", icon: Zap, hot: true },
  { to: "/search?sort=popular", label: "Trending", icon: TrendingUp },
  { to: "/search?onSale=1", label: "Offers", icon: Tag },
];

const CAT_STYLES: Record<string, { Icon: React.ElementType; bg: string; fg: string }> = {
  "Women's Clothing":    { Icon: ShoppingBag,  bg: "#EDE9FE", fg: "#7C3AED" },
  "Men's Clothing":      { Icon: Briefcase,    bg: "#FEE2E2", fg: "#DC2626" },
  "Beauty & Makeup":     { Icon: Star,         bg: "#CCFBF1", fg: "#0D9488" },
  "Personal Care":       { Icon: Heart,        bg: "#DCFCE7", fg: "#16A34A" },
  "Fashion & Lifestyle": { Icon: Tag,          bg: "#FED7AA", fg: "#EA580C" },
  "Health & Wellness":   { Icon: Activity,     bg: "#DBEAFE", fg: "#2563EB" },
  "Baby Care":           { Icon: Smile,        bg: "#FCE7F3", fg: "#DB2777" },
  "Home & Kitchen":      { Icon: Home,         bg: "#FEF9C3", fg: "#CA8A04" },
  "Cleaning Supplies":   { Icon: Layers,       bg: "#CFFAFE", fg: "#0891B2" },
  "Stationery & Office": { Icon: BookOpen,     bg: "#D1FAE5", fg: "#059669" },
  "Pet Care":            { Icon: Gift,         bg: "#FFE4E6", fg: "#E11D48" },
  "Toys & Sports":       { Icon: Dumbbell,     bg: "#FEF3C7", fg: "#D97706" },
  "Vehicle Essentials":  { Icon: Car,          bg: "#EDE9FE", fg: "#6D28D9" },
  "Electronics":         { Icon: Cpu,          bg: "#DBEAFE", fg: "#1D4ED8" },
  "Food & Groceries":    { Icon: ShoppingCart, bg: "#DCFCE7", fg: "#15803D" },
  "Food & Beverage":     { Icon: Coffee,       bg: "#FEF3C7", fg: "#92400E" },
};

const FB_ICONS = [ShoppingBag, Briefcase, Star, Heart, Tag, Activity, Home, Layers, BookOpen, Gift, Car, Package];
const FB_COLORS = [
  { bg: "#EDE9FE", fg: "#7C3AED" }, { bg: "#FEE2E2", fg: "#DC2626" },
  { bg: "#CCFBF1", fg: "#0D9488" }, { bg: "#DCFCE7", fg: "#16A34A" },
  { bg: "#FED7AA", fg: "#EA580C" }, { bg: "#DBEAFE", fg: "#2563EB" },
  { bg: "#FCE7F3", fg: "#DB2777" }, { bg: "#FEF9C3", fg: "#CA8A04" },
  { bg: "#CFFAFE", fg: "#0891B2" }, { bg: "#D1FAE5", fg: "#059669" },
  { bg: "#FFE4E6", fg: "#E11D48" }, { bg: "#FEF3C7", fg: "#D97706" },
];

type SubCat = { _id?: string | number; id?: string | number; name: string; slug?: string; children?: SubCat[] };
type Category = { _id?: string | number; id?: string | number; name: string; slug?: string; children?: SubCat[] };

const cid = (c: { _id?: string | number; id?: string | number; slug?: string }) =>
  String(c._id ?? c.id ?? c.slug ?? "");

export default function NavBar() {
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoriesApi.list().then((r: any) => {
      const list: Category[] = r?.categories || r?.data || (Array.isArray(r) ? r : []);
      setCategories(list);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const closeAll = () => { setCatOpen(false); setExpandedIds(new Set()); };

  return (
    <nav className="bg-[#5D0096] text-white relative z-30">
      <div className="container flex items-center h-11 gap-0">
        {/* Shop by category */}
        <div ref={ref} className="relative shrink-0">
          <button
            onClick={() => setCatOpen((v) => !v)}
            aria-expanded={catOpen}
            className="flex items-center gap-2 h-11 w-[220px] lg:w-[270px] px-4 font-semibold text-sm bg-[#4a0078] hover:bg-[#3d0063] transition-colors whitespace-nowrap"
          >
            <AlignJustify className="w-4 h-4" />
            <span>SHOP BY CATEGORY</span>
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${catOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {catOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full w-[270px] bg-white text-foreground shadow-elegant border border-border border-t-0 rounded-b-xl z-50 max-h-[75vh] overflow-y-auto"
              >
                {categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Loading categories…</div>
                ) : (
                  <ul className="py-2">
                    {categories.map((cat, idx) => {
                      const style = CAT_STYLES[cat.name] ?? {
                        Icon: FB_ICONS[idx % FB_ICONS.length],
                        ...FB_COLORS[idx % FB_COLORS.length],
                      };
                      const { Icon, bg, fg } = style;
                      const hasChildren = (cat.children?.length ?? 0) > 0;
                      const id = cid(cat);
                      const isExpanded = expandedIds.has(id);

                      return (
                        <li key={id}>
                          {/* Root category row */}
                          <div className="flex items-center group">
                            <Link
                              to={`/search?categoryId=${id}`}
                              onClick={closeAll}
                              className="flex items-center gap-3 pl-4 pr-2 h-11 flex-1 hover:bg-gray-50 transition-colors min-w-0"
                            >
                              <span
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: bg }}
                              >
                                <Icon className="w-4 h-4" style={{ color: fg }} />
                              </span>
                              <span className="text-sm text-gray-700 flex-1 truncate">{cat.name}</span>
                            </Link>
                            {hasChildren && (
                              <button
                                onClick={(e) => toggleExpand(id, e)}
                                className="shrink-0 w-9 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label={isExpanded ? "Collapse" : "Expand"}
                              >
                                <ChevronRight
                                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Sub-categories (expanded) */}
                          <AnimatePresence>
                            {isExpanded && hasChildren && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden border-l-2 ml-7 border-gray-100"
                              >
                                {cat.children!.map((sub) => (
                                  <li key={cid(sub)}>
                                    <Link
                                      to={`/search?categoryId=${cid(sub)}`}
                                      onClick={closeAll}
                                      className="flex items-center gap-2 pl-4 pr-3 h-9 text-sm text-gray-600 hover:text-[#5D0096] hover:bg-[#5D0096]/5 transition-colors"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links */}
        <div className="flex items-center flex-1 overflow-x-auto scrollbar-hide">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative px-4 h-11 flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap
                ${isActive ? "text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {link.hot && (
                    <span className="rounded bg-[#D31710] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">HOT</span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-white rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Become a seller */}
        <Link
          to="/seller"
          className="hidden md:flex items-center gap-1.5 px-4 h-11 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
        >
          Become a Seller
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
}
