import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/portal/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, TrendingUp, ShoppingBag, Edit, Trash2 } from 'lucide-react';

const SmartStore = () => {
  const { t } = useLanguage();

  const stats = [
    { label: t('revenue'), value: '$12,450', change: '+12.5%', icon: DollarSign, color: 'text-green-500' },
    { label: t('sales'), value: '342', change: '+8.2%', icon: TrendingUp, color: 'text-blue-500' },
    { label: t('myProducts'), value: '56', change: '+3', icon: Package, color: 'text-purple-500' },
    { label: t('orders'), value: '128', change: '+15.3%', icon: ShoppingBag, color: 'text-orange-500' },
  ];

  const products = [
    { id: '1', name: 'Wireless Headphones', price: '$89.99', stock: 45, sales: 234, status: 'active' },
    { id: '2', name: 'Smart Watch', price: '$199.99', stock: 12, sales: 156, status: 'active' },
    { id: '3', name: 'Laptop Stand', price: '$29.99', stock: 0, sales: 89, status: 'out-of-stock' },
    { id: '4', name: 'USB-C Hub', price: '$49.99', stock: 78, sales: 456, status: 'active' },
  ];

  const orders = [
    { id: '#12345', customer: 'John Doe', product: 'Wireless Headphones', amount: '$89.99', status: 'delivered', date: '2026-02-03' },
    { id: '#12344', customer: 'Jane Smith', product: 'Smart Watch', amount: '$199.99', status: 'shipped', date: '2026-02-03' },
    { id: '#12343', customer: 'Mike Johnson', product: 'USB-C Hub', amount: '$49.99', status: 'processing', date: '2026-02-02' },
    { id: '#12342', customer: 'Sarah Williams', product: 'Laptop Stand', amount: '$29.99', status: 'pending', date: '2026-02-02' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      'out-of-stock': 'destructive',
      delivered: 'secondary',
      shipped: 'default',
      processing: 'outline',
      pending: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('smartStore')} {t('dashboard')}</h1>
          <p className="text-muted-foreground">
            Manage your products, orders, and track your sales performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">{t('myProducts')}</TabsTrigger>
            <TabsTrigger value="orders">{t('orders')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('myProducts')}</CardTitle>
                    <CardDescription>Manage your product inventory</CardDescription>
                  </div>
                  <Button>Add Product</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>{t('price')}</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>{t('sales')}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('orders')}</CardTitle>
                <CardDescription>Track and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Your sales performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">Chart Placeholder - Sales Trend</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.sort((a, b) => b.sales - a.sales).slice(0, 4).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                          </div>
                        </div>
                        <span className="font-bold">{product.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SmartStore;
