import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { LibraryProvider } from './context/LibraryContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingButton from './components/FloatingButton';

import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import ReadingPage from './pages/ReadingPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import NovelsPage from './pages/NovelsPage';
import NovelDetailPage from './pages/NovelDetailPage';
import SearchPage from './pages/SearchPage';
import RankingsPage from './pages/RankingsPage';
import LibraryPage from './pages/LibraryPage';
import OffersPage from './pages/OffersPage';
import AuthorsPage from './pages/AuthorsPage';
import AuthorDetailPage from './pages/AuthorDetailPage';
import PublisherDetailPage from './pages/PublisherDetailPage';
import NewReleasesPage from './pages/NewReleasesPage';
import NotFoundPage from './pages/NotFoundPage';

function AnimatedRoutes() {
  const location = useLocation();
  const isReadingPage = location.pathname.startsWith('/read/');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        {!isReadingPage && <Navbar />}
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:id" element={<BookDetailsPage />} />
          <Route path="/read/:id" element={<ReadingPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/novels" element={<NovelsPage />} />
          <Route path="/novels/:id" element={<NovelDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/authors" element={<AuthorsPage />} />
          <Route path="/authors/:id" element={<AuthorDetailPage />} />
          <Route path="/publishers/:id" element={<PublisherDetailPage />} />
          <Route path="/new-releases" element={<NewReleasesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {!isReadingPage && <Footer />}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <ToastProvider>
          <BrowserRouter basename="/series">
            <AnimatedRoutes />
            <FloatingButton />
          </BrowserRouter>
        </ToastProvider>
      </LibraryProvider>
    </ThemeProvider>
  );
}

export default App;
