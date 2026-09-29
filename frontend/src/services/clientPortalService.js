import api from './api';

export const clientPortalService = {
  getClientDashboard: async (customerId = '') => {
    const res = await api.get('/client-portal/dashboard', { params: { customerId } });
    return res.data;
  },

  createServiceRequest: async (data) => {
    const res = await api.post('/client-portal/service-request', data);
    return res.data;
  }
};
