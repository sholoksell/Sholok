import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white p-3 rounded border border-transparent">
    <div className="skeleton-box w-full aspect-square rounded mb-3" />
    <div className="skeleton-box h-3 w-3/4 rounded mb-2" />
    <div className="skeleton-box h-3 w-1/2 rounded mb-2" />
    <div className="skeleton-box h-4 w-1/3 rounded mb-2" />
    <div className="skeleton-box h-3 w-2/3 rounded mb-3" />
    <div className="skeleton-box h-7 w-full rounded" />
  </div>
);

export const SectionSkeleton = ({ count = 6 }) => (
  <div className="bg-white p-4 rounded shadow-amazon">
    <div className="skeleton-box h-6 w-48 rounded mb-4" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
    <div className="skeleton-box aspect-square rounded" />
    <div className="space-y-3">
      <div className="skeleton-box h-6 w-full rounded" />
      <div className="skeleton-box h-4 w-3/4 rounded" />
      <div className="skeleton-box h-4 w-1/2 rounded" />
      <div className="skeleton-box h-8 w-1/3 rounded" />
    </div>
    <div className="skeleton-box h-64 rounded" />
  </div>
);

export default ProductCardSkeleton;
