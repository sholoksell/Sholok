import { useState, useEffect, useMemo } from 'react';
import { paymentApi, Payment } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search, MoreVertical, Eye, CheckCircle, XCircle, CreditCard, Clock,
  Download, RefreshCw, RotateCcw,
} from 'lucide-react';
import TakaIcon from '@/components/TakaIcon';

const statusConfig = {
  pending:  { label: 'Pending',   className: 'bg-warning/20 text-warning' },
  completed: { label: 'Completed', className: 'bg-success/20 text-success' },
  failed:   { label: 'Failed',    className: 'bg-destructive/20 text-destructive' },
  refunded: { label: 'Refunded',  className: 'bg-muted text-muted-foreground' },
  partially_refunded: { label: 'Part. Refunded', className: 'bg-chart-3/20 text-chart-3' },
};

const methodConfig: Record<string, { label: string; icon: string }> = {
  credit_card:       { label: 'Credit Card',       icon: '💳' },
  debit_card:        { label: 'Debit Card',         icon: '💳' },
  paypal:            { label: 'PayPal',             icon: '🅿️' },
  bank_transfer:     { label: 'Bank Transfer',      icon: '🏦' },
  cash_on_delivery:  { label: 'Cash on Delivery',   icon: '💵' },
  bkash:             { label: 'bKash',              icon: '📱' },
  nagad:             { label: 'Nagad',              icon: '📱' },
  rocket:            { label: 'Rocket',             icon: '📱' },
  sslcommerz:        { label: 'SSLCommerz',         icon: '🔒' },
  stripe:            { label: 'Stripe',             icon: '💳' },
};

const defaultCfg = { label: 'Unknown', className: 'bg-muted text-muted-foreground', icon: '?' };

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentApi.getAll();
      setPayments(data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch = payment.transactionId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const totalAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const handleUpdateStatus = async (paymentId: string, status: string) => {
    try {
      await paymentApi.updateStatus(paymentId, status);
      toast.success('Payment status updated');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openRefund = (payment: Payment) => {
    setRefundPayment(payment);
    setRefundAmount(String(payment.amount));
    setRefundReason('');
    setRefundType('full');
    setRefundOpen(true);
  };

  const handleRefund = async () => {
    if (!refundPayment) return;
    try {
      await paymentApi.refund(refundPayment._id, {
        refundAmount: refundType === 'full' ? refundPayment.amount : Number(refundAmount),
        refundType,
        refundReason,
        refundTo: 'original',
      });
      toast.success('Refund processed successfully');
      setRefundOpen(false);
      fetchPayments();
    } catch {
      toast.error('Failed to process refund');
    }
  };

  const handleVerify = async (paymentId: string) => {
    try {
      await paymentApi.verify(paymentId, true, 'Verified by admin');
      toast.success('Payment verified');
      fetchPayments();
    } catch {
      toast.error('Failed to verify payment');
    }
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const blob = await paymentApi.exportCsv({ status: statusFilter !== 'all' ? statusFilter : '', method: methodFilter !== 'all' ? methodFilter : '' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewPayment = async (payment: Payment) => {
    try {
      const fullPayment = await paymentApi.getById(payment._id);
      setViewPayment(fullPayment);
      setViewOpen(true);
    } catch (error) {
      toast.error('Failed to load payment details');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track and manage payment transactions</p>
        </div>
        <Button onClick={handleExportCsv} variant="outline" disabled={exportLoading}>
          {exportLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalPayments}</p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedPayments}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <TakaIcon className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">৳{totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Received</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">৳{pendingAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
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
                placeholder="Search by transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Part. Refunded</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="sslcommerz">SSLCommerz</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <span className="font-mono text-sm">{payment.transactionId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {typeof payment.orderId === 'object' ? payment.orderId.orderNumber : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {typeof payment.customerId === 'object' ? payment.customerId.name : 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">৳{payment.amount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <span>{(methodConfig[payment.method] || defaultCfg).icon}</span>
                          <span className="text-sm">{(methodConfig[payment.method] || defaultCfg).label}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${(statusConfig[payment.status] || defaultCfg).className} border-0`}>
                          {(statusConfig[payment.status] || defaultCfg).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPayment(payment)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {payment.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(payment._id, 'completed')}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVerify(payment._id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Verify Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(payment._id, 'failed')}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Mark Failed
                                </DropdownMenuItem>
                              </>
                            )}
                            {payment.status === 'completed' && (
                              <DropdownMenuItem onClick={() => openRefund(payment)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Issue Refund
                              </DropdownMenuItem>
                            )}
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

      {/* View Payment Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {viewPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium">{viewPayment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono font-medium">
                    {typeof viewPayment.orderId === 'object' ? viewPayment.orderId.orderNumber : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {typeof viewPayment.customerId === 'object' ? viewPayment.customerId.name : 'N/A'}
                  </p>
                  {typeof viewPayment.customerId === 'object' && (
                    <p className="text-sm">{viewPayment.customerId.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">৳{viewPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">
                    {(methodConfig[viewPayment.method] || defaultCfg).icon} {(methodConfig[viewPayment.method] || defaultCfg).label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${(statusConfig[viewPayment.status] || defaultCfg).className} border-0`}>
                    {(statusConfig[viewPayment.status] || defaultCfg).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(viewPayment.createdAt).toLocaleString()}</p>
                </div>
                {viewPayment.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid At</p>
                    <p className="font-medium">{new Date(viewPayment.paidAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {viewPayment.paymentDetails && Object.keys(viewPayment.paymentDetails).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Payment Details</h3>
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    {Object.entries(viewPayment.paymentDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewPayment.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm bg-secondary/50 p-3 rounded-lg">{viewPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Refund Dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          {refundPayment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Transaction</p>
                <p className="font-mono">{refundPayment.transactionId}</p>
                <p className="text-sm text-muted-foreground mt-1">Original Amount: <span className="font-semibold text-foreground">৳{refundPayment.amount.toLocaleString()}</span></p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Refund Type</label>
                <select value={refundType} onChange={e => setRefundType(e.target.value as 'full' | 'partial')} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground">
                  <option value="full">Full Refund</option>
                  <option value="partial">Partial Refund</option>
                </select>
              </div>
              {refundType === 'partial' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Refund Amount (৳)</label>
                  <Input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} max={refundPayment.amount} />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">Reason</label>
                <Input value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Reason for refund..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRefund}>Process Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
