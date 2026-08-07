import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Wallet, Settings,
  Store, BarChart2, ArrowLeftRight, Bell, LogOut, Menu, X, ChevronDown, Video, Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'Products', icon: Package },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/vendor/shipments', label: 'Shipments', icon: Truck },
  { href: '/vendor/returns', label: 'Returns', icon: ArrowLeftRight },
  { href: '/vendor/inventory', label: 'Inventory', icon: BarChart2 },
  { href: '/vendor/wallet', label: 'Wallet', icon: Wallet },
  { href: '/vendor/store', label: 'Store Profile', icon: Store },
  { href: '/vendor/live-sessions', label: 'Live Sessions', icon: Video },
  { href: '/vendor/reviews', label: 'Reviews', icon: Star },
  { href: '/vendor/settings', label: 'Settings', icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { vendor, logout } = useVendorAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/vendor/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
      <div className="p-4 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          {vendor?.storeLogo
            ? <img src={vendor.storeLogo} alt="" className="w-10 h-10 rounded-full object-cover" />
            : <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-lg font-bold">{vendor?.storeName?.[0] || 'V'}</div>
          }
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{vendor?.storeName || 'Vendor Panel'}</p>
            <p className="text-xs text-emerald-300 truncate">{vendor?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${active ? 'bg-emerald-700 text-white font-medium' : 'text-emerald-100 hover:bg-emerald-700/50'}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-emerald-700">
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-emerald-200 hover:bg-emerald-700/50 w-full text-sm">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-60 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 h-full"><Sidebar /></div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="text-sm font-semibold text-gray-700 hidden md:block">Vendor Panel</h1>
          <div className="flex items-center gap-3 ml-auto">
            <Link to="/vendor/notifications" className="relative p-1">
              <Bell size={20} className="text-gray-600" />
            </Link>
            <span className="text-sm text-gray-600">{vendor?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
