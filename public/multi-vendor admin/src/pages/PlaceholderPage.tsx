import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" > ");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-6 p-4 rounded-2xl bg-muted"
      >
        <Construction className="w-10 h-10 text-muted-foreground" />
      </motion.div>
      <h1 className="text-xl font-bold text-foreground mb-2">{pageName || "Page"}</h1>
      <p className="text-sm text-muted-foreground max-w-md">This module is part of the NEXUS admin panel architecture. Connect your backend to activate full functionality.</p>
    </motion.div>
  );
}
