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
  Store,
  Warehouse,
  MapPin,
  Salad,
  PackageCheck,
  Wallet,
  Tag,
  ArrowLeftRight,
  TrendingUp,
  Video,
  Globe,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, labelKey: 'dashboard',       path: '/dashboard' },
    { icon: FolderTree,      labelKey: 'categories',      path: '/categories' },
    { icon: Package,         labelKey: 'products',         path: '/products' },
    { icon: Users,           labelKey: 'customers',        path: '/customers' },
    { icon: ShoppingCart,    labelKey: 'orders',           path: '/orders' },
    { icon: CreditCard,      labelKey: 'payments',         path: '/payments' },
    { icon: Truck,           labelKey: 'shipping',         path: '/shipping' },
    { icon: PackageCheck,    labelKey: 'shipments',        path: '/shipments' },
    { icon: Store,           labelKey: 'vendors',          path: '/vendors' },
    { icon: Warehouse,       labelKey: 'warehouses',       path: '/warehouses' },
    { icon: Truck,           labelKey: 'couriers',         path: '/couriers' },
    { icon: MapPin,          labelKey: 'deliveryCoverage', path: '/delivery-coverage' },
    { icon: Salad,           labelKey: 'grocerySettings',  path: '/grocery-settings' },
    { icon: Wallet,          labelKey: 'codSettlement',    path: '/cod-settlement' },
    { icon: Tag,             labelKey: 'brands',           path: '/brands' },
    { icon: ArrowLeftRight,  labelKey: 'returns',          path: '/returns' },
    { icon: BarChart3,       labelKey: 'reports',          path: '/reports' },
    { icon: Megaphone,       labelKey: 'marketing',        path: '/marketing' },
    { icon: TrendingUp,      labelKey: 'campaigns',        path: '/campaigns' },
    { icon: Star,            labelKey: 'reviews',          path: '/reviews' },
    { icon: TrendingUp,      labelKey: 'searchAnalytics',  path: '/search-analytics' },
    { icon: Video,           labelKey: 'liveSessions',     path: '/live-sessions' },
    { icon: Star,            labelKey: 'vendorReviews',    path: '/vendor-reviews' },
    { icon: Settings,        labelKey: 'settings',         path: '/settings' },
    { icon: Home,            labelKey: 'homePageProduct',  path: '/home-page-product' },
  ];

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
              <p className="text-xs text-muted-foreground">E-Commerce Admin Panel</p>
            </div>
          )}
        </div>
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
            {!collapsed && <span className="font-medium">{t(item.labelKey)}</span>}
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

        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          title={language === 'bn' ? 'Switch to English' : 'বাংলায় যান'}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mb-1",
            collapsed && "justify-center"
          )}
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="font-medium">{t('switchLanguage')}</span>
          )}
        </button>

        {/* Logout */}
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
