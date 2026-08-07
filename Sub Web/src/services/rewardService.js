import api from '../lib/axios';

export const rewardService = {
  // Get my reward points with totals breakdown
  getMyPoints: async () => {
    try {
      const response = await api.get('/customer-auth/rewards');
      return response.data;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return { rewardPoints: 0, totalPointsEarned: 0, totalPointsRedeemed: 0, pointsHistory: [], group: 'regular', groupDiscount: 0 };
    }
  },
};
