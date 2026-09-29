import api from './api';

export const salesLedgerService = {
  createDispatch: async (data) => {
    const res = await api.post('/sales-ledger', data);
    return res.data;
  },

  getDispatches: async (filters = {}) => {
    const res = await api.get('/sales-ledger', { params: filters });
    return res.data;
  },

  recordCollection: async (dispatchId, paymentData) => {
    const res = await api.post(`/sales-ledger/${dispatchId}/payment`, paymentData);
    return res.data;
  },

  getInvoiceById: async (dispatchId) => {
    const res = await api.get(`/sales-ledger/${dispatchId}`);
    return res.data;
  }
};
