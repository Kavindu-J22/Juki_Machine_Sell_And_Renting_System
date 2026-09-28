import api from './api';

export const customerService = {
  getCustomers: async (q = '', status = '') => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (status) params.append('status', status);

    const response = await api.get(`/customers?${params.toString()}`);
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  }
};
