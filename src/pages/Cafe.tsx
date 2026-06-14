import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '@/components/portal/Header';
import Footer from '@/components/portal/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, MapPin, Star, Clock, Phone, Wifi,
  ChevronDown, ChevronUp, X, Award, Info,
  SlidersHorizontal, Heart,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Review {
  _id: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  date: string;
}

interface Cafe {
  _id: string;
  name: string;
  description: string;
  images: string[];
  coverImage: string;
  city: string;
  area: string;
  address: string;
  establishmentType: string[];
  mealType: string[];
  cuisines: string[];
  dishes: string[];
  priceRange: string;
  priceSymbol: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  openingHours: { day: string; open?: string; close?: string; closed?: boolean }[];
  isOpenNow: boolean;
  awards: string[];
  features: string[];
  dietaryRestrictions: string[];
  phone?: string;
  isFeatured: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RatingStars = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const filled = Math.round(rating);
  const s = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${s} ${i <= filled ? 'fill-green-600 text-green-600' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
};

const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal'];

const FILTER_OPTIONS = {
  establishmentType: ['Restaurant', 'Coffee & Tea', 'Cafe', 'Quick Bites', 'Bakery', 'Dessert Shop', 'Juice Bar'],
  mealType: ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Late Night Snacks', 'All Day'],
  cuisines: ['Cafe', 'Asian', 'Bangladeshi', 'Chinese', 'Italian', 'Continental', 'Fast Food', 'Japanese', 'Fusion'],
  dishes: ['Coffee', 'Tea', 'Cake', 'Desserts', 'Sandwiches', 'Burger', 'Pasta', 'Pizza', 'Waffle', 'Pancake', 'Smoothie', 'Juice'],
  priceRange: ['Cheap Eats', 'Mid-range', 'Fine Dining'],
  awards: ["Travelers' Choice", 'Best Cafe 2024', 'Hidden Gem', 'Top Rated'],
  features: ['Free WiFi', 'Outdoor Seating', 'Indoor Seating', 'Air Conditioning', 'Parking', 'Delivery', 'Rooftop'],
  dietaryRestrictions: ['Vegetarian Friendly', 'Vegan Options', 'Gluten Free Options', 'Halal', 'No Pork'],
};
type FilterKey = keyof typeof FILTER_OPTIONS;

interface Filters {
  establishmentType: string[];
  mealType: string[];
  cuisines: string[];
  dishes: string[];
  priceRange: string[];
  awards: string[];
  features: string[];
  dietaryRestrictions: string[];
  isOpenNow: boolean;
  rating: string;
}
const defaultFilters: Filters = {
  establishmentType: [], mealType: [], cuisines: [], dishes: [], priceRange: [],
  awards: [], features: [], dietaryRestrictions: [], isOpenNow: false, rating: '',
};

// ─── FilterSection ────────────────────────────────────────────────────────────
const FilterSection = ({
  title, options, selected, onChange,
}: {
  title: string; options: string[]; selected: string[]; onChange: (v: string) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, 5);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-3">
      <button
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2"
        onClick={() => setExpanded(p => !p)}
      >
        {title}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="space-y-1.5">
          {visible.map(opt => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-primary">
              <Checkbox checked={selected.includes(opt)} onCheckedChange={() => onChange(opt)} className="w-4 h-4" />
              {opt}
            </label>
          ))}
          {options.length > 5 && (
            <button className="text-xs text-primary font-medium mt-1 hover:underline" onClick={() => setShowAll(p => !p)}>
              {showAll ? 'Show less' : `Show all (${options.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── CafeCard ─────────────────────────────────────────────────────────────────
const CafeCard = ({ cafe, index, onClick }: { cafe: Cafe; index: number; onClick: () => void }) => {
  const fallback = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop';
  const [imgSrc, setImgSrc] = useState(cafe.coverImage || cafe.images?.[0] || '');
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="relative flex-shrink-0 w-44 h-36 rounded-lg overflow-hidden bg-gray-100" onClick={onClick}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={cafe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc(fallback)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-50">☕</div>
        )}
        <button
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm z-10"
          onClick={e => { e.stopPropagation(); setSaved(p => !p); }}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        {cafe.isFeatured && (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">FEATURED</span>
        )}
      </div>
      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
            <span className="text-gray-400 mr-1 font-normal text-sm">{index + 1}.</span>{cafe.name}
          </h3>
          {cafe.awards.includes("Travelers' Choice") && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0 text-[10px] flex items-center gap-1">
              <Award className="w-3 h-3" /> Travelers' Choice
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <RatingStars rating={cafe.rating} />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{cafe.rating}</span>
          <span className="text-xs text-gray-500">({cafe.reviewCount.toLocaleString()} reviews)</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {cafe.establishmentType.slice(0, 2).map(t => (
            <span key={t} className="text-xs text-gray-600 dark:text-gray-400">☕ {t}</span>
          ))}
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cafe.priceSymbol}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className={`text-xs font-medium ${cafe.isOpenNow ? 'text-green-600' : 'text-red-500'}`}>
            <Clock className="w-3 h-3 inline mr-0.5" />{cafe.isOpenNow ? 'Open now' : 'Closed'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" /><span>{cafe.area}, {cafe.city}</span>
        </div>
        {cafe.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic">
            "{cafe.description.slice(0, 120)}..."
          </p>
        )}
      </div>
    </div>
  );
};

// ─── CafeDetailModal ──────────────────────────────────────────────────────────
const CafeDetailModal = ({ cafe, onClose }: { cafe: Cafe; onClose: () => void }) => {
  const [activeImg, setActiveImg] = useState(0);
  const fallback = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop';
  const allImages = [cafe.coverImage, ...(cafe.images || [])].filter(Boolean);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative h-64 bg-gray-100">
            <img
              src={allImages[activeImg] || fallback}
              alt={cafe.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = fallback; }}
            />
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-4' : 'bg-white/60'}`}
                  />
                ))}
              </div>
            )}
            {cafe.isFeatured && (
              <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">FEATURED</span>
            )}
          </div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">{cafe.name}</DialogTitle>
                {cafe.awards.includes("Travelers' Choice") && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 mt-1">
                    <Award className="w-3 h-3" /> Travelers' Choice
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <RatingStars rating={cafe.rating} size="md" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">{cafe.rating}</span>
                <span className="text-sm text-gray-500">({cafe.reviewCount.toLocaleString()} reviews)</span>
                <span className="text-gray-300">|</span>
                <span className={`text-sm font-medium ${cafe.isOpenNow ? 'text-green-600' : 'text-red-500'}`}>
                  <Clock className="w-3.5 h-3.5 inline mr-1" />{cafe.isOpenNow ? 'Open now' : 'Closed'}
                </span>
              </div>
            </DialogHeader>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {cafe.establishmentType.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
              {cafe.cuisines.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">{cafe.priceRange} · {cafe.priceSymbol}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">{cafe.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</h4>
                <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" /><span>{cafe.address}</span>
                </div>
              </div>
              {cafe.phone && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-primary" /><span>{cafe.phone}</span>
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meal Types</h4>
                <div className="flex flex-wrap gap-1">
                  {cafe.mealType.map(m => (
                    <span key={m} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dishes</h4>
                <div className="flex flex-wrap gap-1">
                  {cafe.dishes.map(d => (
                    <span key={d} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">{d}</span>
                  ))}
                </div>
              </div>
            </div>
            {cafe.features.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Features & Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {cafe.features.map(f => (
                    <span key={f} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-full">
                      {f === 'Free WiFi' && <Wifi className="w-3 h-3" />}{f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {cafe.dietaryRestrictions.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dietary Options</h4>
                <div className="flex flex-wrap gap-2">
                  {cafe.dietaryRestrictions.map(d => (
                    <span key={d} className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2 py-1 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
            )}
            {cafe.openingHours && cafe.openingHours.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opening Hours</h4>
                <div className="grid grid-cols-2 gap-1">
                  {cafe.openingHours.map(h => (
                    <div key={h.day} className="flex justify-between text-xs px-2 py-1 rounded">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{h.day.slice(0, 3)}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cafe.reviews && cafe.reviews.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">Reviews</h4>
                <div className="space-y-3">
                  {cafe.reviews.map(r => (
                    <div key={r._id || r.author} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <RatingStars rating={r.rating} />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{r.author}</span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(r.date).toLocaleDateString('en-BD')}</span>
                      </div>
                      {r.title && <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{r.title}</p>}
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">"{r.content}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  selectedCity: string;
  filters: Filters;
  activeFilterCount: number;
  toggleFilter: (key: FilterKey, value: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  clearAllFilters: () => void;
}

const Sidebar = ({ selectedCity, filters, activeFilterCount, toggleFilter, setFilters, clearAllFilters }: SidebarProps) => (
  <aside className="w-full">
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-1 text-xs text-primary mb-3 font-medium">
        <MapPin className="w-3.5 h-3.5" />
        <span>Bangladesh</span>
        <span className="text-gray-400">/</span>
        <span>{selectedCity} restaurants</span>
      </div>
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mb-3 hover:bg-red-100"
        >
          <span>Clear all filters ({activeFilterCount})</span>
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <FilterSection title="Establishment type" options={FILTER_OPTIONS.establishmentType} selected={filters.establishmentType} onChange={v => toggleFilter('establishmentType', v)} />
      <FilterSection title="Meal type" options={FILTER_OPTIONS.mealType} selected={filters.mealType} onChange={v => toggleFilter('mealType', v)} />
      <FilterSection title="Cuisines" options={FILTER_OPTIONS.cuisines} selected={filters.cuisines} onChange={v => toggleFilter('cuisines', v)} />
      <FilterSection title="Dishes" options={FILTER_OPTIONS.dishes} selected={filters.dishes} onChange={v => toggleFilter('dishes', v)} />
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" /> Awards
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-primary">
          <Checkbox checked={filters.awards.includes("Travelers' Choice")} onCheckedChange={() => toggleFilter('awards', "Travelers' Choice")} />
          <span className="text-green-700 dark:text-green-400 font-medium">Travelers' Choice</span>
        </label>
      </div>
      <FilterSection title="Price" options={FILTER_OPTIONS.priceRange} selected={filters.priceRange} onChange={v => toggleFilter('priceRange', v)} />
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Traveler rating</p>
        {[['4', '4+'], ['3', '3+'], ['2', '2+']].map(([val]) => (
          <label key={val} className="flex items-center gap-2 mb-1.5 cursor-pointer">
            <Checkbox
              checked={filters.rating === val}
              onCheckedChange={() => setFilters(p => ({ ...p, rating: p.rating === val ? '' : val }))}
            />
            <RatingStars rating={parseInt(val)} />
            <span className="text-xs text-gray-500">& up</span>
          </label>
        ))}
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 py-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Open now
          </span>
          <Checkbox
            checked={filters.isOpenNow}
            onCheckedChange={v => setFilters(p => ({ ...p, isOpenNow: !!v }))}
          />
        </label>
      </div>
      <FilterSection title="Dietary restrictions" options={FILTER_OPTIONS.dietaryRestrictions} selected={filters.dietaryRestrictions} onChange={v => toggleFilter('dietaryRestrictions', v)} />
      <FilterSection title="Features" options={FILTER_OPTIONS.features} selected={filters.features} onChange={v => toggleFilter('features', v)} />
    </div>
  </aside>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CafePage = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('rating');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchCafes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { city: selectedCity, sort, limit: 50 };
      if (search) params.search = search;
      if (filters.isOpenNow) params.isOpenNow = true;
      if (filters.rating) params.rating = filters.rating;
      (['establishmentType', 'mealType', 'cuisines', 'dishes', 'priceRange', 'awards', 'features', 'dietaryRestrictions'] as FilterKey[]).forEach(k => {
        if ((filters[k] as string[]).length > 0) params[k] = filters[k];
      });
      const res = await axios.get(`${API_BASE}/cafes`, { params });
      setCafes(res.data.cafes || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Could not load cafes. Please ensure the server is running on port 5001.');
      setCafes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, sort, search, filters]);

  useEffect(() => { fetchCafes(); }, [fetchCafes]);

  const openCafeDetail = async (cafe: Cafe) => {
    try {
      const res = await axios.get(`${API_BASE}/cafes/${cafe._id}`);
      setSelectedCafe(res.data.cafe);
    } catch {
      setSelectedCafe(cafe);
    }
  };

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(v => v !== value)
        : [...(prev[key] as string[]), value],
    }));
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setSearch('');
    setSearchInput('');
  };

  const activeFilterCount = Object.entries(filters).reduce((acc, [k, v]) => {
    if (k === 'isOpenNow') return acc + (v ? 1 : 0);
    if (k === 'rating') return acc + (v ? 1 : 0);
    return acc + (v as string[]).length;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero / Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Cafés in {selectedCity}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Discover the best cafes in Bangladesh</p>

          {/* City selector */}
          <div className="flex flex-wrap gap-2 mb-5">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCity === city
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={`Search cafes in ${selectedCity}...`}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setSearch(searchInput)}>Search</Button>
            {search && (
              <Button variant="outline" onClick={() => { setSearch(''); setSearchInput(''); }}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <Sidebar
            selectedCity={selectedCity}
            filters={filters}
            activeFilterCount={activeFilterCount}
            toggleFilter={toggleFilter}
            setFilters={setFilters}
            clearAllFilters={clearAllFilters}
          />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? 'Loading...' : (
                  <><span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()} results</span></>
                )}
              </p>
              {/* Mobile filter button */}
              <button
                className="lg:hidden flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:border-primary"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filters.isOpenNow && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                      Open now
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(p => ({ ...p, isOpenNow: false }))} />
                    </span>
                  )}
                  {(Object.entries(filters) as [FilterKey, any][])
                    .filter(([k]) => Array.isArray(filters[k as FilterKey]))
                    .flatMap(([k, v]) =>
                      (v as string[]).map((val: string) => (
                        <span key={`${k}-${val}`} className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                          {val}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(k as FilterKey, val)} />
                        </span>
                      ))
                    )}
                </div>
              )}
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="rating">Relevance</option>
                <option value="reviewCount">Most Reviewed</option>
                <option value="name">Name A–Z</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 text-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
                  <div className="w-44 h-36 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && cafes.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">☕</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">No cafes found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Try changing your filters or searching in a different city.
              </p>
              <Button variant="outline" onClick={clearAllFilters}>Clear all filters</Button>
            </div>
          )}

          {/* Cafe list */}
          {!loading && cafes.length > 0 && (
            <div className="space-y-4">
              {cafes.map((cafe, idx) => (
                <CafeCard
                  key={cafe._id}
                  cafe={cafe}
                  index={idx}
                  onClick={() => openCafeDetail(cafe)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <Sidebar
              selectedCity={selectedCity}
              filters={filters}
              activeFilterCount={activeFilterCount}
              toggleFilter={toggleFilter}
              setFilters={setFilters}
              clearAllFilters={clearAllFilters}
            />
            <Button className="w-full mt-4" onClick={() => setShowMobileFilters(false)}>
              Show {total} results
            </Button>
          </div>
        </div>
      )}

      {/* Cafe detail modal */}
      {selectedCafe && (
        <CafeDetailModal cafe={selectedCafe} onClose={() => setSelectedCafe(null)} />
      )}

      <Footer />
    </div>
  );
};

export default CafePage;
