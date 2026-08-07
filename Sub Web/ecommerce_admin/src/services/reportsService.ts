import api from '@/lib/axios';

export interface SalesReport {
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number };
  salesByDay: { _id: string; revenue: number; orders: number }[];
  salesByCategory: { _id: string; revenue: number; quantity: number }[];
  salesByPaymentMethod: { _id: string; revenue: number; count: number }[];
}

export interface OrdersReport {
  ordersByStatus: { _id: string; count: number }[];
  ordersByPaymentStatus: { _id: string; count: number }[];
  cancelledOrders: number;
  refundedOrders: number;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  topCustomers: { _id: any; totalSpent: number; orderCount: number }[];
}

export interface ProductReport {
  topSelling: { _id: string; productName: string; totalQuantity: number; totalRevenue: number }[];
  lowStock: { _id: string; name: string; stock: number; price: number; images: string[] }[];
  outOfStock: number;
  totalProducts: number;
}

export interface ReportsOverview {
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  monthOrders: number;
  pendingOrders: number;
  processingOrders: number;
}

export interface FinanceReport {
  revenue: number;
  shippingRevenue: number;
  discounts: number;
  refunds: number;
  pendingPayments: number;
  netRevenue: number;
  paymentMethodBreakdown: { _id: string; revenue: number; count: number }[];
}

export interface StockReport {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  totalStockValue: number;
  lowStockItems: { _id: string; name: string; stock: number; price: number; images: string[] }[];
  categoryStockSummary: { _id: string; totalStock: number; totalValue: number }[];
}

export const reportsApi = {
  getSales: async (period?: string): Promise<SalesReport> => {
    const response = await api.get('/reports/sales', { params: { period } });
    return response.data;
  },
  getOrders: async (): Promise<OrdersReport> => {
    const response = await api.get('/reports/orders');
    return response.data;
  },
  getCustomers: async (): Promise<CustomerReport> => {
    const response = await api.get('/reports/customers');
    return response.data;
  },
  getProducts: async (): Promise<ProductReport> => {
    const response = await api.get('/reports/products');
    return response.data;
  },
  getOverview: async (): Promise<ReportsOverview> => {
    const response = await api.get('/reports/overview');
    return response.data;
  },
  getFinance: async (period?: string): Promise<FinanceReport> => {
    const response = await api.get('/reports/finance', { params: { period } });
    return response.data;
  },
  getStock: async (): Promise<StockReport> => {
    const response = await api.get('/reports/stock');
    return response.data;
  },
  exportSalesCsv: async (period?: string): Promise<Blob> => {
    const response = await api.get('/reports/export/sales', { params: { period }, responseType: 'blob' });
    return response.data;
  },
};
