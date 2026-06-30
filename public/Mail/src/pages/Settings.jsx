import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Globe, Bell, Eye, HardDrive, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useUI } from "../context/UIContext";

const TABS = ["Profile", "Appearance", "Notifications", "Signature", "Auto Reply", "Accessibility"];

export default function Settings() {
  const [tab, setTab] = useState("Profile");
  const { theme, setTheme } = useTheme();
  const { pushToast } = useUI();
  const [signature, setSignature] = useState("Best regards,\nMaksudul Khan");
  const [autoReply, setAutoReply] = useState(false);

  const save = () => pushToast("Settings saved", "success");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t ? "bg-violet-600 text-white" : "glass text-slate-600 dark:text-slate-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 space-y-5">
        {tab === "Profile" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-sky-500 text-xl font-bold text-white">MK</div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">Maksudul Khan</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">engmahmudulkhan@gmail.com</p>
              </div>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-500 dark:text-slate-400">Display name</span>
              <input defaultValue="Maksudul Khan" className="w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-transparent px-3 py-2 outline-none" />
            </label>
          </div>
        )}

        {tab === "Appearance" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme</p>
            <div className="flex gap-3">
              <button onClick={() => setTheme("light")} className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${theme === "light" ? "bg-violet-600 text-white" : "glass"}`}>
                <Sun size={16} /> Light
              </button>
              <button onClick={() => setTheme("dark")} className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${theme === "dark" ? "bg-violet-600 text-white" : "glass"}`}>
                <Moon size={16} /> Dark
              </button>
            </div>
            <label className="block text-sm">
              <span className="mb-1 flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Globe size={14} /> Language</span>
              <select className="w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-transparent px-3 py-2 outline-none">
                <option>English (US)</option>
                <option>Bengali</option>
                <option>Spanish</option>
              </select>
            </label>
          </div>
        )}

        {tab === "Notifications" && (
          <div className="space-y-3">
            {["New mail alerts", "Mentions", "Reminders", "Product updates"].map((n) => (
              <label key={n} className="flex items-center justify-between rounded-2xl px-1 py-2 text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Bell size={14} /> {n}</span>
                <input type="checkbox" defaultChecked className="size-4 accent-violet-600" />
              </label>
            ))}
          </div>
        )}

        {tab === "Signature" && (
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-transparent p-3 text-sm outline-none"
          />
        )}

        {tab === "Auto Reply" && (
          <label className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Enable auto-reply</span>
            <button
              onClick={() => setAutoReply((a) => !a)}
              className={`h-6 w-11 rounded-full transition-colors ${autoReply ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <motion.span animate={{ x: autoReply ? 22 : 2 }} className="block h-5 w-5 rounded-full bg-white shadow" />
            </button>
          </label>
        )}

        {tab === "Accessibility" && (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <label className="flex items-center justify-between"><span className="flex items-center gap-2"><Eye size={14} /> High contrast mode</span><input type="checkbox" className="size-4 accent-violet-600" /></label>
            <label className="flex items-center justify-between"><span className="flex items-center gap-2"><HardDrive size={14} /> Reduce motion</span><input type="checkbox" className="size-4 accent-violet-600" /></label>
            <label className="flex items-center justify-between"><span className="flex items-center gap-2"><User size={14} /> Larger text</span><input type="checkbox" className="size-4 accent-violet-600" /></label>
          </div>
        )}

        <button onClick={save} className="rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90">
          Save changes
        </button>
      </motion.div>
    </div>
  );
}
