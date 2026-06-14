import { useState, useEffect } from 'react';
import { reportsApi, SalesReport, OrdersReport, CustomerReport, ProductReport, ReportsOverview, FinanceReport, StockReport } from '@/services/reportsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, Users, Package, ShoppingCart, AlertTriangle, ArrowUpRight, Download, DollarSign, Boxes } from 'lucide-react';
import TakaIcon from '@/components/TakaIcon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 84%, 60%)', 'hsl(180, 70%, 45%)'];

export default function Reports() {
  const [tab, setTab] = useState<'overview' | 'sales' | 'orders' | 'customers' | 'products' | 'finance' | 'stock'>('overview');
  const [period, setPeriod] = useState('30d');
  const [overview, setOverview] = useState<ReportsOverview | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [ordersReport, setOrdersReport] = useState<OrdersReport | null>(null);
  const [customers, setCustomers] = useState<CustomerReport | null>(null);
  const [products, setProducts] = useState<ProductReport | null>(null);
  const [finance, setFinance] = useState<FinanceReport | null>(null);
  const [stock, setStock] = useState<StockReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => { fetchAll(); }, [period]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [overviewData, salesData, ordersData, customersData, productsData, financeData, stockData] = await Promise.all([
        reportsApi.getOverview(),
        reportsApi.getSales(period),
        reportsApi.getOrders(),
        reportsApi.getCustomers(),
        reportsApi.getProducts(),
        reportsApi.getFinance(period),
        reportsApi.getStock(),
      ]);
      setOverview(overviewData);
      setSales(salesData);
      setOrdersReport(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
      setFinance(financeData);
      setStock(stockData);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const blob = await reportsApi.exportSalesCsv(period);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to export'); }
    finally { setExportLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['7d', '30d', '90d', '1y'].map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exportLoading}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['overview', 'sales', 'orders', 'customers', 'products', 'finance', 'stock'] as const).map(t => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)} className="capitalize">{t}</Button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && overview && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><TakaIcon className="w-5 h-5 text-success" /></div><div><p className="text-sm text-muted-foreground">Today's Revenue</p><p className="text-2xl font-bold">৳{overview.todayRevenue.toFixed(0)}</p></div></div></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Today's Orders</p><p className="text-2xl font-bold">{overview.todayOrders}</p></div></div></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">Monthly Revenue</p><p className="text-2xl font-bold">৳{overview.monthRevenue.toFixed(0)}</p></div></div></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center"><Package className="w-5 h-5 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">Pending Orders</p><p className="text-2xl font-bold">{overview.pendingOrders}</p></div></div></CardContent></Card>
          </div>
          {sales && sales.salesByDay.length > 0 && (
            <Card className="glass-card border-border">
              <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sales.salesByDay}>
                      <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                      <XAxis dataKey="_id" stroke="hsl(215, 20%, 55%)" tick={{ fontSize: 11 }} />
                      <YAxis stroke="hsl(215, 20%, 55%)" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Sales Tab */}
      {tab === 'sales' && sales && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>Sales Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">Total Revenue</span><span className="font-bold">৳{sales.summary.totalRevenue.toFixed(2)}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">Total Orders</span><span className="font-bold">{sales.summary.totalOrders}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">Avg Order Value</span><span className="font-bold">৳{sales.summary.avgOrderValue.toFixed(2)}</span></div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>Sales by Payment Method</CardTitle></CardHeader>
            <CardContent>
              {sales.salesByPaymentMethod.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sales.salesByPaymentMethod.map(s => ({ name: s._id || 'Other', value: s.revenue }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={5}>
                        {sales.salesByPaymentMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3">
                    {sales.salesByPaymentMethod.map((s, i) => (
                      <div key={s._id} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-xs text-muted-foreground">{s._id || 'Other'}</span></div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-center text-muted-foreground py-8">No data</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && ordersReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
            <CardContent>
              {ordersReport.ordersByStatus.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersReport.ordersByStatus.map(s => ({ status: s._id || 'Unknown', count: s.count }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                      <XAxis dataKey="status" stroke="hsl(215, 20%, 55%)" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(215, 20%, 55%)" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-center text-muted-foreground py-8">No data</p>}
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>Order Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">Cancelled Orders</span><span className="font-bold text-destructive">{ordersReport.cancelledOrders}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">Refunded Orders</span><span className="font-bold text-warning">{ordersReport.refundedOrders}</span></div>
              {ordersReport.ordersByPaymentStatus.map(s => (
                <div key={s._id} className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground capitalize">Payment: {s._id || 'Unknown'}</span><span className="font-bold">{s.count}</span></div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Tab */}
      {tab === 'customers' && customers && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><Users className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{customers.totalCustomers}</p><p className="text-sm text-muted-foreground">Total Customers</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><ArrowUpRight className="w-8 h-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold">{customers.newCustomers}</p><p className="text-sm text-muted-foreground">New (Last 30 Days)</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><TakaIcon className="w-8 h-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{customers.topCustomers.length}</p><p className="text-sm text-muted-foreground">Top Spenders</p></CardContent></Card>
          </div>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>Top Customers by Spending</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Customer</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Total Spent</TableHead></TableRow></TableHeader>
                <TableBody>
                  {customers.topCustomers.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{c._id?.name || 'N/A'}</TableCell>
                      <TableCell>{c._id?.email || 'N/A'}</TableCell>
                      <TableCell>{c.orderCount}</TableCell>
                      <TableCell className="font-bold">৳{c.totalSpent.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {customers.topCustomers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && products && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><Package className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{products.totalProducts}</p><p className="text-sm text-muted-foreground">Total Products</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{products.lowStock.length}</p><p className="text-sm text-muted-foreground">Low Stock</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" /><p className="text-2xl font-bold">{products.outOfStock}</p><p className="text-sm text-muted-foreground">Out of Stock</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-border">
              <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty Sold</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.topSelling.map((p, i) => (
                      <TableRow key={i}><TableCell className="font-medium">{p.productName || 'N/A'}</TableCell><TableCell>{p.totalQuantity}</TableCell><TableCell>৳{p.totalRevenue.toFixed(2)}</TableCell></TableRow>
                    ))}
                    {products.topSelling.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No sales data</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="glass-card border-border">
              <CardHeader><CardTitle>Low Stock Products</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.lowStock.map(p => (
                      <TableRow key={p._id}><TableCell className="font-medium">{p.name}</TableCell><TableCell><Badge className={p.stock === 0 ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}>{p.stock}</Badge></TableCell><TableCell>৳{p.price}</TableCell></TableRow>
                    ))}
                    {products.lowStock.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No low stock products</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Finance Tab */}
      {tab === 'finance' && loading && <p className="text-center text-muted-foreground py-16">Loading finance data...</p>}
      {tab === 'finance' && !loading && !finance && <p className="text-center text-muted-foreground py-16">No finance data available.</p>}
      {tab === 'finance' && finance && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Revenue', value: `৳${(finance.revenue ?? 0).toLocaleString()}`, color: 'text-success' },
              { label: 'Net Revenue', value: `৳${(finance.netRevenue ?? 0).toLocaleString()}`, color: 'text-primary' },
              { label: 'Shipping Revenue', value: `৳${(finance.shippingRevenue ?? 0).toLocaleString()}`, color: 'text-chart-3' },
              { label: 'Discounts', value: `৳${(finance.discounts ?? 0).toLocaleString()}`, color: 'text-warning' },
              { label: 'Refunds', value: `৳${(finance.refunds ?? 0).toLocaleString()}`, color: 'text-destructive' },
              { label: 'Pending Payments', value: `৳${(finance.pendingPayments ?? 0).toLocaleString()}`, color: 'text-muted-foreground' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="glass-card border-border">
                <CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-xl font-bold ${color}`}>{value}</p></CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>Revenue by Payment Method</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Method</TableHead><TableHead>Transactions</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
                <TableBody>
                  {finance.paymentMethodBreakdown.map(row => (
                    <TableRow key={row._id}><TableCell className="capitalize">{(row._id || 'unknown').replace(/_/g, ' ')}</TableCell><TableCell>{row.count}</TableCell><TableCell>৳{row.revenue.toLocaleString()}</TableCell></TableRow>
                  ))}
                  {finance.paymentMethodBreakdown.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock Tab */}
      {tab === 'stock' && stock && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: stock.totalProducts },
              { label: 'Out of Stock', value: stock.outOfStock, color: 'text-destructive' },
              { label: 'Low Stock', value: stock.lowStock, color: 'text-warning' },
              { label: 'Stock Value', value: `৳${stock.totalStockValue.toLocaleString()}`, color: 'text-success' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="glass-card border-border">
                <CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</p></CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>Low Stock Items</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
                <TableBody>
                  {stock.lowStockItems.map(p => (
                    <TableRow key={p._id}><TableCell className="font-medium">{p.name}</TableCell><TableCell><Badge className={p.stock === 0 ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}>{p.stock}</Badge></TableCell><TableCell>৳{p.price}</TableCell></TableRow>
                  ))}
                  {stock.lowStockItems.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">All products well-stocked</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
