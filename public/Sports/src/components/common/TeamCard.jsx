import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function TeamCard({ team }) {
  const { favoriteTeams, toggleFavoriteTeam } = useApp();
  const isFav = favoriteTeams?.includes(team.id);

  return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/teams/${team.id}`}
        className="block glass rounded-2xl p-5 text-center relative hover:shadow-xl transition-shadow"
        style={{ boxShadow: `inset 0 -3px 0 ${team.color}` }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavoriteTeam(team.id);
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
          aria-label="পছন্দের তালিকায় যোগ করুন"
        >
          <Heart size={16} fill={isFav ? "#f43f5e" : "none"} color={isFav ? "#f43f5e" : "currentColor"} />
        </button>
        <div className="text-5xl mb-3">{team.logo}</div>
        <h3 className="font-bold text-white text-sm">{team.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{team.sport} • {team.city}</p>
        <div className="flex justify-center gap-3 mt-3 text-xs text-gray-400">
          <span>🏆 {team.titles} শিরোপা</span>
        </div>
      </Link>
    </motion.div>
  );
}
