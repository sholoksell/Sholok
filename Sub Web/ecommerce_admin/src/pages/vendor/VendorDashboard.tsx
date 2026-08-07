import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats { totalOrders: number; pendingOrders: number; deliveredOrders: number; totalProducts: number; totalStock: number; walletBalance: number; pendingSettlement: number; }

export default function VendorDashboard() {
  const { token } = useVendorAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/admin-api/vendor/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (data?.stats) setData(data); })
      .catch(() => {});
  }, [token]);

  const stats: Stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];

  const StatCard = ({ title, value, icon: Icon, color, sub }: any) => (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={22} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const statusColor: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingCart} color="bg-blue-500" />
        <StatCard title="Pending Orders" value={stats.pendingOrders || 0} icon={Clock} color="bg-yellow-500" />
        <StatCard title="Delivered" value={stats.deliveredOrders || 0} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Products" value={stats.totalProducts || 0} icon={Package} color="bg-purple-500" sub={`${stats.totalStock || 0} units in stock`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500">
                <Wallet size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-2xl font-bold">৳{(stats.walletBalance || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">৳{(stats.pendingSettlement || 0).toLocaleString()} pending settlement</p>
              </div>
            </div>
            <Link to="/vendor/wallet" className="text-emerald-600 text-sm mt-3 inline-block hover:underline">View wallet →</Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">#{o.order_number}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{o.items_summary}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                      <p className="text-sm font-semibold mt-1">৳{Number(o.total).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/vendor/orders" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">View all orders →</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No products yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      : <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sold} sold · {p.stock} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/vendor/products" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">Manage products →</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
