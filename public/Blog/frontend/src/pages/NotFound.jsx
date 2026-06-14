import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 - Page Not Found - Sholok Blog</title></Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <div className="text-[10rem] font-heading font-black leading-none gradient-text select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce">😕</div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3">
            Oops! Page not found
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Don't worry, you can find plenty of great content on our blog!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
              <FiHome className="w-4 h-4" /> Back to Home
            </Link>
            <Link to="/search" className="btn-outline flex items-center gap-2 w-full sm:w-auto justify-center">
              <FiSearch className="w-4 h-4" /> Search Posts
            </Link>
          </div>

          {/* Decorative circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent-500/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </>
  );
}
