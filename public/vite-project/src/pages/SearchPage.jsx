import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { Filter, Search, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('relevance');
    const { t, language, getLocalizedField } = useLanguage();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch all products and filter locally
                const response = await productService.getAll({ limit: 200 });
                const allProducts = response.products || [];

                if (query) {
                    const searchValue = query.toLowerCase();
                    const filtered = allProducts.filter(p => {
                        // Search in English name
                        const nameMatch = p.name?.toLowerCase().includes(searchValue);
                        // Search in Bengali name
                        const nameBnMatch = p.nameBn?.toLowerCase().includes(searchValue);
                        // Search in category name
                        const categoryMatch = p.categoryId?.name?.toLowerCase().includes(searchValue);
                        // Search in brand
                        const brandMatch = p.brand?.toLowerCase().includes(searchValue);
                        // Search in description
                        const descMatch = p.description?.toLowerCase().includes(searchValue);
                        
                        return nameMatch || nameBnMatch || categoryMatch || brandMatch || descMatch;
                    });

                    // Apply sorting
                    let sorted = [...filtered];
                    if (sortBy === 'price-low') {
                        sorted.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
                    } else if (sortBy === 'price-high') {
                        sorted.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
                    } else if (sortBy === 'name') {
                        sorted.sort((a, b) => a.name.localeCompare(b.name));
                    }

                    setProducts(sorted);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Search error:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Back Button & Header */}
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#E31E24] transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
                        </span>
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Search className="h-7 w-7 text-[#E31E24]" />
                                {language === 'bn' ? 'খোঁজার ফলাফল' : 'Search Results'}
                            </h1>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-gray-600">
                                    {language === 'bn' ? 'খুঁজছেন:' : 'Searching for:'}
                                </span>
                                <span className="text-[#E31E24] font-semibold bg-red-50 px-3 py-1 rounded-full">
                                    "{query}"
                                </span>
                                <span className="text-gray-500 text-sm">
                                    ({products.length} {language === 'bn' ? 'টি পণ্য' : 'items'})
                                </span>
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-[#E31E24] focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-all"
                            >
                                <option value="relevance">
                                    {language === 'bn' ? 'প্রাসঙ্গিকতা' : 'Relevance'}
                                </option>
                                <option value="price-low">
                                    {language === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}
                                </option>
                                <option value="price-high">
                                    {language === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}
                                </option>
                                <option value="name">
                                    {language === 'bn' ? 'নাম: A-Z' : 'Name: A-Z'}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-sm">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E31E24] border-t-transparent"></div>
                        <p className="mt-4 text-gray-500 font-medium">
                            {language === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching...'}
                        </p>
                    </div>
                ) : products.length > 0 ? (
                    // Products Grid
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05, duration: 0.2 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    // No Results State
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-20 bg-white rounded-xl shadow-sm"
                    >
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="h-12 w-12 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No Products Found'}
                        </h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {language === 'bn' 
                                ? `"${query}" এর জন্য কোন ফলাফল পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন বা আমাদের ক্যাটাগরি ব্রাউজ করুন।`
                                : `No products found matching "${query}". Try different keywords or browse our categories.`}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link 
                                to="/"
                                className="px-6 py-3 bg-[#E31E24] hover:bg-[#b9151a] text-white font-semibold rounded-lg transition-colors"
                            >
                                {language === 'bn' ? 'হোমে যান' : 'Go to Home'}
                            </Link>
                            <button
                                onClick={() => {
                                    setSearchParams({});
                                    window.location.href = '/';
                                }}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                {language === 'bn' ? 'পরিষ্কার করুন' : 'Clear Search'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
