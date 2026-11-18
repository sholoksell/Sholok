import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BreakingNewsTicker from './components/BreakingNewsTicker';
import HeroSection from './components/HeroSection';
import LatestNewsGrid from './components/LatestNewsGrid';
import MostReadSidebar from './components/MostReadSidebar';
import CategorySections from './components/CategorySections';
import Footer from './components/Footer';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import ScrollToTop from './components/ScrollToTop';

function HomePage() {
  return (
    <>
      <BreakingNewsTicker />
      <main>
        <HeroSection />
        <LatestNewsGrid sidebarSlot={<MostReadSidebar />} />
        <CategorySections />
      </main>
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
