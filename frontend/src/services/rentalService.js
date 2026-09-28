import api from './api';

export const rentalService = {
  getRentals: async (status = '', customerId = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (customerId) params.append('customerId', customerId);

    const response = await api.get(`/rentals?${params.toString()}`);
    return response.data;
  },

  getRentalById: async (id) => {
    const response = await api.get(`/rentals/${id}`);
    return response.data;
  },

  createRental: async (rentalData) => {
    const response = await api.post('/rentals', rentalData);
    return response.data;
  },

  returnRental: async (rentalId) => {
    const response = await api.post(`/rentals/${rentalId}/return`);
    return response.data;
  }
};
