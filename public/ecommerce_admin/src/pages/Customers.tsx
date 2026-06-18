import { useState, useEffect, useMemo } from 'react';
import { customerApi, Customer, CustomerDetails, CustomerAddress, CustomerAnalytics } from '@/services/customerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Plus, Search, MoreVertical, Edit, Trash2, Mail, Phone, MapPin,
  Users, ShoppingCart, TrendingUp, Eye, Award, Shield, Star, Clock,
  MessageSquare, UserX, CalendarClock, Bell, Heart, CheckSquare,
  ShoppingBag, Ban, UserCheck, Download, Upload, FileText, AlertCircle,
  Key, Link2, BarChart2, Home, ChevronDown,
} from 'lucide-react';
import TakaIcon from '@/components/TakaIcon';

const statusConfig = {
  active: { label: 'Active', className: 'bg-success/20 text-success' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
  blocked: { label: 'Blocked', className: 'bg-destructive/20 text-destructive' },
};

const groupConfig: Record<string, { label: string; className: string }> = {
  regular: { label: 'Regular', className: 'bg-blue-500/20 text-blue-600' },
  wholesale: { label: 'Wholesale', className: 'bg-purple-500/20 text-purple-600' },
  vip: { label: 'VIP', className: 'bg-yellow-500/20 text-yellow-700' },
  dealer: { label: 'Dealer', className: 'bg-emerald-500/20 text-emerald-600' },
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Customer['status']>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<CustomerDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [pointsCustomer, setPointsCustomer] = useState<Customer | null>(null);
  const [pointsForm, setPointsForm] = useState({ type: 'bonus', points: 0, description: '' });

  // Message / Notification
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<Customer | null>(null);
  const [messageForm, setMessageForm] = useState({ title: '', message: '', type: 'info' as string });

  // Suspension
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendCustomer, setSuspendCustomer] = useState<Customer | null>(null);
  const [suspendDate, setSuspendDate] = useState('');

  // Group with discount
  const [groupDiscountOpen, setGroupDiscountOpen] = useState(false);
  const [groupDiscountCustomer, setGroupDiscountCustomer] = useState<Customer | null>(null);
  const [groupForm, setGroupForm] = useState({ group: 'regular', discount: 0 });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMessageOpen, setBulkMessageOpen] = useState(false);

  // Analytics
  const [analyticsData, setAnalyticsData] = useState<CustomerAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Import dialog
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  // Address book (detail dialog)
  const defaultAddrForm = { label: 'Home', name: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'Bangladesh', type: 'both' as 'billing' | 'shipping' | 'both', isDefault: false };
  const [addrForm, setAddrForm] = useState<Partial<CustomerAddress>>(defaultAddrForm);
  const [addrFormOpen, setAddrFormOpen] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrLoading, setAddrLoading] = useState(false);

  // Security
  const [tempPassword, setTempPassword] = useState('');
  const [activationLink, setActivationLink] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  const MESSAGE_TEMPLATES = [
    { label: 'Welcome', title: 'Welcome to Sholok!', message: 'Thank you for joining us. Enjoy exclusive deals and offers!' },
    { label: 'Thank You', title: 'Thank You for Your Order!', message: 'We appreciate your purchase. Your order is being processed.' },
    { label: 'Promo Offer', title: 'Special Offer Just For You', message: 'Enjoy 10% off your next purchase. Use code: SPECIAL10' },
    { label: 'Account Update', title: 'Account Information Updated', message: 'Your account information has been successfully updated.' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh',
    },
    status: 'active' as Customer['status'],
  });

  useEffect(() => {
    fetchCustomers();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await customerApi.getAnalytics();
      setAnalyticsData(data);
    } catch {
      // silent fail for analytics
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesGroup = groupFilter === 'all' || customer.group === groupFilter;
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [customers, search, statusFilter, groupFilter]);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editCustomer) {
        await customerApi.update(editCustomer._id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerApi.create(formData);
        toast.success('Customer created successfully');
      }
      setFormOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setFormData({
      name: customer.name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: {
        street: customer.address?.street ?? '',
        city: customer.address?.city ?? '',
        state: customer.address?.state ?? '',
        zipCode: customer.address?.zipCode ?? '',
        country: customer.address?.country ?? 'Bangladesh',
      },
      status: customer.status ?? 'active',
    });
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      const result: any = await customerApi.delete(customerToDelete._id);
      if (result?.restoredItems > 0) {
        toast.success(
          `Customer deleted. Stock restored for ${result.restoredItems} item(s) from ${result.restoredOrders} active order(s).`
        );
      } else {
        toast.success('Customer deleted successfully');
      }
      setDeleteOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const resetForm = () => {
    setEditCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Bangladesh',
      },
      status: 'active',
    });
  };

  const handleViewDetails = async (customer: Customer) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const data = await customerApi.getDetails(customer._id);
      setDetailData(data);
    } catch {
      toast.error('Failed to load customer details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGroupChange = async (customerId: string, group: string) => {
    try {
      await customerApi.updateGroup(customerId, group);
      toast.success('Customer group updated');
      fetchCustomers();
    } catch {
      toast.error('Failed to update group');
    }
  };

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointsCustomer) return;
    try {
      await customerApi.addPoints(
        pointsCustomer._id,
        pointsForm.type,
        pointsForm.points,
        pointsForm.description
      );
      toast.success('Points updated');
      setPointsOpen(false);
      setPointsForm({ type: 'bonus', points: 0, description: '' });
      fetchCustomers();
    } catch {
      toast.error('Failed to update points');
    }
  };

  const handleStatusChange = async (customer: Customer, status: Customer['status'], suspendedUntil?: string | null) => {
    try {
      await customerApi.updateStatus(customer._id, status, suspendedUntil);
      toast.success(`Customer ${status === 'blocked' ? 'blocked' : status === 'active' ? 'activated' : 'deactivated'}`);
      fetchCustomers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSuspend = async () => {
    if (!suspendCustomer || !suspendDate) return;
    try {
      await customerApi.updateStatus(suspendCustomer._id, 'blocked', suspendDate);
      toast.success(`Customer suspended until ${new Date(suspendDate).toLocaleDateString()}`);
      setSuspendOpen(false);
      setSuspendCustomer(null);
      setSuspendDate('');
      fetchCustomers();
    } catch {
      toast.error('Failed to suspend customer');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTarget) return;
    try {
      await customerApi.sendNotification(messageTarget._id, messageForm);
      toast.success('Message sent to customer');
      setMessageOpen(false);
      setMessageForm({ title: '', message: '', type: 'info' });
      setMessageTarget(null);
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleBulkMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    try {
      const result = await customerApi.bulkNotify(selectedIds, messageForm);
      toast.success(`Message sent to ${result.sent} customers`);
      setBulkMessageOpen(false);
      setMessageForm({ title: '', message: '', type: 'info' });
      setSelectedIds([]);
    } catch {
      toast.error('Failed to send bulk message');
    }
  };

  const handleGroupChangeWithDiscount = async () => {
    if (!groupDiscountCustomer) return;
    try {
      await customerApi.updateGroup(groupDiscountCustomer._id, groupForm.group, groupForm.discount);
      toast.success('Customer group updated');
      setGroupDiscountOpen(false);
      setGroupDiscountCustomer(null);
      fetchCustomers();
    } catch {
      toast.error('Failed to update group');
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c._id));
    }
  };

  const handleExportCsv = async () => {
    try {
      await customerApi.exportCsv();
      toast.success('CSV downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      let rows: any[] = [];
      const trimmed = importText.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        rows = JSON.parse(trimmed.startsWith('[') ? trimmed : `[${trimmed}]`);
      } else {
        // CSV: first line = headers
        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
        rows = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
          const obj: any = {};
          headers.forEach((h, i) => { obj[h.toLowerCase()] = vals[i] || ''; });
          return obj;
        });
      }
      const result = await customerApi.importCustomers(rows);
      setImportResult(result);
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} customers`);
        fetchCustomers();
      }
    } catch (e: any) {
      toast.error('Import failed: ' + (e.message || 'Invalid format'));
    } finally {
      setImportLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailData) return;
    setAddrLoading(true);
    try {
      let addresses: CustomerAddress[];
      if (editingAddrId) {
        addresses = await customerApi.updateAddress(detailData.customer._id, editingAddrId, addrForm);
      } else {
        addresses = await customerApi.addAddress(detailData.customer._id, addrForm);
      }
      setDetailData({ ...detailData, customer: { ...detailData.customer, addresses } as any });
      setAddrFormOpen(false);
      setAddrForm(defaultAddrForm);
      setEditingAddrId(null);
      toast.success(editingAddrId ? 'Address updated' : 'Address added');
    } catch {
      toast.error('Failed to save address');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!detailData) return;
    try {
      const addresses = await customerApi.deleteAddress(detailData.customer._id, addrId);
      setDetailData({ ...detailData, customer: { ...detailData.customer, addresses } as any });
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleResetPassword = async () => {
    if (!detailData) return;
    setSecurityLoading(true);
    try {
      const result = await customerApi.resetPassword(detailData.customer._id);
      setTempPassword(result.tempPassword);
      toast.success('Password reset');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleSendActivation = async () => {
    if (!detailData) return;
    setSecurityLoading(true);
    try {
      const result = await customerApi.sendActivationLink(detailData.customer._id);
      setActivationLink(result.activationLink);
      toast.success('Activation link generated');
    } catch {
      toast.error('Failed to generate activation link');
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportCsv} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => { setImportText(''); setImportResult(null); setImportOpen(true); }} size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {analyticsData && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <Card className="glass-card border-border col-span-2 md:col-span-1">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">New (30d)</p>
              <p className="text-xl font-bold text-chart-1">{analyticsData.newLast30Days}</p>
              <p className="text-xs text-muted-foreground mt-0.5">of {analyticsData.total} total</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Returning</p>
              <p className="text-xl font-bold text-success">{analyticsData.returning}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{analyticsData.retentionRate}% rate</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Avg LTV</p>
              <p className="text-xl font-bold text-chart-4">৳{analyticsData.avgLifetimeValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">per customer</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Avg Frequency</p>
              <p className="text-xl font-bold text-chart-3">{analyticsData.avgOrderFrequency}</p>
              <p className="text-xs text-muted-foreground mt-0.5">orders / customer</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Active (90d)</p>
              <p className="text-xl font-bold text-yellow-500">{analyticsData.activeRecently}</p>
              <p className="text-xs text-muted-foreground mt-0.5">logged in recently</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCustomers}</p>
              <p className="text-sm text-muted-foreground">Active Customers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <TakaIcon className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">৳{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value="all">All Groups</option>
              <option value="regular">Regular</option>
              <option value="wholesale">Wholesale</option>
              <option value="vip">VIP</option>
              <option value="dealer">Dealer</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <Card className="glass-card border-primary/40 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">{selectedIds.length} customer(s) selected</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMessageForm({ title: '', message: '', type: 'info' });
                  setBulkMessageOpen(true);
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Send Message
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer._id} className={selectedIds.includes(customer._id) ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(customer._id)}
                          onCheckedChange={() => toggleSelectCustomer(customer._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </p>
                          {customer.suspendedUntil && new Date(customer.suspendedUntil) > new Date() && (
                            <p className="text-xs text-orange-500 flex items-center gap-1 mt-0.5">
                              <CalendarClock className="w-3 h-3" />
                              Suspended until {new Date(customer.suspendedUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge className={`${groupConfig[customer.group || 'regular']?.className || groupConfig.regular.className} border-0`}>
                            {groupConfig[customer.group || 'regular']?.label || 'Regular'}
                          </Badge>
                          {customer.groupDiscount > 0 && (
                            <span className="text-xs text-muted-foreground">-{customer.groupDiscount}%</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{customer.totalOrders}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">৳{customer.totalSpent.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-yellow-600">{customer.rewardPoints || 0}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[customer.status].className} border-0`}>
                          {statusConfig[customer.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(customer)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setGroupForm({ group: customer.group || 'regular', discount: customer.groupDiscount || 0 });
                              setGroupDiscountCustomer(customer);
                              setGroupDiscountOpen(true);
                            }}>
                              <Users className="w-4 h-4 mr-2" />
                              Change Group
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setPointsCustomer(customer); setPointsOpen(true); }}>
                              <Award className="w-4 h-4 mr-2" />
                              Manage Points
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setMessageTarget(customer);
                              setMessageForm({ title: '', message: '', type: 'info' });
                              setMessageOpen(true);
                            }}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {customer.status === 'blocked' ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(customer, 'active')}>
                                <UserCheck className="w-4 h-4 mr-2 text-success" />
                                Activate
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(customer, 'blocked')}>
                                  <Ban className="w-4 h-4 mr-2 text-destructive" />
                                  Block
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSuspendCustomer(customer);
                                  setSuspendDate('');
                                  setSuspendOpen(true);
                                }}>
                                  <CalendarClock className="w-4 h-4 mr-2 text-orange-500" />
                                  Suspend Until...
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCustomerToDelete(customer);
                                setDeleteOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
                <Input
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                />
                <Input
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value }
                  })}
                />
                <Input
                  placeholder="Zip Code"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, zipCode: e.target.value }
                  })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                {editCustomer ? 'Update' : 'Create'} Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {customerToDelete?.name}? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Detail View Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : detailData ? (
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-8 text-xs">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders ({detailData.orders.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({detailData.reviews.length})</TabsTrigger>
                <TabsTrigger value="points">Points</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">
                  Messages
                  {(detailData.customer as any).notifications?.filter((n: any) => !n.read).length > 0 && (
                    <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5">
                      {(detailData.customer as any).notifications.filter((n: any) => !n.read).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{detailData.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{detailData.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{detailData.customer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${statusConfig[detailData.customer.status].className} border-0 w-fit`}>
                        {statusConfig[detailData.customer.status].label}
                      </Badge>
                      {(detailData.customer as any).suspendedUntil && new Date((detailData.customer as any).suspendedUntil) > new Date() && (
                        <p className="text-xs text-orange-500">
                          Suspended until {new Date((detailData.customer as any).suspendedUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Group</p>
                    <Badge className={`${groupConfig[detailData.customer.group || 'regular']?.className} border-0`}>
                      {groupConfig[detailData.customer.group || 'regular']?.label}
                    </Badge>
                    {detailData.customer.groupDiscount > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">{detailData.customer.groupDiscount}% discount</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reward Points</p>
                    <p className="font-medium text-yellow-600">{detailData.customer.rewardPoints || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="font-medium">{detailData.customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="font-medium">৳{detailData.customer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{detailData.customer.lastLoginDate ? new Date(detailData.customer.lastLoginDate).toLocaleString() : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login IP</p>
                    <p className="font-medium">{detailData.customer.lastLoginIp || 'N/A'}</p>
                  </div>
                </div>
                {detailData.customer.address && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="font-medium">
                      {[detailData.customer.address.street, detailData.customer.address.city, detailData.customer.address.state, detailData.customer.address.zipCode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                {detailData.customer.loginHistory && detailData.customer.loginHistory.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Login Activity</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {detailData.customer.loginHistory.slice(0, 10).map((entry, i) => (
                        <div key={i} className="flex justify-between text-sm p-2 bg-muted rounded">
                          <span>{entry.ip || 'Unknown IP'}</span>
                          <span className="text-muted-foreground">{entry.device || 'Unknown'}</span>
                          <span className="text-muted-foreground">{new Date(entry.date).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders" className="space-y-3">
                {detailData.orders.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No orders yet</p>
                ) : (
                  detailData.orders.map((order: any) => (
                    <div key={order._id} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-muted/30">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">৳{order.total?.toLocaleString()}</p>
                          <Badge variant="outline" className="capitalize">{order.status}</Badge>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="p-3 space-y-2">
                          {order.items.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {item.image || item.thumbnail ? (
                                <img src={item.image || item.thumbnail} alt={item.name} className="w-8 h-8 rounded object-contain bg-muted" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="flex-1 truncate">{item.name}</span>
                              <span className="text-muted-foreground">x{item.quantity}</span>
                              <span className="font-medium">৳{item.price?.toLocaleString()}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-3">
                {detailData.reviews.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No reviews yet</p>
                ) : (
                  detailData.reviews.map((review: any) => (
                    <div key={review._id} className="p-3 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{review.productId?.name || 'Unknown Product'}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="points" className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="text-xl font-bold text-green-600">+{(detailData.customer as any).totalPointsEarned || 0}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Total Redeemed</p>
                    <p className="text-xl font-bold text-red-500">-{(detailData.customer as any).totalPointsRedeemed || 0}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="text-xl font-bold text-yellow-600">{detailData.customer.rewardPoints || 0}</p>
                  </div>
                </div>
                {detailData.customer.pointsHistory && detailData.customer.pointsHistory.length > 0 ? (
                  <div className="space-y-2">
                    {detailData.customer.pointsHistory.slice().reverse().map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{entry.type}</p>
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${entry.type === 'redeemed' ? 'text-red-500' : 'text-green-500'}`}>
                            {entry.type === 'redeemed' ? '-' : '+'}{entry.points}
                          </p>
                          <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No points history</p>
                )}
              </TabsContent>

              <TabsContent value="wishlist" className="space-y-3">
                {!(detailData.customer.wishlist as any[])?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Wishlist is empty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(detailData.customer.wishlist as any[]).map((item: any, idx: number) => (
                      <div key={item._id || idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="w-14 h-14 object-contain rounded bg-muted" />
                        ) : (
                          <div className="w-14 h-14 rounded bg-muted flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{item.name || 'Product'}</p>
                          {item.regularPrice && (
                            <p className="text-primary font-bold text-sm">৳{item.regularPrice?.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="addresses" className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Saved address book</p>
                  <Button size="sm" onClick={() => { setAddrForm(defaultAddrForm); setEditingAddrId(null); setAddrFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-1" /> Add Address
                  </Button>
                </div>
                {!(detailData.customer as any).addresses?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No addresses saved</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {((detailData.customer as any).addresses as CustomerAddress[]).map((addr) => (
                      <div key={addr._id} className={`p-3 border rounded-lg ${addr.isDefault ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-medium text-sm">{addr.label}</span>
                              {addr.isDefault && <Badge className="bg-primary/20 text-primary border-0 text-xs">Default</Badge>}
                              <Badge className={`border-0 text-xs ${addr.type === 'billing' ? 'bg-blue-100 text-blue-700' : addr.type === 'shipping' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {addr.type === 'both' ? 'Billing & Shipping' : addr.type}
                              </Badge>
                            </div>
                            {addr.name && <p className="text-sm">{addr.name} {addr.phone && `· ${addr.phone}`}</p>}
                            <p className="text-sm text-muted-foreground">
                              {[addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setAddrForm(addr); setEditingAddrId(addr._id!); setAddrFormOpen(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAddress(addr._id!)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                {/* Last Login Info */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Account Security</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Activated</p>
                      <p className="font-medium">{(detailData.customer as any).isActivated ? '✓ Yes' : '✗ No'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Login</p>
                      <p className="font-medium">{detailData.customer.lastLoginDate ? new Date(detailData.customer.lastLoginDate).toLocaleString() : 'Never'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last IP</p>
                      <p className="font-medium font-mono">{detailData.customer.lastLoginIp || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Login History with suspicious detection */}
                {detailData.customer.loginHistory && detailData.customer.loginHistory.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Login History</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {detailData.customer.loginHistory.slice().reverse().map((entry, i) => {
                        const knownIps = detailData.customer.loginHistory!.slice(0, 3).map(e => e.ip);
                        const isSuspicious = i < detailData.customer.loginHistory!.length - 3 && !knownIps.includes(entry.ip);
                        return (
                          <div key={i} className={`flex justify-between text-xs p-2 rounded ${isSuspicious ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200' : 'bg-muted'}`}>
                            <span className="font-mono">{entry.ip || 'Unknown'}</span>
                            <span className="text-muted-foreground">{entry.device || 'Unknown'}</span>
                            <span className="text-muted-foreground">{new Date(entry.date).toLocaleString()}</span>
                            {isSuspicious && <span className="text-orange-500 font-medium">⚠ New</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium mb-1">Reset Password</p>
                    <p className="text-xs text-muted-foreground mb-2">Generate a temporary password to share with customer</p>
                    <Button size="sm" variant="outline" onClick={handleResetPassword} disabled={securityLoading}>
                      <Key className="w-4 h-4 mr-2" />
                      {securityLoading ? 'Processing...' : 'Reset Password'}
                    </Button>
                    {tempPassword && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 text-sm">
                        <p className="text-muted-foreground text-xs">Temporary password (share with customer):</p>
                        <p className="font-mono font-bold text-yellow-700">{tempPassword}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium mb-1">Activation Link</p>
                    <p className="text-xs text-muted-foreground mb-2">Generate a one-time activation link for the customer</p>
                    <Button size="sm" variant="outline" onClick={handleSendActivation} disabled={securityLoading}>
                      <Link2 className="w-4 h-4 mr-2" />
                      Generate Link
                    </Button>
                    {activationLink && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 text-xs">
                        <p className="text-muted-foreground mb-1">Activation link:</p>
                        <p className="font-mono break-all text-blue-700">{activationLink}</p>
                        <Button size="sm" variant="ghost" className="mt-1 h-6 text-xs" onClick={() => { navigator.clipboard.writeText(activationLink); toast.success('Copied!'); }}>
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Message history sent to this customer</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetailOpen(false);
                      setMessageTarget(detailData.customer);
                      setMessageForm({ title: '', message: '', type: 'info' });
                      setMessageOpen(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    New Message
                  </Button>
                </div>
                {!(detailData.customer as any).notifications?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No messages sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {((detailData.customer as any).notifications as any[]).map((notif: any, idx: number) => (
                      <div key={notif._id || idx} className={`p-3 border rounded-lg ${!notif.read ? 'bg-primary/5 border-primary/30' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              notif.type === 'promo' ? 'bg-purple-100 text-purple-700' :
                              notif.type === 'warning' ? 'bg-red-100 text-red-700' :
                              notif.type === 'account' ? 'bg-blue-100 text-blue-700' :
                              'bg-muted text-muted-foreground'
                            }`}>{notif.type}</span>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {!notif.read && <span className="text-xs text-muted-foreground">Unread</span>}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Points Management Dialog */}
      <Dialog open={pointsOpen} onOpenChange={setPointsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Points - {pointsCustomer?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Current Points: <span className="font-bold text-yellow-600">{pointsCustomer?.rewardPoints || 0}</span></p>
          <form onSubmit={handleAddPoints} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={pointsForm.type}
                onChange={(e) => setPointsForm({ ...pointsForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
              >
                <option value="bonus">Bonus</option>
                <option value="earned">Earned</option>
                <option value="redeemed">Redeemed</option>
                <option value="adjusted">Adjusted</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input type="number" min={1} value={pointsForm.points} onChange={(e) => setPointsForm({ ...pointsForm, points: parseInt(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={pointsForm.description} onChange={(e) => setPointsForm({ ...pointsForm, description: e.target.value })} required placeholder="e.g. Birthday bonus" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPointsOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary">Add Points</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog (single customer) */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Message to {messageTarget?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                {MESSAGE_TEMPLATES.map((t) => (
                  <Button
                    key={t.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMessageForm({ ...messageForm, title: t.title, message: t.message })}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={messageForm.type}
                onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
              >
                <option value="info">Info</option>
                <option value="promo">Promo</option>
                <option value="warning">Warning</option>
                <option value="account">Account</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={messageForm.title}
                onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                placeholder="Message title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                placeholder="Write your message..."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMessageOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Message Dialog */}
      <Dialog open={bulkMessageOpen} onOpenChange={setBulkMessageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedIds.length} Customer(s)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkMessage} className="space-y-4">
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                {MESSAGE_TEMPLATES.map((t) => (
                  <Button
                    key={t.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMessageForm({ ...messageForm, title: t.title, message: t.message })}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={messageForm.type}
                onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
              >
                <option value="info">Info</option>
                <option value="promo">Promo</option>
                <option value="warning">Warning</option>
                <option value="account">Account</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={messageForm.title}
                onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                placeholder="Message title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                placeholder="Write your message..."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBulkMessageOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send to {selectedIds.length} Customer(s)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend Customer Dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Customer - {suspendCustomer?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Customer will be blocked until the chosen date, then automatically re-activated.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Suspended Until *</Label>
              <Input
                type="date"
                value={suspendDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSuspendDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSuspend}
              disabled={!suspendDate}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <CalendarClock className="w-4 h-4 mr-2" />
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Import Customers</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Paste CSV (with headers: Name,Email,Phone,Status,Group,GroupDiscount,City,Country) or JSON array.
            </p>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder=""
              rows={8}
              className="font-mono text-xs"
            />
            {importResult && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <p className="font-medium">Import Result:</p>
                <p className="text-green-600">✓ Imported: {importResult.imported}</p>
                <p className="text-muted-foreground">⊘ Skipped (duplicates): {importResult.skipped}</p>
                {importResult.errors.length > 0 && (
                  <div>
                    <p className="text-destructive">Errors:</p>
                    {importResult.errors.map((e, i) => <p key={i} className="text-xs text-destructive ml-2">{e}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Close</Button>
            <Button onClick={handleImport} disabled={importLoading || !importText.trim()} className="gradient-primary">
              <FileText className="w-4 h-4 mr-2" />
              {importLoading ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Form Dialog */}
      <Dialog open={addrFormOpen} onOpenChange={setAddrFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAddrId ? 'Edit Address' : 'Add Address'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Label</Label>
                <Input value={addrForm.label || ''} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="Home, Work..." />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <select value={addrForm.type || 'both'} onChange={e => setAddrForm({ ...addrForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm">
                  <option value="both">Billing & Shipping</option>
                  <option value="billing">Billing Only</option>
                  <option value="shipping">Shipping Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Contact Name</Label>
                <Input value={addrForm.name || ''} onChange={e => setAddrForm({ ...addrForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={addrForm.phone || ''} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Street</Label>
              <Input value={addrForm.street || ''} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={addrForm.city || ''} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input value={addrForm.state || ''} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Zip Code</Label>
                <Input value={addrForm.zipCode || ''} onChange={e => setAddrForm({ ...addrForm, zipCode: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input value={addrForm.country || 'Bangladesh'} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="addr-default" checked={!!addrForm.isDefault} onCheckedChange={v => setAddrForm({ ...addrForm, isDefault: !!v })} />
              <Label htmlFor="addr-default">Set as default address</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddrFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary" disabled={addrLoading}>{editingAddrId ? 'Update' : 'Add'} Address</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Group with Discount Dialog */}
      <Dialog open={groupDiscountOpen} onOpenChange={setGroupDiscountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Group - {groupDiscountCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Group</Label>
              <select
                value={groupForm.group}
                onChange={(e) => setGroupForm({ ...groupForm, group: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border"
              >
                {Object.entries(groupConfig).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Group Discount (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={groupForm.discount}
                onChange={(e) => setGroupForm({ ...groupForm, discount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Enter 0 for no discount</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDiscountOpen(false)}>Cancel</Button>
            <Button onClick={handleGroupChangeWithDiscount} className="gradient-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
