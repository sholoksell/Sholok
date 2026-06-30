import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Clock } from "lucide-react";

export default function NewsCard({ item, large }) {
  const dt = new Date(item.date);
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Link
        to={`/news/${item.id}`}
        className={`block glass rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#F2B705]/10 transition-shadow h-full ${
          large ? "p-0" : "p-4"
        }`}
      >
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-[#006A4E]/30 to-[#F2B705]/20 ${
            large ? "h-56 text-6xl" : "h-32 text-4xl rounded-xl mb-3"
          }`}
        >
          {item.image}
        </div>
        <div className={large ? "p-5" : ""}>
          <span className="text-xs font-semibold text-[#F2B705]">{item.category}</span>
          <h3 className={`font-bold text-white mt-1 line-clamp-2 ${large ? "text-xl" : "text-sm"}`}>
            {item.title}
          </h3>
          {large && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.excerpt}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye size={12} /> {item.views.toLocaleString("bn-BD")}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {dt.toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
