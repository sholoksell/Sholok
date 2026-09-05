import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VendorAuthProvider } from "@/contexts/VendorAuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import VendorLayout from "@/components/layout/VendorLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Orders from "@/pages/Orders";
import Payments from "@/pages/Payments";
import Shipping from "@/pages/Shipping";
import Reports from "@/pages/Reports";
import Marketing from "@/pages/Marketing";
import Reviews from "@/pages/Reviews";
import Settings from "@/pages/Settings";
import HomePageProduct from "@/pages/HomePageProduct";
import Vendors from "@/pages/Vendors";
import Warehouses from "@/pages/Warehouses";
import Couriers from "@/pages/Couriers";
import DeliveryCoverage from "@/pages/DeliveryCoverage";
import GrocerySettings from "@/pages/GrocerySettings";
import Shipments from "@/pages/Shipments";
import CodSettlement from "@/pages/CodSettlement";
import Brands from "@/pages/Brands";
import Returns from "@/pages/Returns";
import SearchAnalytics from "@/pages/SearchAnalytics";
import LiveSessions from "@/pages/LiveSessions";
import VendorReviews from "@/pages/VendorReviews";
import Campaigns from "@/pages/Campaigns";
import MegaMenuFeatures from "@/pages/MegaMenuFeatures";
import NotFound from "@/pages/NotFound";

// Vendor Panel Pages
import VendorLogin from "@/pages/vendor/VendorLogin";
import VendorRegister from "@/pages/vendor/VendorRegister";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorProducts from "@/pages/vendor/VendorProducts";
import VendorOrders from "@/pages/vendor/VendorOrders";
import VendorShipments from "@/pages/vendor/VendorShipments";
import VendorReturns from "@/pages/vendor/VendorReturns";
import VendorInventory from "@/pages/vendor/VendorInventory";
import VendorWallet from "@/pages/vendor/VendorWallet";
import VendorStore from "@/pages/vendor/VendorStore";
import VendorSettings from "@/pages/vendor/VendorSettings";
import VendorLiveSessions from "@/pages/vendor/VendorLiveSessions";
import VendorReviewsPanel from "@/pages/vendor/VendorReviews";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VendorAuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Admin auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin panel */}
                <Route element={<AdminLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/marketing" element={<Marketing />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/home-page-product" element={<HomePageProduct />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/warehouses" element={<Warehouses />} />
                  <Route path="/couriers" element={<Couriers />} />
                  <Route path="/delivery-coverage" element={<DeliveryCoverage />} />
                  <Route path="/grocery-settings" element={<GrocerySettings />} />
                  <Route path="/shipments" element={<Shipments />} />
                  <Route path="/cod-settlement" element={<CodSettlement />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/returns" element={<Returns />} />
                  <Route path="/search-analytics" element={<SearchAnalytics />} />
                  <Route path="/live-sessions" element={<LiveSessions />} />
                  <Route path="/vendor-reviews" element={<VendorReviews />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/megamenu-features" element={<MegaMenuFeatures />} />
                </Route>

                {/* Vendor Panel — public auth routes */}
                <Route path="/vendor/login" element={<VendorLogin />} />
                <Route path="/vendor/register" element={<VendorRegister />} />

                {/* Vendor Panel — protected routes */}
                <Route path="/vendor/dashboard" element={<VendorLayout><VendorDashboard /></VendorLayout>} />
                <Route path="/vendor/products" element={<VendorLayout><VendorProducts /></VendorLayout>} />
                <Route path="/vendor/orders" element={<VendorLayout><VendorOrders /></VendorLayout>} />
                <Route path="/vendor/shipments" element={<VendorLayout><VendorShipments /></VendorLayout>} />
                <Route path="/vendor/returns" element={<VendorLayout><VendorReturns /></VendorLayout>} />
                <Route path="/vendor/inventory" element={<VendorLayout><VendorInventory /></VendorLayout>} />
                <Route path="/vendor/wallet" element={<VendorLayout><VendorWallet /></VendorLayout>} />
                <Route path="/vendor/store" element={<VendorLayout><VendorStore /></VendorLayout>} />
                <Route path="/vendor/settings" element={<VendorLayout><VendorSettings /></VendorLayout>} />
                <Route path="/vendor/live-sessions" element={<VendorLayout><VendorLiveSessions /></VendorLayout>} />
                <Route path="/vendor/reviews" element={<VendorLayout><VendorReviewsPanel /></VendorLayout>} />
                <Route path="/vendor" element={<Navigate to="/vendor/login" replace />} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </VendorAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
