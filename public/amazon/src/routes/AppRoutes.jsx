import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage           from '../pages/HomePage';
import ProductDetailPage  from '../pages/ProductDetailPage';
import SearchResultsPage  from '../pages/SearchResultsPage';
import CartPage           from '../pages/CartPage';
import LoginPage          from '../pages/LoginPage';

const SpinnerFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="spinner" />
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<SpinnerFallback />}>
    <Routes>
      <Route path="/"              element={<HomePage />} />
      <Route path="/product/:id"   element={<ProductDetailPage />} />
      <Route path="/search"        element={<SearchResultsPage />} />
      <Route path="/cart"          element={<CartPage />} />
      <Route path="/login"         element={<LoginPage />} />
      {/* catch-all */}
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <p className="text-5xl font-bold text-amazon-dark mb-3">404</p>
            <p className="text-xl text-amazon-text-gray mb-6">Page not found</p>
            <a href="/" className="amazon-btn px-8">Back to Home</a>
          </div>
        }
      />
    </Routes>
  </Suspense>
);

export default AppRoutes;
