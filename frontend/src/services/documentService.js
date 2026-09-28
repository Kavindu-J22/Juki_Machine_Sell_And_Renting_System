import api from './api';

export const documentService = {
  getAgreementDocument: async (rentalId) => {
    const response = await api.get(`/documents/agreement/${rentalId}`);
    return response.data;
  },

  getDeliveryNote: async (rentalId) => {
    const response = await api.get(`/documents/delivery-note/${rentalId}`);
    return response.data;
  },

  getQuotation: async (quotationData) => {
    const response = await api.post('/documents/quotation', quotationData);
    return response.data;
  },

  getReturnNote: async (rentalId) => {
    const response = await api.get(`/documents/return-note/${rentalId}`);
    return response.data;
  }
};
