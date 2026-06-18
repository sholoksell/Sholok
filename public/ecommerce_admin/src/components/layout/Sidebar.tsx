import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Settings,
  LogOut,
  ShoppingBag,
  ChevronDown,
  Truck,
  BarChart3,
  Megaphone,
  Star,
  Home,
  Languages,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: FolderTree, key: 'categories', label: 'Categories', path: '/categories' },
  { icon: Package, key: 'products', label: 'Products', path: '/products' },
  { icon: Users, key: 'customers', label: 'Customers', path: '/customers' },
  { icon: ShoppingCart, key: 'orders', label: 'Orders', path: '/orders' },
  { icon: CreditCard, key: 'payments', label: 'Payments', path: '/payments' },
  { icon: Truck, key: 'shipping', label: 'Shipping', path: '/shipping' },
  { icon: BarChart3, key: 'reports', label: 'Reports', path: '/reports' },
  { icon: Megaphone, key: 'marketing', label: 'Marketing', path: '/marketing' },
  { icon: Star, key: 'reviews', label: 'Reviews', path: '/reviews' },
  { icon: Settings, key: 'settings', label: 'Settings', path: '/settings' },
  { icon: Home, key: 'homePageProduct', label: 'Home Page Product', path: '/home-page-product' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sidebar-foreground">Sholok Admin</h1>
              <p className="text-xs text-muted-foreground">{t('adminPanel')}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1 mt-3">
            <button
              onClick={() => setLanguage('bn')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                language === 'bn' ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent"
              )}
            >
              <Languages className="w-3.5 h-3.5" /> বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                language === 'en' ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent"
              )}
            >
              <Languages className="w-3.5 h-3.5" /> EN
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{t(item.key)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 mb-3",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {admin?.name?.charAt(0) || 'A'}
            </span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="font-medium text-sidebar-foreground truncate">{admin?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">{t('logout')}</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
      >
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-300",
          collapsed ? "-rotate-90" : "rotate-90"
        )} />
      </button>
    </aside>
  );
}
