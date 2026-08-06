import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import CategoryIcon from '@/components/CategoryIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/contexts/CategoryContext';
import CategoryTree from '@/components/CategoryTree';

// Traverse the nested category tree and return the path (array) from root to targetSlug
function findCategoryPath(nodes, targetSlug, path = []) {
  for (const node of nodes) {
    const current = [...path, node];
    if (node.slug === targetSlug) return current;
    const kids = node.subcategories || node.children || [];
    if (kids.length > 0) {
      const found = findCategoryPath(kids, targetSlug, current);
      if (found) return found;
    }
  }
  return null;
}

const CategoryPage = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const { categories } = useCategories();
  const getCatName = (cat) => cat ? (language === 'bn' && cat.nameBn ? cat.nameBn : cat.name) : '';
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadCategoryData();
  }, [slug]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const categoryData = await categoryService.getBySlug(slug);
      const category = categoryData.category || categoryData;

      if (!category || !category.name) {
        setCategory(null);
        setLoading(false);
        return;
      }

      setCategory(category);
      setSubcategories(categoryData.subcategories || []);

      const productsData = await productService.getAll({ category: slug, limit: 100 });
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error loading category:', error);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  // Full ancestor path from root → current category (for breadcrumb)
  const categoryPath = useMemo(() => {
    if (!slug || !categories?.length) return [];
    return findCategoryPath(categories, slug) || [];
  }, [categories, slug]);

  // Apply sort + price filter client-side
  const displayedProducts = useMemo(() => {
    let list = [...products];

    const min = filters.minPrice !== '' ? parseFloat(filters.minPrice) : null;
    const max = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : null;
    if (min !== null) list = list.filter(p => (p.salePrice ?? p.regularPrice ?? p.price ?? 0) >= min);
    if (max !== null) list = list.filter(p => (p.salePrice ?? p.regularPrice ?? p.price ?? 0) <= max);

    switch (filters.sort) {
      case 'price-low':
        list.sort((a, b) => (a.salePrice ?? a.regularPrice ?? a.price ?? 0) - (b.salePrice ?? b.regularPrice ?? b.price ?? 0));
        break;
      case 'price-high':
        list.sort((a, b) => (b.salePrice ?? b.regularPrice ?? b.price ?? 0) - (a.salePrice ?? a.regularPrice ?? a.price ?? 0));
        break;
      case 'name':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return list;
  }, [products, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Link to="/" className="text-primary hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="hover:text-primary shrink-0">
              {language === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link to="/categories" className="hover:text-primary shrink-0">
              {language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}
            </Link>
            {categoryPath.map((cat, i) => (
              <React.Fragment key={cat._id || cat.slug}>
                <ChevronRight className="w-4 h-4 shrink-0" />
                {i === categoryPath.length - 1 ? (
                  <span className="font-medium text-foreground">{getCatName(cat)}</span>
                ) : (
                  <Link to={`/category/${cat.slug}`} className="hover:text-primary shrink-0">
                    {getCatName(cat)}
                  </Link>
                )}
              </React.Fragment>
            ))}
            {/* Fallback: if context tree hasn't loaded yet, show current category name */}
            {categoryPath.length === 0 && category && (
              <>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="font-medium text-foreground">{getCatName(category)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Banner */}
      {category.banner && (
        <div className="w-full h-40 md:h-56 overflow-hidden">
          <img
            src={getImageUrl(category.banner)}
            alt={`${category.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Two-column layout: sidebar tree + main content */}
        <div className="flex gap-6 items-start">

          {/* ── Sidebar: full category tree ── */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-4">
            <CategoryTree
              categories={categories}
              activeSlug={slug}
              title={language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}
            />
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              {category.image && (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="w-16 h-16 rounded-xl object-contain border border-border bg-card p-1"
                />
              )}
              {!category.image && category.icon && (
                <div className="w-16 h-16 rounded-xl border border-border bg-card flex items-center justify-center">
                  <CategoryIcon icon={category.icon} image={category.image} name={category.name} className="w-10 h-10" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{getCatName(category)}</h1>
                {category.description && (
                  <p className="text-muted-foreground mt-1">{category.description}</p>
                )}
              </div>
            </div>

            {/* Subcategories grid */}
            {subcategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">
                  {language === 'bn' ? 'সাব-ক্যাটাগরি' : 'Shop by Category'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {subcategories.map((subcat) => (
                    <Link key={subcat._id} to={`/category/${subcat.slug}`} className="group">
                      <div className="bg-card rounded-lg p-4 text-center hover:shadow-lg transition-shadow border border-border">
                        <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center overflow-hidden rounded-lg">
                          <CategoryIcon icon={subcat.icon} image={subcat.image} name={subcat.name} className="w-10 h-10" />
                        </div>
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {getCatName(subcat)}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Toolbar */}
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                {language === 'bn' ? 'পণ্যসমূহ' : 'Products'}
                {displayedProducts.length > 0 && (
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    ({displayedProducts.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Price range */}
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">৳</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                    className="w-20 px-2 py-1.5 border border-border rounded-md bg-background text-sm"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    className="w-20 px-2 py-1.5 border border-border rounded-md bg-background text-sm"
                  />
                </div>
                {/* Sort */}
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
                  className="px-3 py-1.5 border border-border rounded-md bg-background text-sm"
                >
                  <option value="newest">
                    {language === 'bn' ? 'নতুন আগে' : 'Newest First'}
                  </option>
                  <option value="name">
                    {language === 'bn' ? 'নাম A–Z' : 'Name A–Z'}
                  </option>
                  <option value="price-low">
                    {language === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}
                  </option>
                  <option value="price-high">
                    {language === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}
                  </option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No Products Found'}
                </h3>
                <p className="text-muted-foreground">
                  {filters.minPrice || filters.maxPrice
                    ? (language === 'bn' ? 'মূল্য সীমা পরিবর্তন করে চেষ্টা করুন' : 'Try adjusting your price range')
                    : (language === 'bn' ? 'এই ক্যাটাগরিতে শীঘ্রই পণ্য আসবে' : 'Check back later for new products in this category')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
