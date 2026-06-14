import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { productService } from '@/services/productService';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice, getImageUrl } from '@/lib/utils';

const SmartSearch = ({ className }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const { t, language, getLocalizedField } = useLanguage();

    // Load products for local filtering suggestions
    useEffect(() => {
        setLoading(true);
        productService.getAll({ limit: 100 })
            .then(res => {
                setProducts(res.products || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading products:', err);
                setLoading(false);
            });
    }, []);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 0) {
            const searchValue = value.toLowerCase();
            const filtered = products.filter(p => {
                // Search in English name
                const nameMatch = p.name?.toLowerCase().includes(searchValue);
                // Search in Bengali name
                const nameBnMatch = p.nameBn?.toLowerCase().includes(searchValue);
                // Search in category name
                const categoryMatch = p.categoryId?.name?.toLowerCase().includes(searchValue);
                // Search in brand
                const brandMatch = p.brand?.toLowerCase().includes(searchValue);
                
                return nameMatch || nameBnMatch || categoryMatch || brandMatch;
            }).slice(0, 8); // Show top 8 suggestions
            
            setSuggestions(filtered);
            setIsOpen(true);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <form className="relative flex w-full" onSubmit={handleSubmit}>
                <div className="relative w-full flex">
                    <Input
                        type="search"
                        placeholder={language === 'bn' ? 'পণ্যের নাম লিখুন...' : 'Search your products...'}
                        value={query}
                        onChange={handleSearchChange}
                        onFocus={() => query.length > 0 && setIsOpen(true)}
                        className="w-full pl-4 pr-16 h-10 rounded-sm focus-visible:ring-0 border-0 bg-white text-black placeholder:text-gray-500 shadow-sm"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-14 top-0 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    <Button
                        type="submit"
                        className="absolute right-0 top-0 h-10 w-12 rounded-l-none rounded-r-sm bg-[#fec400] hover:bg-[#eebb00] text-black border-l border-gray-100 transition-all"
                        disabled={!query.trim()}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[400px] overflow-y-auto">
                        <ul>
                            {suggestions.map((product) => (
                                <li
                                    key={product._id || product.id}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0 transition-colors group"
                                    onClick={() => {
                                        setQuery(getLocalizedField(product, 'name'));
                                        setIsOpen(false);
                                        navigate(`/product/${product.slug}`);
                                    }}
                                >

                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-medium text-gray-800 group-hover:text-[#E31E24] transition-colors truncate">
                                            {getLocalizedField(product, 'name')}
                                        </span>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-gray-500 truncate">
                                                {product.categoryId?.name || 'General'}
                                            </span>
                                            <span className="text-sm font-bold text-[#E31E24] flex-shrink-0">
                                                {formatPrice(product.salePrice || product.price || product.regularPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div
                            className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-center text-sm text-[#E31E24] font-semibold cursor-pointer hover:from-[#E31E24] hover:to-[#b9151a] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 sticky bottom-0"
                            onClick={handleSubmit}
                        >
                            <Search className="h-4 w-4" />
                            <span>{language === 'bn' ? `"${query}" এর সব ফলাফল দেখুন` : `See all results for "${query}"`}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* No results message */}
            {isOpen && query.length > 0 && suggestions.length === 0 && !loading && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-8 text-center">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm font-medium">
                            {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            {language === 'bn' ? 'অন্য কীওয়ার্ড ব্যবহার করে চেষ্টা করুন' : 'Try different keywords'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartSearch;
