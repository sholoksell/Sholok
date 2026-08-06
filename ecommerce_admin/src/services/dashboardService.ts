import api from '@/lib/axios';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  revenueByMonth: {
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }[];
  ordersByStatus: {
    _id: string;
    count: number;
  }[];
  topProducts: any[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },
};
