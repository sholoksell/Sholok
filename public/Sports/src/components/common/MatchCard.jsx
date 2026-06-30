import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

const statusStyle = {
  "লাইভ": "bg-red-500/20 text-red-400 border-red-500/40",
  "আসন্ন": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  "সম্পন্ন": "bg-gray-500/20 text-gray-400 border-gray-500/40",
};

export default function MatchCard({ match }) {
  const dt = new Date(match.date);
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/live-score/${match.id}`}
        className="block glass rounded-2xl p-4 hover:shadow-xl hover:shadow-[#006A4E]/10 transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-400">{match.tournament}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle[match.status]}`}>
            {match.status === "লাইভ" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse" />}
            {match.status}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-2xl">{match.home.logo}</span>
            <span className="text-sm font-semibold text-white truncate">{match.home.shortName}</span>
          </div>
          <span className="text-sm font-bold text-gray-300">
            {match.homeScore !== null ? match.homeScore : "VS"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-2xl">{match.away.logo}</span>
            <span className="text-sm font-semibold text-white truncate">{match.away.shortName}</span>
          </div>
          <span className="text-sm font-bold text-gray-300">{match.awayScore !== null ? match.awayScore : ""}</span>
        </div>

        {match.overs && <p className="text-xs text-[#F2B705] mt-2">{match.overs}</p>}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} /> {match.venue.split(",")[0]}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock size={12} /> {dt.toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
