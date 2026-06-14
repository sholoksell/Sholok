import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "purple" | "warm";
  delay?: number;
}

export default function StatCard({ title, value, change, changeType, icon: Icon, variant = "default", delay = 0 }: StatCardProps) {
  const variantClass = variant === "purple" ? "stat-card-purple" : variant === "warm" ? "stat-card-warm" : "";
  const changeColor = changeType === "up" ? "text-neon-green" : changeType === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`stat-card ${variantClass}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className={`text-xs font-mono font-medium ${changeColor}`}>{change}</span>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
        className="text-2xl font-bold text-foreground mb-1"
      >
        {value}
      </motion.p>
      <p className="text-xs text-muted-foreground">{title}</p>
    </motion.div>
  );
}
