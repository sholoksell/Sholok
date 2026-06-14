import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";

// Core pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";
import AnalyticsPage from "./pages/AnalyticsPage";
import PortalModulesPage from "./pages/PortalModulesPage";
import AIInsightsPage from "./pages/AIInsightsPage";

// Products
import ProductsPage from "./pages/ProductsPage";
import ProductCategoriesPage from "./pages/ProductCategoriesPage";
import ProductApprovalsPage from "./pages/ProductApprovalsPage";
import InventoryPage from "./pages/InventoryPage";

// Orders
import OrdersPage from "./pages/OrdersPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnsRefundsPage from "./pages/ReturnsRefundsPage";

// Vendors
import VendorApplicationsPage from "./pages/VendorApplicationsPage";
import KYCVerificationPage from "./pages/KYCVerificationPage";
import VendorPerformancePage from "./pages/VendorPerformancePage";

// Payments
import TransactionsPage from "./pages/TransactionsPage";
import CommissionPage from "./pages/CommissionPage";
import PayoutsPage from "./pages/PayoutsPage";
import SettlementPage from "./pages/SettlementPage";

// Marketing
import CampaignsPage from "./pages/CampaignsPage";
import CouponsPage from "./pages/CouponsPage";
import BannersPage from "./pages/BannersPage";

// Portal
import PortalNewsPage from "./pages/PortalNewsPage";
import PortalBlogPage from "./pages/PortalBlogPage";

// Security
import ActivityLogsPage from "./pages/ActivityLogsPage";
import PlatformRulesPage from "./pages/PlatformRulesPage";
import FraudDetectionPage from "./pages/FraudDetectionPage";

// Settings
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LoginPage onLogin={() => setIsAuthenticated(true)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminLayout>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<DashboardPage />} />

              {/* Users */}
              <Route path="/users" element={<UsersPage />} />

              {/* Vendors */}
              <Route path="/vendors/applications" element={<VendorApplicationsPage />} />
              <Route path="/vendors/kyc" element={<KYCVerificationPage />} />
              <Route path="/vendors/performance" element={<VendorPerformancePage />} />

              {/* Products */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/categories" element={<ProductCategoriesPage />} />
              <Route path="/products/approvals" element={<ProductApprovalsPage />} />
              <Route path="/products/inventory" element={<InventoryPage />} />

              {/* Orders */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/shipping" element={<ShippingPage />} />
              <Route path="/orders/returns" element={<ReturnsRefundsPage />} />

              {/* Payments */}
              <Route path="/payments/transactions" element={<TransactionsPage />} />
              <Route path="/payments/commission" element={<CommissionPage />} />
              <Route path="/payments/payouts" element={<PayoutsPage />} />
              <Route path="/payments/settlement" element={<SettlementPage />} />

              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Marketing */}
              <Route path="/marketing/campaigns" element={<CampaignsPage />} />
              <Route path="/marketing/coupons" element={<CouponsPage />} />
              <Route path="/marketing/banners" element={<BannersPage />} />

              {/* Portal */}
              <Route path="/portal/modules" element={<PortalModulesPage />} />
              <Route path="/portal/news" element={<PortalNewsPage />} />
              <Route path="/portal/blog" element={<PortalBlogPage />} />

              {/* AI */}
              <Route path="/ai" element={<AIInsightsPage />} />

              {/* Security */}
              <Route path="/security/logs" element={<ActivityLogsPage />} />
              <Route path="/security/fraud" element={<FraudDetectionPage />} />
              <Route path="/security/rules" element={<PlatformRulesPage />} />

              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
