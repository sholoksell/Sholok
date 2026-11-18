import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import api from './api';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewsList from './pages/NewsList';
import NewsForm from './pages/NewsForm';
import Categories from './pages/Categories';
import Authors from './pages/Authors';
import Media from './pages/Media';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#5D0096', fontSize:14 }}>Loading…</div>;
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('news_admin_token');
    if (!token) { setLoading(false); return; }
    api.me().then(u => setUser(u)).catch(() => localStorage.removeItem('news_admin_token')).finally(() => setLoading(false));
  }, []);

  const login = (u, token) => { localStorage.setItem('news_admin_token', token); setUser(u); };
  const logout = () => { localStorage.removeItem('news_admin_token'); setUser(null); };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><Layout><NewsList /></Layout></ProtectedRoute>} />
        <Route path="/news/create" element={<ProtectedRoute><Layout><NewsForm /></Layout></ProtectedRoute>} />
        <Route path="/news/:id/edit" element={<ProtectedRoute><Layout><NewsForm /></Layout></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Layout><Categories /></Layout></ProtectedRoute>} />
        <Route path="/authors" element={<ProtectedRoute><Layout><Authors /></Layout></ProtectedRoute>} />
        <Route path="/media" element={<ProtectedRoute><Layout><Media /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthCtx.Provider>
  );
}
