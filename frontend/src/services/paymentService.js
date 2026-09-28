import api from './api';

export const paymentService = {
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  getPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getCustomerPayments: async (customerId) => {
    const response = await api.get(`/payments/customer/${customerId}`);
    return response.data;
  }
};
