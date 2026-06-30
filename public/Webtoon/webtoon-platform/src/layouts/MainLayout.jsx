import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import BackToTop from '../components/common/BackToTop';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isReader = location.pathname.startsWith('/read/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isReader && <Navbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {!isReader && <Footer />}
      <Toast />
      <BackToTop />
    </div>
  );
}
