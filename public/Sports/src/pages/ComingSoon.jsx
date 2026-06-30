import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ComingSoon({ title, icon = "🚧" }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-7xl mb-6">{icon}</div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h1>
        <p className="text-gray-400 mb-8">এই পেজটি শীঘ্রই যুক্ত করা হবে। আমরা এটি নিয়ে কাজ করছি।</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#006A4E] to-[#F2B705] text-white font-semibold hover:scale-105 transition-transform"
        >
          হোমে ফিরে যান
        </Link>
      </motion.div>
    </div>
  );
}
