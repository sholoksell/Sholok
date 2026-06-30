import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "../components/common/SectionTitle";
import NewsCard from "../components/common/NewsCard";
import { news, breakingNews } from "../data/news";

const categories = ["সব", "ক্রিকেট", "ফুটবল", "হকি", "কাবাডি", "ব্যাডমিন্টন", "অ্যাথলেটিক্স"];
const PAGE_SIZE = 12;

export default function News() {
  const [filter, setFilter] = useState("সব");
  const [page, setPage] = useState(1);

  const filtered = news.filter((n) => filter === "সব" || n.category === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {breakingNews.length > 0 && (
        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 overflow-hidden">
          <span className="shrink-0 text-xs font-bold px-2 py-1 rounded bg-red-500 text-white">ব্রেকিং</span>
          <motion.div
            animate={{ x: ["0%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="whitespace-nowrap text-sm text-gray-200"
          >
            {breakingNews.map((n) => n.title).join("   •   ")}
          </motion.div>
        </div>
      )}

      <SectionTitle icon="📰" title="সংবাদ" subtitle="সর্বশেষ ক্রীড়া সংবাদ ও প্রতিবেদন" />

      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setFilter(c);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === c
                ? "bg-[#006A4E] border-[#006A4E] text-white"
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pageItems.map((n) => (
          <NewsCard key={n.id} item={n} large />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: Math.min(totalPages, 20) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-9 h-9 rounded-lg text-sm font-medium ${
              page === i + 1 ? "bg-[#006A4E] text-white" : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {(i + 1).toLocaleString("bn-BD")}
          </button>
        ))}
      </div>
    </div>
  );
}
