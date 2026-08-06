import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, TrendingUp, Clock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';

const SmartSearch = ({ className }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [], popularSearches: [] });
    const [popular, setPopular] = useState({ popular: [], trending: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();
    const { language, t } = useLanguage();

    // Load popular/trending on mount (lightweight)
    useEffect(() => {
        api.get('/search/popular?limit=6')
            .then(r => setPopular(r.data))
            .catch(() => {});
    }, []);

    // Outside click to close
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchSuggestions = useCallback(async (q) => {
        if (!q.trim()) {
            setSuggestions({ products: [], categories: [], brands: [], popularSearches: [] });
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/search/suggestions', { params: { q, limit: 6 } });
            setSuggestions(res.data || { products: [], categories: [], brands: [], popularSearches: [] });
        } catch {
            setSuggestions({ products: [], categories: [], brands: [], popularSearches: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            // Track search
            api.post('/search/history', { query: query.trim() }).catch(() => {});
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const selectQuery = (q) => {
        setQuery(q);
        setIsOpen(false);
        api.post('/search/history', { query: q }).catch(() => {});
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions({ products: [], categories: [], brands: [], popularSearches: [] });
        setIsOpen(false);
    };

    const hasResults = query.trim() && (
        suggestions.products?.length > 0 ||
        suggestions.categories?.length > 0 ||
        suggestions.brands?.length > 0 ||
        suggestions.popularSearches?.length > 0
    );

    const showPopular = !query.trim() && isOpen && (popular.trending?.length > 0 || popular.popular?.length > 0);

    return (
        <div ref={wrapperRef} className={`relative w-full ${className ?? ''}`}>
            <form className="relative flex w-full" onSubmit={handleSubmit}>
                <div className="relative w-full flex items-center">
                    {/* Search icon inside input on the left */}
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <input
                        type="search"
                        placeholder={language === 'bn' ? 'পণ্যের নাম লিখুন...' : 'Search products, brands, categories...'}
                        value={query}
                        onChange={handleChange}
                        onFocus={() => setIsOpen(true)}
                        className="
                            w-full h-12 pl-11 pr-24
                            rounded-l-full rounded-r-none
                            border-2 border-transparent
                            bg-white text-gray-800 text-sm md:text-base
                            placeholder:text-gray-400
                            outline-none
                            transition-all duration-200
                            hover:border-gray-300
                            focus:border-[#E31E24] focus:shadow-[0_0_0_3px_rgba(227,30,36,0.12)]
                            [appearance:textfield]
                            [&::-webkit-search-cancel-button]:hidden
                        "
                    />
                    {query && (
                        <button type="button" onClick={clearSearch}
                            className="absolute right-[52px] top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button type="submit"
                        disabled={!query.trim()}
                        className="
                            absolute right-0 top-0 h-12 w-[52px]
                            rounded-r-full rounded-l-none
                            bg-[#fec400] hover:bg-[#f5bc00]
                            disabled:opacity-60 disabled:cursor-not-allowed
                            text-gray-900 font-semibold
                            flex items-center justify-center
                            border-l-2 border-[#e5b000]
                            transition-colors duration-200
                            shadow-sm
                        ">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </button>
                </div>
            </form>

            {/* Dropdown */}
            {isOpen && (hasResults || showPopular) && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[450px] overflow-y-auto">

                        {/* Popular/Trending (shown when no query) */}
                        {showPopular && (
                            <div className="p-3">
                                {popular.trending?.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <TrendingUp size={12} /> {t('trending')}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {popular.trending.slice(0, 5).map((q, i) => (
                                                <button key={i} onClick={() => selectQuery(q)}
                                                    className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors">
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {popular.popular?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Search size={12} /> {t('popularSearches')}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {popular.popular.slice(0, 6).map((q, i) => (
                                                <button key={i} onClick={() => selectQuery(q)}
                                                    className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full hover:bg-gray-200 transition-colors">
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Query suggestions */}
                        {query.trim() && (
                            <>
                                {/* Popular search matches */}
                                {suggestions.popularSearches?.length > 0 && (
                                    <div className="border-b">
                                        {suggestions.popularSearches.slice(0, 3).map((q, i) => (
                                            <button key={i} onClick={() => selectQuery(q)}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                                                <Search size={14} className="text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-700">{q}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Categories */}
                                {suggestions.categories?.length > 0 && (
                                    <div className="border-b px-4 py-2">
                                        <p className="text-xs text-gray-400 mb-1.5">{t('categories')}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {suggestions.categories.map(c => (
                                                <a key={c.id} href={`/category/${c.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
                                                    {language === 'bn' && c.nameBn ? c.nameBn : c.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Brands */}
                                {suggestions.brands?.length > 0 && (
                                    <div className="border-b px-4 py-2">
                                        <p className="text-xs text-gray-400 mb-1.5">{t('brands')}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {suggestions.brands.map(b => (
                                                <button key={b.id} onClick={() => selectQuery(b.name)}
                                                    className="text-xs flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full hover:bg-purple-100 transition-colors">
                                                    <Tag size={10} />
                                                    {b.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Products */}
                                {suggestions.products?.length > 0 && (
                                    <ul>
                                        {suggestions.products.map((product) => (
                                            <li key={product.id}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0 transition-colors group"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    navigate(`/product/${product.slug}`);
                                                }}>
                                                {product.thumbnail && (
                                                    <img src={product.thumbnail} alt="" className="w-9 h-9 rounded object-cover shrink-0 bg-gray-100" onError={e => { e.target.style.display = 'none'; }} />
                                                )}
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-gray-800 group-hover:text-[#E31E24] transition-colors truncate">
                                                        {product.name}
                                                    </span>
                                                    <div className="flex items-center justify-between gap-2">
                                                        {product.sku && <span className="text-xs text-gray-400">SKU: {product.sku}</span>}
                                                        <span className="text-sm font-bold text-[#E31E24] ml-auto">
                                                            ৳{(product.sale_price || product.regular_price)?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* See all results */}
                                <div onClick={handleSubmit}
                                    className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-center text-sm text-[#E31E24] font-semibold cursor-pointer hover:from-[#E31E24] hover:to-[#b9151a] hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                                    <Search className="h-4 w-4" />
                                    <span>{language === 'bn' ? `"${query}" এর সব ফলাফল দেখুন` : `See all results for "${query}"`}</span>

                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* No results */}
            {isOpen && query.trim() && !loading && !hasResults && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="px-4 py-8 text-center">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm font-medium">
                            {t('noResultsFound')}
                        </p>
                        <button onClick={handleSubmit} className="mt-3 text-sm text-[#E31E24] hover:underline">
                            {t('searchAnyway')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartSearch;
