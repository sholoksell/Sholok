import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

function SearchBar({ className = '', placeholder = 'বই, লেখক বা নভেল খুঁজুন...' }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim()) navigate(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm text-brand-950 outline-none ring-brand-400 transition focus:ring-2 dark:border-white/10 dark:bg-white/10 dark:text-white"
      />
    </form>
  );
}

export default SearchBar;
