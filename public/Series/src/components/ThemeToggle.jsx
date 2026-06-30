import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="থিম পরিবর্তন করুন"
      className={`grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-brand-700 transition hover:bg-brand-50 dark:border-white/10 dark:bg-white/10 dark:text-gold-400 dark:hover:bg-white/20 ${className}`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default ThemeToggle;
