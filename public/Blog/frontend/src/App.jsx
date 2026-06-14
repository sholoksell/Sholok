import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import WritePost from './pages/WritePost';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import Timeline from './pages/Timeline';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import NotFound from './pages/NotFound';
import ShortClips from './pages/ShortClips';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/clips" element={<ShortClips />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/write" element={<ProtectedRoute><WritePost /></ProtectedRoute>} />
        <Route path="/write/:id" element={<ProtectedRoute><WritePost /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/blog">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
