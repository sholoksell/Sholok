import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { getTeamById } from "../data/teams";
import { players } from "../data/players";
import { matches } from "../data/matches";
import { useApp } from "../context/AppContext";

export default function TeamDetail() {
  const { teamId } = useParams();
  const team = getTeamById(teamId);
  const { favoriteTeams, toggleFavoriteTeam, addRecentlyViewed } = useApp();

  useEffect(() => {
    if (team) addRecentlyViewed({ id: team.id, type: "team", title: team.name });
  }, [team]); // eslint-disable-line

  if (!team) return <Navigate to="/teams" replace />;

  const isFav = favoriteTeams?.includes(team.id);
  const squad = players.filter((p) => p.sport === team.sport).slice(0, 12);
  const recent = matches
    .filter((m) => m.home.id === team.id || m.away.id === team.id)
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6"
        style={{ boxShadow: `inset 0 -4px 0 ${team.color}` }}
      >
        <div className="text-8xl">{team.logo}</div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white">{team.name}</h1>
          <p className="text-gray-400 mt-1">{team.sport} • {team.city} • প্রতিষ্ঠিত {team.founded}</p>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm text-gray-300">
            <span>🧑‍✈️ অধিনায়ক: {team.captain}</span>
            <span>👔 কোচ: {team.coach}</span>
            <span>🏟️ হোম গ্রাউন্ড: {team.home}</span>
            <span>🏆 শিরোপা: {team.titles}</span>
          </div>
        </div>
        <button
          onClick={() => toggleFavoriteTeam(team.id)}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold border transition-colors ${
            isFav ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-white/10 text-gray-300 hover:text-white"
          }`}
        >
          <Heart size={16} fill={isFav ? "#f43f5e" : "none"} /> {isFav ? "পছন্দের তালিকায় আছে" : "পছন্দ করুন"}
        </button>
      </motion.div>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">স্কোয়াড</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {squad.map((p) => (
            <Link key={p.id} to={`/players/${p.id}`} className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/5">
              <span className="text-2xl">{p.avatar}</span>
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-gray-400">{p.position}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">সাম্প্রতিক ম্যাচ</h2>
        <div className="space-y-2">
          {recent.map((m) => (
            <div key={m.id} className="glass rounded-xl p-4 flex items-center justify-between text-sm">
              <span className="text-gray-300">{m.home.shortName} vs {m.away.shortName}</span>
              <span className="text-gray-500">{m.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "মোট ম্যাচ", value: 120 + (team.titles + 1) * 7 },
          { label: "জয়", value: 60 + team.titles * 5 },
          { label: "পরাজয়", value: 40 + team.titles },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[#F2B705]">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
