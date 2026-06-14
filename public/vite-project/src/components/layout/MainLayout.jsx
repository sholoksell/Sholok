import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import MobileBottomNav from './MobileBottomNav';
import { autoDetectDeliveryLocation } from '@/hooks/useDeliveryLocation';

const MainLayout = () => {
  useEffect(() => {
    // Auto-detect delivery location (Bangladesh) on first load if user
    // has not selected one. Silent — uses browser geolocation, falls back to IP.
    autoDetectDeliveryLocation();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
