import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Store, Users, ShoppingCart, Package, TrendingUp, Search, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Eye, Star, Wallet, ChevronLeft,
  ChevronRight, MoreVertical, Phone, Mail, MapPin, Calendar, ShieldCheck,
  ShieldX, ArrowUpRight, Ban, RotateCcw, BadgeCheck,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* ─── Types ─────────────────────────────────────────────────── */
interface VendorStats {
  total: number; active: number; pending: number; suspended: number;
  rejected: number; inactive: number; totalOrders: number;
  totalSales: number; totalProducts: number; totalDeposit: number;
}
interface Vendor {
  _id: number; name: string; businessName: string; email: string; phone: string;
  avatar: string; status: string; isVerified: boolean; codEnabled: boolean;
  division: string; district: string; upazila: string; address: string;
  createdAt: string; updatedAt: string;
  wallet?: { currentBalance: number; pendingSettlement: number; holdAmount: number; totalDeposit?: number; totalCodCollected?: number };
  store_name?: string; slug?: string; rating?: number; rating_count?: number;
  total_orders?: number; total_sales?: number;
}
interface VendorListRes { vendors: Vendor[]; total: number; page: number; limit: number; }

/* ─── Helpers ────────────────────────────────────────────────── */
const fmt = (n: number) => n >= 1_000_000 ? `৳${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `৳${(n/1_000).toFixed(1)}K` : `৳${n.toLocaleString()}`;
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
    rejected: 'bg-gray-100 text-gray-600 border-gray-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || map.inactive}`}>{status}</span>;
};

const Stars = ({ n = 0 }: { n?: number }) => (
  <span className="flex items-center gap-0.5 text-xs text-amber-500">
    <Star className="w-3.5 h-3.5 fill-amber-400" /> {Number(n).toFixed(1)}
  </span>
);

/* ─── Main Component ─────────────────────────────────────────── */
export default function VendorDashboardAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmAction, setConfirmAction] = useState<{ type: string; vendor: Vendor } | null>(null);

  /* ── Stats ── */
  const { data: stats } = useQuery<VendorStats>({
    queryKey: ['vendor-stats'],
    queryFn: () => api.get('/vendors/stats').then(r => r.data),
    staleTime: 30_000,
  });

  /* ── Vendor list ── */
  const { data: listData, isLoading, refetch } = useQuery<VendorListRes>({
    queryKey: ['vendor-list', statusFilter, page],
    queryFn: () => api.get('/vendors', { params: { status: statusFilter === 'all' ? undefined : statusFilter, page, limit: 15 } }).then(r => r.data),
    staleTime: 15_000,
  });

  const vendors = listData?.vendors ?? [];
  const totalVendors = listData?.total ?? 0;
  const totalPages = Math.ceil(totalVendors / 15);

  const filtered = search.trim()
    ? vendors.filter(v => [v.name, v.businessName, v.email, v.phone].join(' ').toLowerCase().includes(search.toLowerCase()))
    : vendors;

  /* ── Vendor detail ── */
  const { data: vendorDetail } = useQuery<Vendor>({
    queryKey: ['vendor-detail', selectedVendor?._id],
    queryFn: () => api.get(`/vendors/${selectedVendor!._id}`).then(r => r.data),
    enabled: !!selectedVendor,
  });

  /* ── Sub-tab queries ── */
  const { data: products, isLoading: prodLoad } = useQuery({
    queryKey: ['vendor-products', selectedVendor?._id],
    queryFn: () => api.get(`/vendors/${selectedVendor!._id}/products`).then(r => r.data),
    enabled: !!selectedVendor && activeTab === 'products',
  });
  const { data: orders, isLoading: ordLoad } = useQuery({
    queryKey: ['vendor-orders', selectedVendor?._id],
    queryFn: () => api.get(`/vendors/${selectedVendor!._id}/orders`).then(r => r.data),
    enabled: !!selectedVendor && activeTab === 'orders',
  });
  const { data: earnings, isLoading: earnLoad } = useQuery({
    queryKey: ['vendor-earnings', selectedVendor?._id],
    queryFn: () => api.get(`/vendors/${selectedVendor!._id}/earnings`).then(r => r.data),
    enabled: !!selectedVendor && activeTab === 'earnings',
  });
  const { data: reviews, isLoading: revLoad } = useQuery({
    queryKey: ['vendor-reviews', selectedVendor?._id],
    queryFn: () => api.get(`/vendors/${selectedVendor!._id}/reviews`).then(r => r.data),
    enabled: !!selectedVendor && activeTab === 'reviews',
  });

  /* ── Mutations ── */
  const updateVendor = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => api.put(`/vendors/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-list'] });
      qc.invalidateQueries({ queryKey: ['vendor-stats'] });
      qc.invalidateQueries({ queryKey: ['vendor-detail', selectedVendor?._id] });
      toast.success('Vendor updated');
      setConfirmAction(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const doAction = useCallback((type: string, vendor: Vendor) => {
    const map: Record<string, object> = {
      approve: { status: 'active', is_verified: 1 },
      reject: { status: 'rejected' },
      suspend: { status: 'suspended' },
      reactivate: { status: 'active' },
    };
    updateVendor.mutate({ id: vendor._id, data: map[type] });
  }, [updateVendor]);

  const openVendor = (v: Vendor) => {
    setSelectedVendor(v);
    setActiveTab('overview');
    setSheetOpen(true);
  };

  const detail = vendorDetail ?? selectedVendor;

  /* ─── Stats Cards ───────────────────────────────────────────── */
  const statCards = [
    { label: 'Total Vendors', value: stats?.total ?? 0, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: stats?.active ?? 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Approval', value: stats?.pending ?? 0, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Suspended', value: stats?.suspended ?? 0, icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Sales', value: stats ? fmt(stats.totalSales) : '—', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', isMoney: true },
    { label: 'Total Deposit', value: stats ? fmt(stats.totalDeposit) : '—', icon: Wallet, color: 'text-cyan-600', bg: 'bg-cyan-50', isMoney: true },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Advanced vendor management &amp; analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); qc.invalidateQueries({ queryKey: ['vendor-stats'] }); }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {statCards.map((c) => (
          <Card key={c.label} className="border shadow-sm">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-2`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search vendor / store / email / phone…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Vendor Table ── */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-0 px-5 pt-4">
          <CardTitle className="text-base font-semibold">
            Vendors <span className="ml-1 text-sm font-normal text-muted-foreground">({totalVendors})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="pl-5">Vendor</TableHead>
                  <TableHead>Store / Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Wallet</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pr-5 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Loading vendors…</TableCell></TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No vendors found</TableCell></TableRow>
                )}
                {filtered.map(v => (
                  <TableRow key={v._id} className="hover:bg-muted/30 cursor-pointer" onClick={() => openVendor(v)}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={v.avatar} />
                          <AvatarFallback className="text-xs bg-green-100 text-green-700">{v.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground leading-tight">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{v.businessName || '—'}</p>
                      <p className="text-xs text-muted-foreground">{v.district || ''}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{v.phone || '—'}</p>
                    </TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                    <TableCell>
                      {v.isVerified ? <BadgeCheck className="w-4 h-4 text-green-600" /> : <ShieldX className="w-4 h-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {fmt(v.wallet?.currentBalance ?? 0)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmtDate(v.createdAt)}</TableCell>
                    <TableCell className="pr-5 text-center" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openVendor(v)}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                          {v.status === 'pending' && <>
                            <DropdownMenuItem className="text-green-600" onClick={() => setConfirmAction({ type: 'approve', vendor: v })}><CheckCircle className="w-4 h-4 mr-2" />Approve</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setConfirmAction({ type: 'reject', vendor: v })}><XCircle className="w-4 h-4 mr-2" />Reject</DropdownMenuItem>
                          </>}
                          {v.status === 'active' && <DropdownMenuItem className="text-red-600" onClick={() => setConfirmAction({ type: 'suspend', vendor: v })}><Ban className="w-4 h-4 mr-2" />Suspend</DropdownMenuItem>}
                          {(v.status === 'suspended' || v.status === 'inactive') && <DropdownMenuItem className="text-green-600" onClick={() => setConfirmAction({ type: 'reactivate', vendor: v })}><RotateCcw className="w-4 h-4 mr-2" />Reactivate</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} · {totalVendors} vendors</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Vendor Detail Sheet ─────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0">
          <SheetHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-green-100 text-green-700 font-bold">{detail?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-base">{detail?.name}</SheetTitle>
                <p className="text-xs text-muted-foreground">{detail?.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {detail && <StatusBadge status={detail.status} />}
                {/* Quick actions */}
                {detail?.status === 'pending' && <>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs" onClick={() => setConfirmAction({ type: 'approve', vendor: detail })}><CheckCircle className="w-3.5 h-3.5 mr-1" />Approve</Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setConfirmAction({ type: 'reject', vendor: detail })}><XCircle className="w-3.5 h-3.5 mr-1" />Reject</Button>
                </>}
                {detail?.status === 'active' && <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setConfirmAction({ type: 'suspend', vendor: detail })}><Ban className="w-3.5 h-3.5 mr-1" />Suspend</Button>}
                {(detail?.status === 'suspended' || detail?.status === 'inactive') && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs" onClick={() => setConfirmAction({ type: 'reactivate', vendor: detail })}><RotateCcw className="w-3.5 h-3.5 mr-1" />Reactivate</Button>}
              </div>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b px-6 h-10 bg-transparent gap-0">
              {['overview','products','orders','earnings','reviews','verification'].map(tab => (
                <TabsTrigger key={tab} value={tab} className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 capitalize text-sm px-4 h-10">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Overview Tab ── */}
            <TabsContent value="overview" className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Sales', value: fmt(detail?.total_sales ?? 0), icon: TrendingUp },
                  { label: 'Total Orders', value: detail?.total_orders ?? 0, icon: ShoppingCart },
                  { label: 'Wallet Balance', value: fmt(detail?.wallet?.currentBalance ?? 0), icon: Wallet },
                  { label: 'Rating', value: `${Number(detail?.rating ?? 0).toFixed(1)} ★`, icon: Star },
                ].map(s => (
                  <Card key={s.label} className="border">
                    <CardContent className="p-4">
                      <s.icon className="w-4 h-4 text-green-600 mb-1" />
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Vendor Info</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2.5 text-sm">
                    {[
                      { icon: Users, label: 'Name', value: detail?.name },
                      { icon: Store, label: 'Business', value: detail?.businessName },
                      { icon: Mail, label: 'Email', value: detail?.email },
                      { icon: Phone, label: 'Phone', value: detail?.phone || '—' },
                      { icon: MapPin, label: 'Location', value: [detail?.district, detail?.division].filter(Boolean).join(', ') || '—' },
                      { icon: Calendar, label: 'Joined', value: fmtDate(detail?.createdAt ?? '') },
                    ].map(row => (
                      <div key={row.label} className="flex items-center gap-2.5">
                        <row.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground w-20 text-xs">{row.label}</span>
                        <span className="font-medium text-xs truncate">{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Wallet Summary</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2.5 text-sm">
                    {[
                      { label: 'Current Balance', value: fmt(detail?.wallet?.currentBalance ?? 0), color: 'text-green-600' },
                      { label: 'Pending Settlement', value: fmt(detail?.wallet?.pendingSettlement ?? 0), color: 'text-yellow-600' },
                      { label: 'Hold Amount', value: fmt(detail?.wallet?.holdAmount ?? 0), color: 'text-red-500' },
                      { label: 'Total Deposit', value: fmt((detail?.wallet as any)?.totalDeposit ?? 0), color: 'text-blue-600' },
                      { label: 'COD Collected', value: fmt((detail?.wallet as any)?.totalCodCollected ?? 0), color: 'text-purple-600' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                        <span className={`text-xs font-bold font-mono ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Products Tab ── */}
            <TabsContent value="products" className="p-6">
              {prodLoad ? <p className="text-sm text-muted-foreground text-center py-8">Loading products…</p> : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{products?.total ?? 0} products</p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/40">
                        <TableHead>Product</TableHead><TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead><TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Sales</TableHead><TableHead>Status</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {(products?.products ?? []).map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <p className="text-sm font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.sku || '—'}</p>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{p.categoryName || '—'}</TableCell>
                            <TableCell className="text-right text-sm font-mono">৳{Number(p.price).toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm">{p.stock ?? 0}</TableCell>
                            <TableCell className="text-right text-sm">{p.salesCount ?? 0}</TableCell>
                            <TableCell><StatusBadge status={p.status || 'draft'} /></TableCell>
                          </TableRow>
                        ))}
                        {(products?.products ?? []).length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No products found</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── Orders Tab ── */}
            <TabsContent value="orders" className="p-6">
              {ordLoad ? <p className="text-sm text-muted-foreground text-center py-8">Loading orders…</p> : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{orders?.total ?? 0} orders</p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/40">
                        <TableHead>Order #</TableHead><TableHead>Customer</TableHead>
                        <TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Vendor Earn</TableHead>
                        <TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {(orders?.orders ?? []).map((o: any) => (
                          <TableRow key={o.id}>
                            <TableCell className="text-sm font-mono">#{o.order_number || o.id}</TableCell>
                            <TableCell>
                              <p className="text-sm">{o.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                            </TableCell>
                            <TableCell className="text-right text-sm font-mono">৳{Number(o.total_amount).toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm font-mono text-green-600">৳{Number(o.vendorAmount).toLocaleString()}</TableCell>
                            <TableCell><StatusBadge status={o.payment_status || '—'} /></TableCell>
                            <TableCell><StatusBadge status={o.order_status || '—'} /></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</TableCell>
                          </TableRow>
                        ))}
                        {(orders?.orders ?? []).length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No orders found</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── Earnings Tab ── */}
            <TabsContent value="earnings" className="p-6 space-y-4">
              {earnLoad ? <p className="text-sm text-muted-foreground text-center py-8">Loading earnings…</p> : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Gross Sales', value: fmt(earnings?.totalSales ?? 0), color: 'text-green-600' },
                      { label: 'Wallet Balance', value: fmt(earnings?.wallet?.current_balance ?? 0), color: 'text-blue-600' },
                      { label: 'Pending Settlement', value: fmt(earnings?.wallet?.pending_settlement ?? 0), color: 'text-yellow-600' },
                      { label: 'Total Deposit', value: fmt(earnings?.wallet?.total_deposit ?? 0), color: 'text-purple-600' },
                    ].map(s => (
                      <Card key={s.label} className="border">
                        <CardContent className="p-4">
                          <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Card className="border">
                    <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Transaction History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader><TableRow className="bg-muted/40">
                            <TableHead className="pl-4">Type</TableHead><TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Balance After</TableHead><TableHead>Note</TableHead><TableHead>Date</TableHead>
                          </TableRow></TableHeader>
                          <TableBody>
                            {(earnings?.transactions ?? []).map((t: any) => (
                              <TableRow key={t.id}>
                                <TableCell className="pl-4"><Badge variant="outline" className="capitalize text-xs">{t.type}</Badge></TableCell>
                                <TableCell className="text-right font-mono text-sm text-green-600">৳{Number(t.amount).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono text-xs">৳{Number(t.balance_after).toLocaleString()}</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-40 truncate">{t.note || '—'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{fmtDate(t.created_at)}</TableCell>
                              </TableRow>
                            ))}
                            {(earnings?.transactions ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">No transactions</TableCell></TableRow>}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* ── Reviews Tab ── */}
            <TabsContent value="reviews" className="p-6 space-y-4">
              {revLoad ? <p className="text-sm text-muted-foreground text-center py-8">Loading reviews…</p> : (
                <>
                  {reviews && <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg">
                    <span className="text-3xl font-bold">{reviews.avgRating}</span>
                    <div>
                      <Stars n={reviews.avgRating} />
                      <p className="text-xs text-muted-foreground mt-0.5">{reviews.reviews?.length} reviews</p>
                    </div>
                  </div>}
                  <div className="space-y-3">
                    {(reviews?.reviews ?? []).map((r: any) => (
                      <div key={r.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{r.customerName || 'Anonymous'}</p>
                            <Stars n={r.rating} />
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge status={r.status || 'pending'} />
                            <span className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</span>
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
                      </div>
                    ))}
                    {(reviews?.reviews ?? []).length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No reviews yet</p>}
                  </div>
                </>
              )}
            </TabsContent>

            {/* ── Verification Tab ── */}
            <TabsContent value="verification" className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Verification Status</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Identity Verified</span>
                      {detail?.isVerified ? <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100"><ShieldCheck className="w-3.5 h-3.5 mr-1" />Verified</Badge> : <Badge variant="outline" className="text-muted-foreground"><ShieldX className="w-3.5 h-3.5 mr-1" />Unverified</Badge>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Account Status</span>
                      {detail && <StatusBadge status={detail.status} />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">COD Enabled</span>
                      <Badge variant={detail?.codEnabled ? 'default' : 'outline'} className={detail?.codEnabled ? 'bg-green-100 text-green-700 hover:bg-green-100 border border-green-200' : ''}>{detail?.codEnabled ? 'Yes' : 'No'}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Admin Actions</CardTitle></CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {detail?.status === 'pending' && <>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => setConfirmAction({ type: 'approve', vendor: detail })}><CheckCircle className="w-4 h-4 mr-2" />Approve Vendor</Button>
                      <Button className="w-full" variant="destructive" size="sm" onClick={() => setConfirmAction({ type: 'reject', vendor: detail })}><XCircle className="w-4 h-4 mr-2" />Reject Vendor</Button>
                    </>}
                    {detail?.status === 'active' && <>
                      <Button className="w-full" variant="destructive" size="sm" onClick={() => setConfirmAction({ type: 'suspend', vendor: detail })}><Ban className="w-4 h-4 mr-2" />Suspend Vendor</Button>
                      <Button className="w-full" variant="outline" size="sm" onClick={() => { if(detail) updateVendor.mutate({ id: detail._id, data: { is_verified: detail.isVerified ? 0 : 1 } }); }}>
                        <ShieldCheck className="w-4 h-4 mr-2" />{detail.isVerified ? 'Unverify' : 'Verify'} Vendor
                      </Button>
                    </>}
                    {(detail?.status === 'suspended' || detail?.status === 'inactive' || detail?.status === 'rejected') && (
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => setConfirmAction({ type: 'reactivate', vendor: detail })}><RotateCcw className="w-4 h-4 mr-2" />Reactivate Vendor</Button>
                    )}
                    <Button className="w-full" variant="outline" size="sm" onClick={() => { if(detail) updateVendor.mutate({ id: detail._id, data: { cod_enabled: detail.codEnabled ? 0 : 1 } }); }}>
                      <ArrowUpRight className="w-4 h-4 mr-2" />{detail?.codEnabled ? 'Disable' : 'Enable'} COD
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* ── Confirm Dialog ── */}
      <AlertDialog open={!!confirmAction} onOpenChange={open => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="capitalize">{confirmAction?.type} Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to <strong>{confirmAction?.type}</strong> vendor <strong>{confirmAction?.vendor?.name}</strong>? This will immediately update their status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.type === 'approve' || confirmAction?.type === 'reactivate' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
              onClick={() => confirmAction && doAction(confirmAction.type, confirmAction.vendor)}
            >
              {updateVendor.isPending ? 'Processing…' : `Yes, ${confirmAction?.type}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
