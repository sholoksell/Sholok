import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Shopping redirect component - redirects to sub-app at /shopping/
const ShoppingRedirect = () => {
  window.location.replace('/shopping/');
  return null;
};

// Blog redirect component - redirects to Blog sub-app at /blog/
const BlogRedirect = () => {
  window.location.replace('/blog/');
  return null;
};

// News redirect component - redirects to News sub-app at /news/
const NewsRedirect = () => {
  window.location.replace('/news/');
  return null;
};

// Smart Store redirect component
const SmartStoreRedirect = () => {
  window.location.replace('/smart-store/');
  return null;
};

// Lazy load other pages for better performance
const SearchResults = lazy(() => import("./pages/SearchResults"));
const News = lazy(() => import("./pages/News"));
const QnA = lazy(() => import("./pages/QnA"));
const Blog = lazy(() => import("./pages/Blog"));
const Media = lazy(() => import("./pages/Media"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Maps = lazy(() => import("./pages/Maps"));
const Translate = lazy(() => import("./pages/Translate"));
const Health = lazy(() => import("./pages/Health"));

// New pages
const Mail = lazy(() => import("./pages/Mail"));
const Cafe = lazy(() => import("./pages/Cafe"));
const SmartStore = lazy(() => import("./pages/SmartStore"));
const Pay = lazy(() => import("./pages/Pay"));
const Webtoon = lazy(() => import("./pages/Webtoon"));
const Series = lazy(() => import("./pages/Series"));
const TV = lazy(() => import("./pages/TV"));
const Music = lazy(() => import("./pages/Music"));
const Dictionary = lazy(() => import("./pages/Dictionary"));
const Finance = lazy(() => import("./pages/Finance"));
const Sports = lazy(() => import("./pages/Sports"));
const Weather = lazy(() => import("./pages/Weather"));
const RealEstate = lazy(() => import("./pages/RealEstate"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="portal-ui-theme">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Index />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Public Routes */}
                <Route path="/news" element={<NewsRedirect />} />
                <Route path="/news/*" element={<NewsRedirect />} />
                <Route path="/shopping" element={<ShoppingRedirect />} />
                <Route path="/shopping/*" element={<ShoppingRedirect />} />
                <Route path="/qna" element={<QnA />} />
                <Route path="/blog" element={<BlogRedirect />} />
                <Route path="/blog/*" element={<BlogRedirect />} />
                <Route path="/media" element={<Media />} />
                <Route path="/maps" element={<Maps />} />
                <Route path="/translate" element={<Translate />} />
                <Route path="/health" element={<Health />} />
                <Route path="/webtoon" element={<Webtoon />} />
                <Route path="/series" element={<Series />} />
                <Route path="/tv" element={<TV />} />
                <Route path="/music" element={<Music />} />
                <Route path="/dictionary" element={<Dictionary />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/realestate" element={<RealEstate />} />

                {/* Protected Routes */}
                <Route path="/mail" element={<Mail />} />
                <Route path="/cafe" element={<Cafe />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/smartstore" element={<SmartStoreRedirect />} />
                <Route path="/smartstore/*" element={<SmartStoreRedirect />} />
                <Route path="/pay" element={<ProtectedRoute><Pay /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
</Provider>
);

export default App;
