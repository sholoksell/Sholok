import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import TakaIcon from '@/components/TakaIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { orderApi, Order } from '@/services/orderService';

const revenueData = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 198 },
  { name: 'Mar', revenue: 5000, orders: 300 },
  { name: 'Apr', revenue: 4500, orders: 278 },
  { name: 'May', revenue: 6000, orders: 389 },
  { name: 'Jun', revenue: 5500, orders: 349 },
  { name: 'Jul', revenue: 7000, orders: 430 },
];

const categoryData = [
  { name: 'Electronics', value: 35 },
  { name: 'Clothing', value: 25 },
  { name: 'Food', value: 20 },
  { name: 'Home', value: 15 },
  { name: 'Other', value: 5 },
];

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 84%, 60%)'];

const statusColors: Record<string, string> = {
  delivered: 'bg-success/20 text-success',
  processing: 'bg-primary/20 text-primary',
  pending: 'bg-warning/20 text-warning',
  shipped: 'bg-chart-4/20 text-chart-4',
  confirmed: 'bg-blue-500/20 text-blue-400',
  out_for_delivery: 'bg-cyan-500/20 text-cyan-400',
  cancelled: 'bg-destructive/20 text-destructive',
  refunded: 'bg-gray-500/20 text-gray-400',
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} days ago`;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    orderApi.getAll().then((orders) => {
      // Sort by newest first and take top 5
      const sorted = [...orders].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentOrders(sorted.slice(0, 5));
    }).catch((err) => {
      console.error('Failed to load recent orders:', err);
    }).finally(() => {
      setOrdersLoading(false);
    });
  }, []);
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="৳ 45,231"
          change="+20.1%"
          trend="up"
          icon={TakaIcon}
          gradient="gradient-primary"
        />
        <StatCard
          title="Orders"
          value="1,234"
          change="+12.5%"
          trend="up"
          icon={ShoppingCart}
          gradient="gradient-success"
        />
        <StatCard
          title="Customers"
          value="3,456"
          change="+8.2%"
          trend="up"
          icon={Users}
          gradient="gradient-warning"
        />
        <StatCard
          title="Products"
          value="567"
          change="-2.4%"
          trend="down"
          icon={Package}
          gradient="bg-chart-4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" />
                  <YAxis stroke="hsl(215, 20%, 55%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 10%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(217, 91%, 60%)"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 10%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 -mt-4">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Bar Chart */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" />
                  <YAxis stroke="hsl(215, 20%, 55%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 10%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading orders...</p>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map((order) => {
                  const customerName =
                    (order.customerId as any)?.name ||
                      order.deliveryAddress?.fullName ||
                      order.shippingAddress?.name ||
                      'Customer';
                  return (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">৳ {order.total?.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

function StatCard({ title, value, change, trend, icon: Icon, gradient }: StatCardProps) {
  return (
    <Card className="glass-card border-border overflow-hidden group hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            <div className={`flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{change}</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
