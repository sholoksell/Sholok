import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function SectionTitle({ icon, title, subtitle, viewAllTo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="flex items-end justify-between mb-6"
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="text-sm font-medium text-[#F2B705] hover:underline shrink-0"
        >
          সবগুলো দেখুন →
        </Link>
      )}
    </motion.div>
  );
}
