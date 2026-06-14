import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Shirt, Home, Sparkles, Headphones, Dumbbell, BookOpen, Coffee, Tag } from "lucide-react";
import { categories as mockCategories } from "@/data/mockData";
import { categoriesApi } from "@/lib/api";

const iconMap = { Cpu, Shirt, Home, Sparkles, Headphones, Dumbbell, BookOpen, Coffee };

export default function Categories() {
  const [categories, setCategories] = useState<any[]>(mockCategories as any);
  useEffect(() => {
    categoriesApi.list().then((r) => {
      const list = r?.categories || r?.data || [];
      if (list.length) {
        const palette = mockCategories.map((c: any) => c.color);
        setCategories(list.map((c: any, i: number) => ({
          name:  c.name,
          icon:  c.icon || mockCategories[i % mockCategories.length].icon,
          color: c.color || palette[i % palette.length],
        })));
      }
    }).catch(() => {});
  }, []);
  return (
    <section className="container py-16 lg:py-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Browse</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold">Shop by category</h2>
        </div>
      </div>

      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon as keyof typeof iconMap] || Tag;
          return (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-secondary transition-colors"
            >
              <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-110`}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-xs lg:text-sm font-medium">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
