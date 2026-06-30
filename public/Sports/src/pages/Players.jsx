import { useState } from "react";
import SectionTitle from "../components/common/SectionTitle";
import PlayerCard from "../components/common/PlayerCard";
import { players } from "../data/players";

const sports = ["সব", "ক্রিকেট", "ফুটবল"];
const PAGE_SIZE = 24;

export default function Players() {
  const [filter, setFilter] = useState("সব");
  const [page, setPage] = useState(1);

  const filtered = players.filter((p) => filter === "সব" || p.sport === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionTitle icon="🏃" title="খেলোয়াড়" subtitle="বাংলাদেশের সেরা খেলোয়াড়দের প্রোফাইল" />

      <div className="flex gap-2 mb-6">
        {sports.map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === s
                ? "bg-[#006A4E] border-[#006A4E] text-white"
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pageItems.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, i) => (
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
