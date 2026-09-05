import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

// Lazy load pages for better performance and code splitting
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AllCategoriesPage = lazy(() => import('./pages/AllCategoriesPage'));
const VendorStorePage = lazy(() => import('./pages/VendorStorePage'));
const VendorApplyPage = lazy(() => import('./pages/VendorApplyPage'));
const VendorLoginPage = lazy(() => import('./pages/VendorLoginPage'));
const FlashSalePage = lazy(() => import('./pages/FlashSalePage'));
const DiscoveryFeedPage = lazy(() => import('./pages/DiscoveryFeedPage'));
const PersonalizedDealsPage = lazy(() => import('./pages/PersonalizedDealsPage'));
const LiveShopPage = lazy(() => import('./pages/LiveShopPage'));
const BundleOffersPage = lazy(() => import('./pages/BundleOffersPage'));
const SummerFestPage = lazy(() => import('./pages/SummerFestPage'));
const BuySavePage = lazy(() => import('./pages/BuySavePage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));

// Optimized loading component with animation
const LoadingFallback = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center bg-white z-50"
  >
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
    />
  </motion.div>
);

function App() {
  try {
    return (
      <AuthProvider>
        <LanguageProvider>
          <CategoryProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="search" element={<SearchPage />} />
                      <Route path="category/:slug" element={<CategoryPage />} />
                      <Route path="product/:slug" element={<ProductPage />} />
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="account" element={<AccountPage />} />
                      <Route path="track-order" element={<TrackOrderPage />} />
                      <Route path="offers" element={<OffersPage />} />
                      <Route path="help" element={<HelpPage />} />
                      <Route path="categories" element={<AllCategoriesPage />} />
                      <Route path="store/:slug" element={<VendorStorePage />} />
                      <Route path="vendor/apply" element={<VendorApplyPage />} />
                      <Route path="vendor/login" element={<VendorLoginPage />} />
                      <Route path="flash-sales" element={<FlashSalePage />} />
                      <Route path="discover" element={<DiscoveryFeedPage />} />
                      <Route path="deals" element={<PersonalizedDealsPage />} />
                      <Route path="live" element={<LiveShopPage />} />
                      <Route path="bundles" element={<BundleOffersPage />} />
                      <Route path="summer-fest" element={<SummerFestPage />} />
                      <Route path="buy-save" element={<BuySavePage />} />
                      <Route path="brands" element={<BrandsPage />} />
                      <Route path="brands/:slug" element={<BrandsPage />} />
                    </Route>
                </Routes>
              </Suspense>
              <Toaster position="top-right" richColors duration={3000} toastOptions={{ style: { zIndex: 99999 } }} />
            </BrowserRouter>
          </CategoryProvider>
        </LanguageProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('App Error:', error);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '50px', color: 'red', textAlign: 'center' }}
      >
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
      </motion.div>
    );
  }
}

export default App;
