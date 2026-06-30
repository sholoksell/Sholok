import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import { useMail } from "../context/MailContext";

export default function Folders() {
  const { folders } = useMail();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Folders</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {folders.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
            <Link to={`/folders/${f.id}`} className="glass flex flex-col gap-3 rounded-3xl p-4 hover:shadow-lg transition-shadow">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                style={{ background: f.color }}
              >
                <Folder size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{f.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{f.count} emails</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
