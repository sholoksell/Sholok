import api from '../lib/axios';

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/customer-auth/notifications');
    return response.data;
  },

  markRead: async (notifId) => {
    const response = await api.patch(`/customer-auth/notifications/${notifId}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.patch('/customer-auth/notifications/read-all');
    return response.data;
  },
};
