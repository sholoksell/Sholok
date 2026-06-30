import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { getPlayerById } from "../data/players";
import { useApp } from "../context/AppContext";

export default function PlayerDetail() {
  const { playerId } = useParams();
  const player = getPlayerById(playerId);
  const { favoritePlayers, toggleFavoritePlayer, addRecentlyViewed } = useApp();

  useEffect(() => {
    if (player) addRecentlyViewed({ id: player.id, type: "player", title: player.name });
  }, [player]); // eslint-disable-line

  if (!player) return <Navigate to="/players" replace />;

  const isFav = favoritePlayers?.includes(player.id);
  const chartData = player.form.map((v, i) => ({ name: `ম্যাচ ${i + 1}`, পারফরম্যান্স: v }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#006A4E] to-[#F2B705] flex items-center justify-center text-6xl">
          {player.avatar}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white">{player.name}</h1>
          <p className="text-gray-400 mt-1">
            {player.position} • {player.sport} • জার্সি #{player.jersey}
          </p>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm text-gray-300">
            <span>🎂 বয়স: {player.age}</span>
            <span>🏙️ শহর: {player.city}</span>
            <span>⭐ রেটিং: {player.rating}</span>
          </div>
        </div>
        <button
          onClick={() => toggleFavoritePlayer(player.id)}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold border transition-colors ${
            isFav ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-white/10 text-gray-300 hover:text-white"
          }`}
        >
          <Heart size={16} fill={isFav ? "#f43f5e" : "none"} /> {isFav ? "পছন্দের তালিকায় আছে" : "পছন্দ করুন"}
        </button>
      </motion.div>

      <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "ম্যাচ", value: player.matches },
          player.sport === "ক্রিকেট"
            ? { label: "রান", value: player.runs }
            : { label: "গোল", value: player.goals },
          player.sport === "ক্রিকেট"
            ? { label: "উইকেট", value: player.wickets }
            : { label: "অ্যাসিস্ট", value: player.assists },
          { label: "গড়", value: player.average },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[#F2B705]">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">সাম্প্রতিক পারফরম্যান্স</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #ffffff20", borderRadius: 8 }} />
              <Line type="monotone" dataKey="পারফরম্যান্স" stroke="#F2B705" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">অর্জনসমূহ</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {["সেরা খেলোয়াড় পুরস্কার", "সিরিজ সেরা খেলোয়াড়", "জাতীয় দলে অভিষেক"].map((a, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🏅</span>
              <span className="text-sm text-gray-300">{a}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
