import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Tag, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

function BrandCard({ brand }) {
  return (
    <Link to={`/brands/${brand.slug || brand._id}`}
      className="group bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center hover:shadow-md hover:border-primary/30 transition-all duration-200">
      {brand.logo ? (
        <img src={brand.logo} alt={brand.name}
          className="h-16 w-auto object-contain mb-3 group-hover:scale-105 transition-transform duration-200"
          onError={e => { e.target.style.display = 'none'; }} />
      ) : (
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-2xl font-bold text-gray-400">
          {brand.name.charAt(0)}
        </div>
      )}
      <h3 className="font-semibold text-gray-800 text-sm text-center group-hover:text-primary transition-colors">{brand.name}</h3>
      {brand.productCount > 0 && (
        <span className="text-xs text-gray-400 mt-1">{brand.productCount} products</span>
      )}
    </Link>
  );
}

function BrandDetail({ slug }) {
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/brands/${slug}`),
      api.get('/products', { params: { brand: slug, status: 'active', limit: 60 } }).catch(() => ({ data: { products: [] } })),
    ])
      .then(([brandR, prodR]) => {
        setBrand(brandR.data);
        setProducts(prodR.data?.products || []);
      })
      .catch(() => setBrand(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!brand) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Brand not found.</p>
      <Link to="/brands" className="text-primary hover:underline mt-4 block">← All Brands</Link>
    </div>
  );

  return (
    <div className="min-h-screen">
      {brand.banner && (
        <div className="h-52 overflow-hidden">
          <img src={brand.banner} alt={brand.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <Link to="/brands" className="flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft size={14} /> All Brands
        </Link>
        <div className="flex items-center gap-4 mb-8">
          {brand.logo && (
            <img src={brand.logo} alt={brand.name} className="h-16 w-auto object-contain" onError={e => { e.target.style.display = 'none'; }} />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{brand.name}</h1>
            {brand.description && <p className="text-gray-500 mt-1 text-sm">{brand.description}</p>}
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-primary" /> Products ({products.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map(p => {
                const price = Number(p.sale_price || p.regular_price);
                const original = Number(p.regular_price);
                const pct = p.on_sale && original > price ? Math.round((1 - price / original) * 100) : 0;
                return (
                  <Link key={p.id} to={`/product/${p.slug}`}
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <img src={p.thumbnail || '/placeholder.png'} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.src = '/placeholder.png'; }} />
                      {pct > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">-{pct}%</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-sm font-bold text-gray-900">৳{price.toLocaleString()}</span>
                        {pct > 0 && <span className="text-xs text-gray-400 line-through">৳{original.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-gray-500 py-12 text-center">No products found for this brand.</p>
        )}
      </div>
    </div>
  );
}

export default function BrandsPage() {
  const { slug } = useParams();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      api.get('/brands', { params: { active: '1', limit: 100 } })
        .then(r => setBrands(r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug]);

  if (slug) return <BrandDetail slug={slug} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">🏪 Our Brands</h1>
          <p className="text-gray-500">Explore top brands available on Sholok</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : brands.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No brands available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map(b => <BrandCard key={b._id} brand={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
