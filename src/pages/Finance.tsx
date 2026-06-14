import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/portal/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Trash2,
  Download, Calendar, Calculator, Lightbulb, Briefcase, FileText,
  ArrowUpRight, ArrowDownRight, X, Loader2, ChevronLeft, ChevronRight,
  ShoppingCart, Package, Users, CreditCard, BarChart3, AlertTriangle,
  DollarSign, Receipt, FileDown, Eye,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6b7280", "#a855f7", "#06b6d4", "#84cc16"];

// ── Types ──
interface EcommDashboard {
  month: number;
  year: number;
  totalRevenue: number;
  paidRevenue: number;
  totalOrders: number;
  totalDiscount: number;
  totalDeliveryCharge: number;
  netProfit: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  lifetimeRevenue: number;
  lifetimePaid: number;
  lifetimeOrders: number;
  lifetimeDiscount: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  monthlyTrend: { label: string; month: string; year: number; revenue: number; paidRevenue: number; orders: number; discount: number; profit: number }[];
  dailyChart: { date: string; revenue: number; orders: number; paid: number }[];
  paymentPie: { name: string; value: number }[];
  categoryPie: { name: string; value: number }[];
  statusPie: { name: string; value: number }[];
  topProducts: { _id: string; name: string; totalQty: number; totalRevenue: number }[];
  topCustomers: { _id: string; name: string; email: string; phone?: string; totalOrders: number; totalSpent: number }[];
}

interface EcommReport {
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  totalDiscount: number;
  netProfit: number;
  statusCounts: Record<string, number>;
  paymentMethodBreakdown: Record<string, number>;
  topProducts: { _id: string; name: string; totalQty: number; totalRevenue: number }[];
  orders: {
    _id: string;
    orderNumber: string;
    customer: { name: string; email: string } | null;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    discount: number;
    itemCount: number;
    date: string;
  }[];
}

// ── BDT formatter ──
const formatBDT = (n: number) =>
  "৳" + n.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Status badge colors ──
const statusColor = (s: string) => {
  const m: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    out_for_delivery: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return m[s] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
};

// ── Zakat Calculator ──
function zakatCalc(totalAssets: number, goldValue: number, silverValue: number, cashSavings: number, debtsOwed: number) {
  const nisab = 595 * 10500;
  const netAssets = totalAssets + goldValue + silverValue + cashSavings - debtsOwed;
  const eligible = netAssets >= nisab;
  return { eligible, nisab, netAssets, zakat: eligible ? netAssets * 0.025 : 0 };
}

// ── EMI Calculator ──
function emiCalc(principal: number, rate: number, months: number) {
  if (principal <= 0 || rate <= 0 || months <= 0) return { emi: 0, total: 0, interest: 0 };
  const r = rate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  return { emi: Math.round(emi), total: Math.round(total), interest: Math.round(total - principal) };
}

const Finance = () => {
  // ── Ecommerce Dashboard State ──
  const [dashboard, setDashboard] = useState<EcommDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // ── Report State ──
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [report, setReport] = useState<EcommReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [csvDownloading, setCsvDownloading] = useState(false);

  // ── Zakat ──
  const [zakat, setZakat] = useState({ totalAssets: "", goldValue: "", silverValue: "", cashSavings: "", debtsOwed: "" });

  // ── EMI ──
  const [emi, setEmi] = useState({ principal: "", rate: "", months: "" });

  // ── Fetch ecommerce dashboard data ──
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/finance/dashboard`, {
        params: { month: currentMonth, year: currentYear },
      });
      if (data.success) setDashboard(data.dashboard);
    } catch {
      /* silent */
    }
    setLoading(false);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Generate ecommerce report ──
  const generateReport = async () => {
    if (!reportStart || !reportEnd) return;
    setReportLoading(true);
    try {
      const { data } = await axios.post(`${API}/finance/report`, {
        startDate: reportStart,
        endDate: reportEnd,
      });
      if (data.success) setReport(data.report);
    } catch {
      /* silent */
    }
    setReportLoading(false);
  };

  // ── Download PDF Report ──
  const downloadPDF = async () => {
    if (!reportStart || !reportEnd) return;
    setPdfDownloading(true);
    try {
      const response = await axios.get(`${API}/finance/report/pdf`, {
        params: { startDate: reportStart, endDate: reportEnd },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sholok_Finance_Report_${reportStart}_to_${reportEnd}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      /* silent */
    }
    setPdfDownloading(false);
  };

  // ── Download CSV ──
  const downloadCSV = async () => {
    if (!reportStart || !reportEnd) return;
    setCsvDownloading(true);
    try {
      const response = await axios.get(`${API}/finance/report/csv`, {
        params: { startDate: reportStart, endDate: reportEnd },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sholok_Report_${reportStart}_to_${reportEnd}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      /* silent */
    }
    setCsvDownloading(false);
  };

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const monthLabel = new Date(currentYear, currentMonth - 1).toLocaleString("en", { month: "long", year: "numeric" });

  const zakatResult = useMemo(() => {
    const v = (s: string) => parseFloat(s) || 0;
    return zakatCalc(v(zakat.totalAssets), v(zakat.goldValue), v(zakat.silverValue), v(zakat.cashSavings), v(zakat.debtsOwed));
  }, [zakat]);

  const emiResult = useMemo(() => {
    return emiCalc(parseFloat(emi.principal) || 0, parseFloat(emi.rate) || 0, parseFloat(emi.months) || 0);
  }, [emi]);

  // Growth % helpers
  const growth = (cur: number, prev: number) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const prevMonthData = dashboard?.monthlyTrend?.[dashboard.monthlyTrend.length - 2];
  const curMonthData = dashboard?.monthlyTrend?.[dashboard.monthlyTrend.length - 1];
  const revenueGrowth = prevMonthData && curMonthData ? growth(curMonthData.revenue, prevMonthData.revenue) : 0;
  const orderGrowth = prevMonthData && curMonthData ? growth(curMonthData.orders, prevMonthData.orders) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title + Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" /> Finance Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Ecommerce analytics, sales reports & financial tools</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm min-w-[140px] text-center">{monthLabel}</span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* ═══ Summary Cards ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue (Paid)</p>
                      <p className="text-xl font-bold text-green-600">{formatBDT(dashboard?.paidRevenue || 0)}</p>
                      {revenueGrowth !== 0 && (
                        <p className={`text-xs flex items-center gap-0.5 ${revenueGrowth > 0 ? "text-green-500" : "text-red-500"}`}>
                          {revenueGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {revenueGrowth > 0 ? "+" : ""}{revenueGrowth}% vs last month
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="text-xl font-bold text-blue-600">{dashboard?.totalOrders || 0}</p>
                      {orderGrowth !== 0 && (
                        <p className={`text-xs flex items-center gap-0.5 ${orderGrowth > 0 ? "text-green-500" : "text-red-500"}`}>
                          {orderGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {orderGrowth > 0 ? "+" : ""}{orderGrowth}% vs last month
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Profit</p>
                      <p className={`text-xl font-bold ${(dashboard?.netProfit || 0) >= 0 ? "text-purple-600" : "text-red-600"}`}>
                        {formatBDT(dashboard?.netProfit || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Discount: {formatBDT(dashboard?.totalDiscount || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Customers</p>
                      <p className="text-xl font-bold text-orange-600">{dashboard?.totalCustomers || 0}</p>
                      <p className="text-xs text-muted-foreground">{dashboard?.totalProducts || 0} products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ═══ Order Status Quick Stats ═══ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30">
                <div className="w-8 h-8 rounded-full bg-yellow-200 dark:bg-yellow-800/40 flex items-center justify-center text-xs font-bold text-yellow-700">
                  {dashboard?.pendingOrders || 0}
                </div>
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Pending</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
                <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-800/40 flex items-center justify-center text-xs font-bold text-green-700">
                  {dashboard?.deliveredOrders || 0}
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Delivered</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                <div className="w-8 h-8 rounded-full bg-red-200 dark:bg-red-800/40 flex items-center justify-center text-xs font-bold text-red-700">
                  {dashboard?.cancelledOrders || 0}
                </div>
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Cancelled</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30">
                <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-800/40 flex items-center justify-center text-xs font-bold text-purple-700">
                  {dashboard?.refundedOrders || 0}
                </div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Refunded</span>
              </div>
            </div>

            {/* Low stock warning */}
            {(dashboard?.lowStockProducts || 0) > 0 && (
              <div className="flex items-center gap-3 p-3 mb-6 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {dashboard?.lowStockProducts} product{(dashboard?.lowStockProducts || 0) > 1 ? "s" : ""} have low stock (less than 10 units)
                </span>
              </div>
            )}

            {/* ═══ Tabs ═══ */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="zakat">Zakat</TabsTrigger>
                <TabsTrigger value="emi">EMI</TabsTrigger>
              </TabsList>

              {/* ══════════ OVERVIEW TAB ══════════ */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 12-Month Revenue Trend */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> 12-Month Revenue Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dashboard?.monthlyTrend || []}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="label" fontSize={11} />
                          <YAxis fontSize={11} />
                          <Tooltip formatter={(v: number) => formatBDT(v)} />
                          <Legend />
                          <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" strokeWidth={2} />
                          <Area type="monotone" dataKey="profit" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Monthly Orders Bar */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Monthly Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dashboard?.monthlyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Daily Revenue This Month */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Daily Revenue ({monthLabel})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(dashboard?.dailyChart || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={dashboard?.dailyChart}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={11} />
                            <YAxis fontSize={11} />
                            <Tooltip formatter={(v: number, name: string) => name === "orders" ? v : formatBDT(v as number)} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue" />
                            <Line type="monotone" dataKey="paid" stroke="#3b82f6" strokeWidth={2} dot={false} name="Paid" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-muted-foreground py-16 text-sm">No data for this month yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment Method Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Payment Methods
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(dashboard?.paymentPie || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie data={dashboard?.paymentPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                              {(dashboard?.paymentPie || []).map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => formatBDT(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-muted-foreground py-16 text-sm">No payment data</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Order Status Pie */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(dashboard?.statusPie || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie data={dashboard?.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                              label={({ name, value }) => `${name} (${value})`}>
                              {(dashboard?.statusPie || []).map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-muted-foreground py-16 text-sm">No order data</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Lifetime Stats */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Lifetime Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                          <p className="text-lg font-bold text-green-600">{formatBDT(dashboard?.lifetimeRevenue || 0)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Paid Revenue</p>
                          <p className="text-lg font-bold text-blue-600">{formatBDT(dashboard?.lifetimePaid || 0)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                          <p className="text-xs text-muted-foreground mb-1">All Orders</p>
                          <p className="text-lg font-bold text-purple-600">{dashboard?.lifetimeOrders || 0}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Total Discount Given</p>
                          <p className="text-lg font-bold text-red-600">{formatBDT(dashboard?.lifetimeDiscount || 0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ══════════ PRODUCTS TAB ══════════ */}
              <TabsContent value="products">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Selling Products */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="w-4 h-4" /> Top Selling Products — {monthLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(dashboard?.topProducts || []).length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboard?.topProducts} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis type="number" fontSize={11} />
                              <YAxis type="category" dataKey="name" fontSize={10} width={150} />
                              <Tooltip formatter={(v: number) => formatBDT(v)} />
                              <Bar dataKey="totalRevenue" fill="#22c55e" radius={[0, 4, 4, 0]} name="Revenue" />
                            </BarChart>
                          </ResponsiveContainer>

                          <div className="mt-6 space-y-2 max-h-[400px] overflow-y-auto">
                            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
                              <span className="col-span-1">#</span>
                              <span className="col-span-5">Product Name</span>
                              <span className="col-span-3 text-right">Qty Sold</span>
                              <span className="col-span-3 text-right">Revenue</span>
                            </div>
                            {(dashboard?.topProducts || []).map((p, i) => (
                              <div key={p._id} className="grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg hover:bg-secondary/30 transition-colors border-b border-border/50">
                                <span className="col-span-1 text-sm font-bold text-muted-foreground">{i + 1}</span>
                                <span className="col-span-5 text-sm font-medium truncate">{p.name || "Unknown"}</span>
                                <span className="col-span-3 text-sm text-right">{p.totalQty} units</span>
                                <span className="col-span-3 text-sm text-right font-semibold text-green-600">{formatBDT(p.totalRevenue)}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-muted-foreground py-12 text-sm">No product sales data for this month</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Category Revenue */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Category Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(dashboard?.categoryPie || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie data={dashboard?.categoryPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                              innerRadius={50} outerRadius={100}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                              {(dashboard?.categoryPie || []).map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => formatBDT(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-muted-foreground py-16 text-sm">No category data</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Product Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Product Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-blue-500" />
                            <span className="text-sm">Total Products</span>
                          </div>
                          <span className="text-lg font-bold">{dashboard?.totalProducts || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span className="text-sm">Low Stock</span>
                          </div>
                          <span className="text-lg font-bold text-red-600">{dashboard?.lowStockProducts || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <span className="text-sm">Avg Revenue / Product</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {dashboard?.topProducts?.length ? formatBDT(Math.round(dashboard.topProducts.reduce((s, p) => s + p.totalRevenue, 0) / dashboard.topProducts.length)) : "৳0"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ══════════ CUSTOMERS TAB ══════════ */}
              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" /> Top Customers by Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(dashboard?.topCustomers || []).length > 0 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
                          <span className="col-span-1">#</span>
                          <span className="col-span-3">Name</span>
                          <span className="col-span-3">Email</span>
                          <span className="col-span-2 text-center">Orders</span>
                          <span className="col-span-3 text-right">Total Spent</span>
                        </div>
                        {(dashboard?.topCustomers || []).map((c, i) => (
                          <div key={c._id} className="grid grid-cols-12 gap-2 px-3 py-3 rounded-lg hover:bg-secondary/30 transition-colors border-b border-border/50 items-center">
                            <span className="col-span-1 text-sm font-bold text-muted-foreground">{i + 1}</span>
                            <span className="col-span-3 text-sm font-medium truncate">{c.name || "Unknown"}</span>
                            <span className="col-span-3 text-xs text-muted-foreground truncate">{c.email || "-"}</span>
                            <span className="col-span-2 text-sm text-center">
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                                {c.totalOrders}
                              </span>
                            </span>
                            <span className="col-span-3 text-sm text-right font-semibold text-green-600">{formatBDT(c.totalSpent)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-12 text-sm">No customer data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════ REPORT TAB ══════════ */}
              <TabsContent value="report">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Sales Report Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Date range selector */}
                    <div className="flex flex-wrap items-end gap-3 mb-6">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
                        <input type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)}
                          className="px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">End Date</label>
                        <input type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)}
                          className="px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <button onClick={generateReport} disabled={reportLoading || !reportStart || !reportEnd}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2">
                        {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Generate
                      </button>
                    </div>

                    {/* Download buttons */}
                    {reportStart && reportEnd && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        <button onClick={downloadPDF} disabled={pdfDownloading}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                          {pdfDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                          Download PDF
                        </button>
                        <button onClick={downloadCSV} disabled={csvDownloading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                          {csvDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Download CSV
                        </button>
                      </div>
                    )}

                    {/* Report data display */}
                    {report && (
                      <div className="space-y-6">
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-xs text-muted-foreground">Total Orders</p>
                            <p className="text-lg font-bold text-blue-600">{report.totalOrders}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-secondary">
                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                            <p className="text-lg font-bold">{formatBDT(report.totalRevenue)}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <p className="text-xs text-muted-foreground">Paid Revenue</p>
                            <p className="text-lg font-bold text-green-600">{formatBDT(report.paidRevenue)}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <p className="text-xs text-muted-foreground">Discount</p>
                            <p className="text-lg font-bold text-red-600">{formatBDT(report.totalDiscount)}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-xs text-muted-foreground">Net Profit</p>
                            <p className="text-lg font-bold text-purple-600">{formatBDT(report.netProfit)}</p>
                          </div>
                        </div>

                        {/* Order status breakdown */}
                        {Object.keys(report.statusCounts).length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Order Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(report.statusCounts).map(([status, count]) => (
                                <span key={status} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${statusColor(status)}`}>
                                  {status}: {count}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Payment method breakdown */}
                        {Object.keys(report.paymentMethodBreakdown).length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Payment Methods</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {Object.entries(report.paymentMethodBreakdown).map(([method, amount]) => (
                                <div key={method} className="p-3 rounded-lg bg-secondary">
                                  <p className="text-xs text-muted-foreground capitalize">{method.replace(/_/g, " ")}</p>
                                  <p className="text-sm font-bold">{formatBDT(amount)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Top products in range */}
                        {report.topProducts.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Top Products</h4>
                            <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                              {report.topProducts.map((p, i) => (
                                <div key={p._id} className="flex items-center justify-between p-2 rounded-lg border border-border text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                    <span className="truncate max-w-[200px]">{p.name || "Unknown"}</span>
                                    <span className="text-xs text-muted-foreground">({p.totalQty} sold)</span>
                                  </div>
                                  <span className="font-semibold text-green-600">{formatBDT(p.totalRevenue)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Order details table */}
                        {report.orders.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Order Details ({report.orders.length})</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b text-xs text-muted-foreground">
                                    <th className="text-left py-2 px-2">Order #</th>
                                    <th className="text-left py-2 px-2">Customer</th>
                                    <th className="text-right py-2 px-2">Total</th>
                                    <th className="text-center py-2 px-2">Status</th>
                                    <th className="text-center py-2 px-2">Payment</th>
                                    <th className="text-left py-2 px-2">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.orders.slice(0, 50).map((o) => (
                                    <tr key={o._id} className="border-b border-border/50 hover:bg-secondary/20">
                                      <td className="py-2 px-2 font-mono text-xs">{o.orderNumber || "-"}</td>
                                      <td className="py-2 px-2">{o.customer?.name || "-"}</td>
                                      <td className="py-2 px-2 text-right font-medium">{formatBDT(o.total)}</td>
                                      <td className="py-2 px-2 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(o.status)}`}>{o.status}</span>
                                      </td>
                                      <td className="py-2 px-2 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(o.paymentStatus)}`}>{o.paymentStatus}</span>
                                      </td>
                                      <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString("en-GB")}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {report.orders.length > 50 && (
                                <p className="text-xs text-muted-foreground text-center mt-2">Showing 50 of {report.orders.length} orders. Download PDF/CSV for full list.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════ ZAKAT TAB ══════════ */}
              <TabsContent value="zakat">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="w-4 h-4" /> Zakat Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">Calculate your yearly Zakat based on your total assets (2.5% of net wealth above Nisab)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {[
                        { key: "totalAssets", label: "Total Assets (৳)" },
                        { key: "goldValue", label: "Gold Value (৳)" },
                        { key: "silverValue", label: "Silver Value (৳)" },
                        { key: "cashSavings", label: "Cash & Savings (৳)" },
                        { key: "debtsOwed", label: "Debts Owed (৳)" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                          <input
                            type="number"
                            value={(zakat as any)[f.key]}
                            onChange={(e) => setZakat((z) => ({ ...z, [f.key]: e.target.value }))}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Net Assets</p>
                        <p className="text-lg font-bold">{formatBDT(zakatResult.netAssets)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Nisab Threshold</p>
                        <p className="text-lg font-bold">{formatBDT(zakatResult.nisab)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Eligible?</p>
                        <p className={`text-lg font-bold ${zakatResult.eligible ? "text-green-600" : "text-red-600"}`}>
                          {zakatResult.eligible ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                        <p className="text-xs text-muted-foreground">Zakat Due</p>
                        <p className="text-xl font-bold text-green-600">{formatBDT(zakatResult.zakat)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════ EMI TAB ══════════ */}
              <TabsContent value="emi">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="w-4 h-4" /> EMI Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">Calculate your monthly loan installment</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Loan Amount (৳)</label>
                        <input type="number" value={emi.principal} onChange={(e) => setEmi((v) => ({ ...v, principal: e.target.value }))}
                          placeholder="e.g. 500000"
                          className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Annual Interest (%)</label>
                        <input type="number" value={emi.rate} onChange={(e) => setEmi((v) => ({ ...v, rate: e.target.value }))}
                          placeholder="e.g. 12"
                          className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Tenure (months)</label>
                        <input type="number" value={emi.months} onChange={(e) => setEmi((v) => ({ ...v, months: e.target.value }))}
                          placeholder="e.g. 36"
                          className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <p className="text-xs text-muted-foreground">Monthly EMI</p>
                        <p className="text-xl font-bold text-blue-600">{formatBDT(emiResult.emi)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Total Payment</p>
                        <p className="text-lg font-bold">{formatBDT(emiResult.total)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <p className="text-xs text-muted-foreground">Total Interest</p>
                        <p className="text-lg font-bold text-red-600">{formatBDT(emiResult.interest)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Finance;
