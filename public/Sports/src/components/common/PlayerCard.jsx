import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function PlayerCard({ player }) {
  const { favoritePlayers, toggleFavoritePlayer } = useApp();
  const isFav = favoritePlayers?.includes(player.id);

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/players/${player.id}`}
        className="block glass rounded-2xl p-4 text-center relative hover:shadow-xl transition-shadow"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavoritePlayer(player.id);
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
          aria-label="পছন্দের তালিকায় যোগ করুন"
        >
          <Heart size={16} fill={isFav ? "#f43f5e" : "none"} color={isFav ? "#f43f5e" : "currentColor"} />
        </button>
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#006A4E] to-[#F2B705] flex items-center justify-center text-3xl mb-3">
          {player.avatar}
        </div>
        <h3 className="font-semibold text-white text-sm truncate">{player.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{player.position} • {player.sport}</p>
        <div className="flex justify-center gap-2 mt-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#F2B705]">রেটিং {player.rating}</span>
        </div>
      </Link>
    </motion.div>
  );
}
