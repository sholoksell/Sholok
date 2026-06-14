import React from 'react';
import { ShoppingBag, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const EmptyCart = ({ onClose }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
      <ShoppingBag className="h-12 w-12 text-gray-400" />
    </div>
    <div className="space-y-2">
      <h3 className="font-bold text-xl text-gray-900">Your cart is empty</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Looks like you haven't added anything to your cart yet. Start shopping now!
      </p>
    </div>
    <Button
      onClick={onClose}
      className="bg-[#E31E24] hover:bg-[#b9151a] text-white font-semibold px-8"
    >
      Start Shopping
    </Button>
  </div>
);

export const EmptySearch = ({ searchQuery }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
      <Search className="h-12 w-12 text-gray-400" />
    </div>
    <div className="space-y-2">
      <h3 className="font-bold text-xl text-gray-900">No results found</h3>
      <p className="text-gray-500 text-sm max-w-md">
        {searchQuery
          ? `We couldn't find any products matching "${searchQuery}". Try different keywords or browse our categories.`
          : 'Try searching for something else or browse our categories.'}
      </p>
    </div>
    <Link to="/">
      <Button className="bg-[#E31E24] hover:bg-[#b9151a] text-white font-semibold px-8">
        Browse Categories
      </Button>
    </Link>
  </div>
);

export const EmptyOrders = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
      <Package className="h-12 w-12 text-gray-400" />
    </div>
    <div className="space-y-2">
      <h3 className="font-bold text-xl text-gray-900">No orders yet</h3>
      <p className="text-gray-500 text-sm max-w-md">
        You haven't placed any orders yet. Start shopping and your orders will appear here.
      </p>
    </div>
    <Link to="/">
      <Button className="bg-[#E31E24] hover:bg-[#b9151a] text-white font-semibold px-8">
        Start Shopping
      </Button>
    </Link>
  </div>
);

export const LoadingSpinner = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-[#E31E24] rounded-full animate-spin`}
      />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3 mt-3" />
      <div className="h-10 bg-gray-200 rounded mt-3" />
    </div>
  </div>
);
