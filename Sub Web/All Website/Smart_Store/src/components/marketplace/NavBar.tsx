import { useState, useEffect, useRef } from "react";
import { ChevronDown, Grid3X3, ArrowUpRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { categoriesApi } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { to: "/#flash-sale", label: "Flash Sale" },
  { to: "/search?sort=popular", label: "Trending" },
  { to: "/search?onSale=1", label: "Offers & Deals" },
  { to: "/search?featured=1", label: "Featured" },
  { to: "/search", label: "All Products" },
];

type Category = { id?: string | number; _id?: string | number; name: string; slug?: string };
const catId = (c: Category) => c._id ?? c.id ?? c.slug ?? "";

export default function NavBar() {
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoriesApi.list().then((r: any) => {
      const list = r?.categories || r?.data || (Array.isArray(r) ? r : []);
      setCategories(list.slice(0, 16));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="bg-[#5D0096] text-white relative z-30">
      <div className="container flex items-center h-11 gap-0">
        {/* All categories */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setCatOpen((v) => !v)}
            aria-expanded={catOpen}
            className="flex items-center gap-2 h-11 px-4 font-semibold text-sm bg-[#4a0078] hover:bg-[#3d0063] transition-colors whitespace-nowrap"
          >
            <Grid3X3 className="w-4 h-4" />
            All Categories
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {catOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full w-64 bg-white text-foreground shadow-elegant border border-border rounded-b-lg z-50"
              >
                {categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Loading categories…</div>
                ) : (
                  <ul className="py-1">
                    {categories.map((cat) => (
                      <li key={String(catId(cat))}>
                        <Link
                          to={`/search?categoryId=${catId(cat)}`}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center px-4 h-10 text-sm hover:bg-secondary hover:text-primary transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
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
              className="px-4 h-11 flex items-center text-sm text-white/85 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Become a seller */}
        <Link
          to="/seller"
          className="hidden md:flex items-center gap-1.5 px-4 h-11 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
        >
          Become a Seller
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
}
