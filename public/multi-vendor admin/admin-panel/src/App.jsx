import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout      from "./components/Layout";
import Login       from "./pages/Login";
import Dashboard   from "./pages/Dashboard";
import Users       from "./pages/Users";
import Stores      from "./pages/Stores";
import Products    from "./pages/Products";
import Orders      from "./pages/Orders";
import Categories  from "./pages/Categories";
import Analytics   from "./pages/Analytics";
import Settings    from "./pages/Settings";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index         element={<Dashboard />} />
        <Route path="users"       element={<Users />} />
        <Route path="stores"      element={<Stores />} />
        <Route path="products"    element={<Products />} />
        <Route path="orders"      element={<Orders />} />
        <Route path="categories"  element={<Categories />} />
        <Route path="analytics"   element={<Analytics />} />
        <Route path="settings"    element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
