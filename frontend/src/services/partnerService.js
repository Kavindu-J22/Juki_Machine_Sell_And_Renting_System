import api from './api';

export const partnerService = {
  getPartnerDashboard: async (partnerName = '') => {
    const res = await api.get('/partners/dashboard', { params: { partnerName } });
    return res.data;
  },

  logCapitalDraw: async (data) => {
    const res = await api.post('/partners/capital-draw', data);
    return res.data;
  },

  getAuditStatement: async () => {
    const res = await api.get('/partners/audit-statement');
    return res.data;
  }
};
