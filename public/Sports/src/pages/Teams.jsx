import { useState } from "react";
import SectionTitle from "../components/common/SectionTitle";
import TeamCard from "../components/common/TeamCard";
import { teams } from "../data/teams";

const sports = ["সব", "ক্রিকেট", "ফুটবল"];

export default function Teams() {
  const [filter, setFilter] = useState("সব");
  const filtered = teams.filter((t) => filter === "সব" || t.sport === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionTitle icon="🛡️" title="দলসমূহ" subtitle="বাংলাদেশের সকল জাতীয় ও ঘরোয়া দল" />

      <div className="flex gap-2 mb-6">
        {sports.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
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

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((t) => (
          <TeamCard key={t.id} team={t} />
        ))}
      </div>
    </div>
  );
}
