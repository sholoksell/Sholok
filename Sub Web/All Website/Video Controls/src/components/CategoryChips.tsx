import { CATEGORIES } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const CategoryChips = ({ activeCategory = "All", onCategoryChange }: CategoryChipsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 sticky top-16 z-20 bg-background/85 backdrop-blur-xl pt-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange?.(cat)}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth shrink-0",
            activeCategory === cat
              ? "gradient-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-foreground hover:bg-muted"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};
