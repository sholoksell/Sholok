import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../context/LanguageContext';
import { FiHome, FiFileText, FiUsers, FiTag, FiBarChart2, FiLogOut, FiMenu, FiX, FiGlobe } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { to: '/', icon: FiHome, label: t('dashboard'), end: true },
    { to: '/posts', icon: FiFileText, label: t('posts') },
    { to: '/users', icon: FiUsers, label: t('users') },
    { to: '/categories', icon: FiTag, label: t('categories') },
    { to: '/analytics', icon: FiBarChart2, label: t('analytics') },
  ];

  const handleLogout = () => {
    logout();
    toast.success(t('loggedOut'));
    navigate('/login');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-xs">SB</div>
          <div>
            <p className="font-heading font-bold text-primary-600 text-sm">Sholok Blog</p>
            <p className="text-xs text-gray-400">{t('adminPanel')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
            onClick={() => setSidebarOpen(false)}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Admin')}&background=6941ff&color=fff`}
            alt="" className="w-9 h-9 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button onClick={toggleLanguage} title="Language"
            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 transition flex items-center gap-1 text-xs font-semibold">
            <FiGlobe className="w-4 h-4" /> {language === 'bn' ? 'বাং' : 'EN'}
          </button>
          <button onClick={handleLogout} title={t('logout')}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <FiMenu className="w-5 h-5" />
          </button>
          <p className="font-heading font-bold text-primary-600">Sholok Blog Admin</p>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
