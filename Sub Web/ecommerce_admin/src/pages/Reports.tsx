import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
    const endpoints = [
      { name: 'overview',   fn: () => reportsApi.getOverview() },
      { name: 'sales',      fn: () => reportsApi.getSales(period) },
      { name: 'orders',     fn: () => reportsApi.getOrders() },
      { name: 'customers',  fn: () => reportsApi.getCustomers() },
      { name: 'products',   fn: () => reportsApi.getProducts() },
      { name: 'finance',    fn: () => reportsApi.getFinance(period) },
      { name: 'stock',      fn: () => reportsApi.getStock() },
    ];

    const results = await Promise.allSettled(endpoints.map(e => e.fn()));

    let hasError = false;
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        hasError = true;
        const err = result.reason;
        console.error(`[Reports] ${endpoints[i].name} failed:`, err?.response?.status, err?.response?.data?.message || err?.message);
      }
    });

    const [overviewRes, salesRes, ordersRes, customersRes, productsRes, financeRes, stockRes] = results;
    if (overviewRes.status === 'fulfilled')  setOverview(overviewRes.value);
    if (salesRes.status === 'fulfilled')     setSales(salesRes.value);
    if (ordersRes.status === 'fulfilled')    setOrdersReport(ordersRes.value);
    if (customersRes.status === 'fulfilled') setCustomers(customersRes.value);
    if (productsRes.status === 'fulfilled')  setProducts(productsRes.value);
    if (financeRes.status === 'fulfilled')   setFinance(financeRes.value);
    if (stockRes.status === 'fulfilled')     setStock(stockRes.value);

    if (hasError) toast.error('Some report sections failed to load — check browser console for details');
    setLoading(false);
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
          <h1 className="text-3xl font-bold text-foreground">{t('reportsAnalytics')}</h1>
          <p className="text-muted-foreground">{t('businessInsights')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ key: '7d', label: t('days7') }, { key: '30d', label: t('days30') }, { key: '90d', label: t('days90') }, { key: '1y', label: t('year1') }].map(p => (
            <Button key={p.key} variant={period === p.key ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p.key)}>
              {p.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exportLoading}>
            <Download className="w-4 h-4 mr-1" /> {t('export')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['overview', 'sales', 'orders', 'customers', 'products', 'finance', 'stock'] as const).map(tabKey => {
          const tabLabels: Record<string, string> = { overview: t('overview'), sales: t('sales'), orders: t('orders'), customers: t('customers'), products: t('products'), finance: t('finance'), stock: t('stockTab') };
          return <Button key={tabKey} variant={tab === tabKey ? 'default' : 'outline'} size="sm" onClick={() => setTab(tabKey)} className="capitalize">{tabLabels[tabKey]}</Button>;
        })}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && overview && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><TakaIcon className="w-5 h-5 text-success" /></div><div><p className="text-sm text-muted-foreground">{t('todaysRevenue')}</p><p className="text-2xl font-bold">৳{Number(overview.todayRevenue).toFixed(0)}</p></div></div></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('todaysOrders')}</p><p className="text-2xl font-bold">{overview.todayOrders}</p></div></div></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">{t('monthlyRevenue')}</p><p className="text-2xl font-bold">৳{Number(overview.monthRevenue).toFixed(0)}</p></div></div></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center"><Package className="w-5 h-5 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">{t('pendingOrders')}</p><p className="text-2xl font-bold">{overview.pendingOrders}</p></div></div></CardContent></Card>
          </div>
          {sales && sales.salesByDay.length > 0 && (
            <Card className="glass-card border-border">
              <CardHeader><CardTitle>{t('revenueTrend')}</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>{t('salesSummary')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('totalRevenue')}</span><span className="font-bold">৳{Number(sales.summary.totalRevenue).toFixed(2)}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('totalOrders')}</span><span className="font-bold">{sales.summary.totalOrders}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('avgOrderValue')}</span><span className="font-bold">৳{Number(sales.summary.avgOrderValue).toFixed(2)}</span></div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>{t('salesByPaymentMethod')}</CardTitle></CardHeader>
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
              ) : <p className="text-center text-muted-foreground py-8">{t('noDataLabel')}</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && ordersReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>{t('ordersByStatus')}</CardTitle></CardHeader>
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
              ) : <p className="text-center text-muted-foreground py-8">{t('noDataLabel')}</p>}
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>{t('orderMetrics')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('cancelledOrders')}</span><span className="font-bold text-destructive">{ordersReport.cancelledOrders}</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground">{t('refundedOrders')}</span><span className="font-bold text-warning">{ordersReport.refundedOrders}</span></div>
              {ordersReport.ordersByPaymentStatus.map(s => (
                <div key={s._id} className="flex justify-between p-3 rounded-lg bg-muted/30"><span className="text-muted-foreground capitalize">{t('paymentStatus')}: {s._id || 'Unknown'}</span><span className="font-bold">{s.count}</span></div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Tab */}
      {tab === 'customers' && customers && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><Users className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{customers.totalCustomers}</p><p className="text-sm text-muted-foreground">{t('totalCustomers')}</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><ArrowUpRight className="w-8 h-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold">{customers.newCustomers}</p><p className="text-sm text-muted-foreground">{t('newLast30Days')}</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><TakaIcon className="w-8 h-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{customers.topCustomers.length}</p><p className="text-sm text-muted-foreground">{t('topSpenders')}</p></CardContent></Card>
          </div>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>{t('topCustomersBySpending')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>#</TableHead><TableHead>{t('customer')}</TableHead><TableHead>{t('email')}</TableHead><TableHead>{t('orders')}</TableHead><TableHead>{t('totalSpent')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {customers.topCustomers.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{c._id?.name || 'N/A'}</TableCell>
                      <TableCell>{c._id?.email || 'N/A'}</TableCell>
                      <TableCell>{c.orderCount}</TableCell>
                      <TableCell className="font-bold">৳{Number(c.totalSpent).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {customers.topCustomers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('noDataLabel')}</TableCell></TableRow>}
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
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><Package className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{products.totalProducts}</p><p className="text-sm text-muted-foreground">{t('totalProducts')}</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{products.lowStock.length}</p><p className="text-sm text-muted-foreground">{t('lowStock')}</p></CardContent></Card>
            <Card className="glass-card border-border"><CardContent className="p-4 text-center"><AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" /><p className="text-2xl font-bold">{products.outOfStock}</p><p className="text-sm text-muted-foreground">{t('outOfStock')}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-border">
              <CardHeader><CardTitle>{t('topSellingProducts')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>{t('product')}</TableHead><TableHead>{t('qtySold')}</TableHead><TableHead>{t('revenue')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.topSelling.map((p, i) => (
                      <TableRow key={i}><TableCell className="font-medium">{p.productName || 'N/A'}</TableCell><TableCell>{p.totalQuantity}</TableCell><TableCell>৳{Number(p.totalRevenue).toFixed(2)}</TableCell></TableRow>
                    ))}
                    {products.topSelling.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{t('noSalesData')}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="glass-card border-border">
              <CardHeader><CardTitle>{t('lowStockProducts')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>{t('product')}</TableHead><TableHead>{t('stock')}</TableHead><TableHead>{t('price')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.lowStock.map(p => (
                      <TableRow key={p._id}><TableCell className="font-medium">{p.name}</TableCell><TableCell><Badge className={p.stock === 0 ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}>{p.stock}</Badge></TableCell><TableCell>৳{p.price}</TableCell></TableRow>
                    ))}
                    {products.lowStock.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{t('noLowStockProducts')}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Finance Tab */}
      {tab === 'finance' && loading && <p className="text-center text-muted-foreground py-16">{t('loadingFinanceData')}</p>}
      {tab === 'finance' && !loading && !finance && <p className="text-center text-muted-foreground py-16">{t('noFinanceData')}</p>}
      {tab === 'finance' && finance && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: t('totalRevenue'), value: `৳${(finance.revenue ?? 0).toLocaleString()}`, color: 'text-success' },
              { label: t('netRevenue'), value: `৳${(finance.netRevenue ?? 0).toLocaleString()}`, color: 'text-primary' },
              { label: t('shippingRevenue'), value: `৳${(finance.shippingRevenue ?? 0).toLocaleString()}`, color: 'text-chart-3' },
              { label: t('discounts'), value: `৳${(finance.discounts ?? 0).toLocaleString()}`, color: 'text-warning' },
              { label: t('refunds'), value: `৳${(finance.refunds ?? 0).toLocaleString()}`, color: 'text-destructive' },
              { label: t('pendingPayments'), value: `৳${(finance.pendingPayments ?? 0).toLocaleString()}`, color: 'text-muted-foreground' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="glass-card border-border">
                <CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-xl font-bold ${color}`}>{value}</p></CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>{t('revenueByPaymentMethod')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('method')}</TableHead><TableHead>{t('transactions')}</TableHead><TableHead>{t('revenue')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {finance.paymentMethodBreakdown.map(row => (
                    <TableRow key={row._id}><TableCell className="capitalize">{(row._id || 'unknown').replace(/_/g, ' ')}</TableCell><TableCell>{row.count}</TableCell><TableCell>৳{Number(row.revenue).toLocaleString()}</TableCell></TableRow>
                  ))}
                  {finance.paymentMethodBreakdown.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{t('noDataLabel')}</TableCell></TableRow>}
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
              { label: t('totalProducts'), value: stock.totalProducts },
              { label: t('outOfStock'), value: stock.outOfStock, color: 'text-destructive' },
              { label: t('lowStock'), value: stock.lowStock, color: 'text-warning' },
              { label: t('stockValue'), value: `৳${Number(stock.totalStockValue).toLocaleString()}`, color: 'text-success' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="glass-card border-border">
                <CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</p></CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-card border-border">
            <CardHeader><CardTitle>{t('lowStockItems')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('product')}</TableHead><TableHead>{t('stock')}</TableHead><TableHead>{t('price')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {stock.lowStockItems.map(p => (
                    <TableRow key={p._id}><TableCell className="font-medium">{p.name}</TableCell><TableCell><Badge className={p.stock === 0 ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}>{p.stock}</Badge></TableCell><TableCell>৳{p.price}</TableCell></TableRow>
                  ))}
                  {stock.lowStockItems.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{t('allProductsWellStocked')}</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
