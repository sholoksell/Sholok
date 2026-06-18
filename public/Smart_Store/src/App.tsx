import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/store/cartContext";
import { QuickViewProvider } from "@/store/quickViewContext";
import { ThemeProvider } from "@/store/themeContext";
import { AuthProvider } from "@/store/authContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Layout from "@/components/Layout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import StorePage from "./pages/Store.tsx";
import ProductPage from "./pages/Product.tsx";
import SearchPage from "./pages/Search.tsx";
import CheckoutPage from "./pages/Checkout.tsx";
import AccountPage from "./pages/Account.tsx";
import SellerPage from "./pages/Seller.tsx";
import AdminPage from "./pages/Admin.tsx";
import LivePage from "./pages/Live.tsx";
import LoginPage from "./pages/Login.tsx";
import RegisterPage from "./pages/Register.tsx";
import GroupBuyPage from "./pages/GroupBuy.tsx";
import StoreCustomizePage from "./pages/StoreCustomize.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/smart-store">
          <AuthProvider>
            <CartProvider>
              <QuickViewProvider>
                <Routes>
                  <Route path="/"            element={<Layout><Index /></Layout>} />
                  <Route path="/login"       element={<Layout><LoginPage /></Layout>} />
                  <Route path="/register"    element={<Layout><RegisterPage /></Layout>} />
                  <Route path="/store/:id"   element={<Layout><StorePage /></Layout>} />
                  <Route path="/product/:id" element={<Layout><ProductPage /></Layout>} />
                  <Route path="/search"      element={<Layout><SearchPage /></Layout>} />
                  <Route path="/group-buy"   element={<Layout><GroupBuyPage /></Layout>} />
                  <Route path="/live"        element={<Layout><LivePage /></Layout>} />

                  <Route path="/checkout" element={
                    <ProtectedRoute><Layout hideFooter><CheckoutPage /></Layout></ProtectedRoute>
                  } />
                  <Route path="/account" element={
                    <ProtectedRoute><Layout><AccountPage /></Layout></ProtectedRoute>
                  } />
                  <Route path="/seller" element={
                    <ProtectedRoute roles={["seller", "admin"]}><Layout hideFooter><SellerPage /></Layout></ProtectedRoute>
                  } />
                  <Route path="/seller/customize" element={
                    <ProtectedRoute roles={["seller", "admin"]}><Layout><StoreCustomizePage /></Layout></ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute roles={["admin"]}><Layout hideFooter><AdminPage /></Layout></ProtectedRoute>
                  } />

                  <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
              </QuickViewProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
