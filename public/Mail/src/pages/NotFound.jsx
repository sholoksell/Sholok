import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-violet-500">404</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">This page drifted off into the cloud.</p>
      <Link to="/" className="mt-5 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white">
        Back to Dashboard
      </Link>
    </motion.div>
  );
}
