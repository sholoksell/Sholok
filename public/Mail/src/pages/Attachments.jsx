import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Image as ImageIcon, FileArchive, Film, FileSpreadsheet } from "lucide-react";
import { useMail } from "../context/MailContext";

const ICONS = {
  Document: FileText, Image: ImageIcon, Spreadsheet: FileSpreadsheet, Archive: FileArchive, Video: Film, Presentation: FileText,
};

export default function Attachments() {
  const { attachments, storageStats } = useMail();
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(attachments.map((a) => a.type))];

  const filtered = useMemo(
    () => (category === "All" ? attachments : attachments.filter((a) => a.type === category)),
    [attachments, category]
  );

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Attachments</h1>

      <div className="glass flex flex-wrap items-center gap-4 rounded-3xl p-4 text-sm">
        <span className="text-slate-500 dark:text-slate-400">Storage used by attachments</span>
        <span className="font-semibold text-violet-500">{storageStats.breakdown[1].value} GB</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              category === c ? "bg-violet-600 text-white" : "glass text-slate-600 dark:text-slate-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.slice(0, 60).map((a, i) => {
          const Icon = ICONS[a.type] || FileText;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              className="glass flex flex-col gap-3 rounded-3xl p-4"
            >
              <div className="flex h-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                <Icon size={26} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{a.name}</p>
                <p className="text-xs text-slate-400">{a.size}</p>
              </div>
              <button className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-500/10 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-500/20">
                <Download size={12} /> Download
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
