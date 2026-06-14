import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/productService';
import { bannerService } from '@/services/commonService';
import { categoryService } from '@/services/categoryService';

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bannersData, categoriesData, featured, dealsData, newArrivalsData] = 
        await Promise.all([
          bannerService.getAll({ position: 'hero' }),
          categoryService.getAll({ featured: 'true' }),
          productService.getFeatured(),
          productService.getDeals(),
          productService.getNewArrivals(),
        ]);

      setBanners(bannersData);
      setCategories(categoriesData);
      setFeaturedProducts(featured);
      setDeals(dealsData);
      setNewArrivals(newArrivalsData);
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banners */}
      {banners.length > 0 && (
        <section className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Fresh Groceries Delivered to Your Doorstep
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Shop from a wide range of products at the best prices
                </p>
                <Button size="lg" asChild>
                  <Link to="/categories">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <img
                  src={banners[0].image || '/hero-banner.jpg'}
                  alt="Hero Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
            <Button variant="ghost" asChild>
              <Link to="/categories">
                View All <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category._id}
                to={`/categories/${category.slug}`}
                className="group"
              >
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl">{category.icon || '📦'}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Deals */}
      {deals.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Today's Deals</h2>
            <Button variant="ghost" asChild>
              <Link to="/deals">
                View All <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {deals.slice(0, 10).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredProducts.slice(0, 10).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
              <Button variant="ghost" asChild>
                <Link to="/new-arrivals">
                  View All <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {newArrivals.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
