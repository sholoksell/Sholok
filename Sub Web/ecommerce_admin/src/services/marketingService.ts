import api from '@/lib/axios';

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  usagePerCustomer: number;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  placement: 'homepage_top' | 'homepage_slider' | 'sidebar' | 'category' | 'popup';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingStats {
  totalCoupons: number;
  activeCoupons: number;
  totalBanners: number;
  activeBanners: number;
  totalRedemptions: number;
  activeFlashSales?: number;
}

export interface FlashSale {
  _id: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  badge?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  _id: string;
  title: string;
  subject: string;
  body: string;
  audience: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  sentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const marketingApi = {
  // Coupons
  getCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get('/marketing/coupons');
    return response.data;
  },
  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post('/marketing/coupons', data);
    return response.data;
  },
  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put(`/marketing/coupons/${id}`, data);
    return response.data;
  },
  deleteCoupon: async (id: string): Promise<void> => {
    await api.delete(`/marketing/coupons/${id}`);
  },

  // Banners
  getBanners: async (): Promise<Banner[]> => {
    const response = await api.get('/marketing/banners');
    return response.data;
  },
  createBanner: async (data: Partial<Banner>): Promise<Banner> => {
    const response = await api.post('/marketing/banners', data);
    return response.data;
  },
  updateBanner: async (id: string, data: Partial<Banner>): Promise<Banner> => {
    const response = await api.put(`/marketing/banners/${id}`, data);
    return response.data;
  },
  deleteBanner: async (id: string): Promise<void> => {
    await api.delete(`/marketing/banners/${id}`);
  },

  // Stats
  getStats: async (): Promise<MarketingStats> => {
    const response = await api.get('/marketing/stats');
    return response.data;
  },

  // Flash Sales
  getFlashSales: async (): Promise<FlashSale[]> => {
    const response = await api.get('/marketing/flash-sales');
    return response.data;
  },
  createFlashSale: async (data: Partial<FlashSale>): Promise<FlashSale> => {
    const response = await api.post('/marketing/flash-sales', data);
    return response.data;
  },
  updateFlashSale: async (id: string, data: Partial<FlashSale>): Promise<FlashSale> => {
    const response = await api.put(`/marketing/flash-sales/${id}`, data);
    return response.data;
  },
  deleteFlashSale: async (id: string): Promise<void> => {
    await api.delete(`/marketing/flash-sales/${id}`);
  },

  // Email Campaigns
  getEmailCampaigns: async (): Promise<EmailCampaign[]> => {
    const response = await api.get('/marketing/email-campaigns');
    return response.data;
  },
  createEmailCampaign: async (data: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    const response = await api.post('/marketing/email-campaigns', data);
    return response.data;
  },
  updateEmailCampaign: async (id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    const response = await api.put(`/marketing/email-campaigns/${id}`, data);
    return response.data;
  },
  deleteEmailCampaign: async (id: string): Promise<void> => {
    await api.delete(`/marketing/email-campaigns/${id}`);
  },
};
