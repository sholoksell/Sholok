import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import SectionTitle from "../components/common/SectionTitle";
import MatchCard from "../components/common/MatchCard";
import { liveMatches, matches, getMatchById, upcomingMatches } from "../data/matches";

function WinProbability({ match }) {
  const data = [
    { name: match.home.shortName, value: match.winProbability.home, fill: match.home.color },
  ];
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-28 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={20} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
          {match.winProbability.home}%
        </div>
      </div>
      <div className="text-sm">
        <p className="text-white font-semibold">{match.home.shortName} জয়ের সম্ভাবনা {match.winProbability.home}%</p>
        <p className="text-gray-400">{match.away.shortName} জয়ের সম্ভাবনা {match.winProbability.away}%</p>
      </div>
    </div>
  );
}

function MatchDetailPanel({ match }) {
  const commentary = [
    "চমৎকার একটি বাউন্ডারি দিয়ে শুরু করলেন ব্যাটসম্যান!",
    "দারুণ একটি ইয়র্কারে পরাস্ত হলেন ব্যাটসম্যান।",
    "ফিল্ডিংয়ে অসাধারণ একটি ক্যাচ মিস হলো।",
    "দুই রান নিয়ে স্ট্রাইক বদল করলেন ব্যাটসম্যানরা।",
    "ছক্কা! গ্যালারিতে উল্লাস।",
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{match.home.logo}</span>
          <div>
            <p className="font-bold text-white">{match.home.shortName}</p>
            <p className="text-lg font-extrabold text-[#F2B705]">{match.homeScore ?? "-"}</p>
          </div>
        </div>
        <span className="text-gray-500 font-bold">VS</span>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-white">{match.away.shortName}</p>
            <p className="text-lg font-extrabold text-[#F2B705]">{match.awayScore ?? "-"}</p>
          </div>
          <span className="text-4xl">{match.away.logo}</span>
        </div>
      </div>

      {match.overs && <p className="text-center text-sm text-gray-400">{match.overs}</p>}
      <p className="text-center text-sm text-gray-400">🏟️ {match.venue}</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">ম্যাচসেরা খেলোয়াড়</h3>
          <p className="text-sm text-gray-400">🏅 {match.playerOfMatch}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">জয়ের সম্ভাবনা</h3>
          <WinProbability match={match} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">লাইভ কমেন্ট্রি</h3>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {commentary.map((c, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-[#F2B705] font-semibold shrink-0">{18 - i}.{i + 1}</span>
              <p className="text-gray-300">{c}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">স্কোর টাইমলাইন</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="shrink-0 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold text-gray-300"
            >
              {[0, 1, 2, 4, 6, "W"][i % 6]}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function LiveScore() {
  const { matchId } = useParams();
  const [filter, setFilter] = useState("সব");
  const selected = matchId ? getMatchById(matchId) : liveMatches[0] || upcomingMatches[0];

  const filters = ["সব", "ক্রিকেট", "ফুটবল"];
  const pool = (liveMatches.length ? liveMatches : matches.slice(0, 12)).filter(
    (m) => filter === "সব" || m.sport === filter,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SectionTitle icon="🔴" title="লাইভ স্কোর" subtitle="রিয়েল-টাইম স্কোরবোর্ড ও বিশ্লেষণ" />

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-[#006A4E] border-[#006A4E] text-white"
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {pool.map((m) => (
            <Link key={m.id} to={`/live-score/${m.id}`}>
              <MatchCard match={m} />
            </Link>
          ))}
        </div>
        <div className="lg:col-span-2">
          {selected ? (
            <MatchDetailPanel match={selected} />
          ) : (
            <div className="glass rounded-2xl p-12 text-center text-gray-400">
              কোনো ম্যাচ নির্বাচন করুন বিস্তারিত দেখতে।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
