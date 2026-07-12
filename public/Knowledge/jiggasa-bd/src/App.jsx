import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import { QuestionCardSkeleton } from './components/common/LoadingSkeleton';
import './index.css';

// Lazy Pages
const Home = lazy(() => import('./pages/Home'));
const Questions = lazy(() => import('./pages/Questions'));
const QuestionDetail = lazy(() => import('./pages/QuestionDetail'));
const AskQuestion = lazy(() => import('./pages/AskQuestion'));
const Categories = lazy(() => import('./pages/Categories'));
const Search = lazy(() => import('./pages/Search'));
const Experts = lazy(() => import('./pages/Experts'));
const Popular = lazy(() => import('./pages/Popular'));
const Profile = lazy(() => import('./pages/Profile'));
const MyCollection = lazy(() => import('./pages/MyCollection'));

const PageFallback = () => (
  <div className="max-w-4xl mx-auto px-4 pt-28 space-y-4">
    {[...Array(4)].map((_, i) => <QuestionCardSkeleton key={i} />)}
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<Questions />} />
            <Route path="/search" element={<Search />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/collection" element={<MyCollection />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="text-center px-4">
        <div className="text-7xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">৪০৪</div>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3">পাতাটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">আপনি যে পাতায় যেতে চাইছেন সেটি নেই</p>
        <a href="/qna" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
          হোমে ফিরুন
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/qna">
      <AppProvider>
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          <main className="w-full">
            <AnimatedRoutes />
          </main>
          <Footer />
          <Toast />

          {/* Floating Ask Button (Mobile) */}
          <a
            href="/qna/ask"
            className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold z-40 transition-colors sm:hidden"
            aria-label="প্রশ্ন করুন"
          >
            +
          </a>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
