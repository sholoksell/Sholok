import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Inbox, FileEdit, Users, Settings, Search, Plus,
} from "lucide-react";
import { useUI } from "../context/UIContext";
import { useMail } from "../context/MailContext";

const COMMANDS = [
  { label: "Go to Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Go to Inbox", to: "/inbox", icon: Inbox },
  { label: "Go to Drafts", to: "/drafts", icon: FileEdit },
  { label: "Go to Contacts", to: "/contacts", icon: Users },
  { label: "Go to Settings", to: "/settings", icon: Settings },
  { label: "Go to Search", to: "/search", icon: Search },
];

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUI();
  const { setComposeOpen } = useMail();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-32 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="glass-strong w-full max-w-lg rounded-3xl p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full rounded-2xl bg-white/40 dark:bg-white/5 px-4 py-3 text-sm outline-none"
            />
            <div className="mt-2 max-h-72 overflow-y-auto">
              <button
                onClick={() => {
                  setComposeOpen(true);
                  setCommandPaletteOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-violet-500/10"
              >
                <Plus size={16} className="text-violet-500" /> Compose new email
              </button>
              {filtered.map((c) => (
                <button
                  key={c.to}
                  onClick={() => {
                    navigate(c.to);
                    setCommandPaletteOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-violet-500/10"
                >
                  <c.icon size={16} className="text-violet-500" /> {c.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
