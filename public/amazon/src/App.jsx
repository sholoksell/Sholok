import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { ToastProvider } from './context/ToastContext';
import TopNavbar from './components/Navbar/TopNavbar';
import SecondaryNavbar from './components/Navbar/SecondaryNavbar';
import Footer from './components/Footer/Footer';
import Toast from './components/common/Toast';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <BrowserRouter>
    <SearchProvider>
      <CartProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-amazon-bg">
            <TopNavbar />
            <SecondaryNavbar />
            <div className="flex-1">
              <AppRoutes />
            </div>
            <Footer />
            <Toast />
          </div>
        </ToastProvider>
      </CartProvider>
    </SearchProvider>
  </BrowserRouter>
);

export default App;
