import api from './api';

export const notificationService = {
  getAlerts: async () => {
    const response = await api.get('/notifications/alerts');
    return response.data;
  },

  sendEmailReminder: async (rentalId, recipientEmail = '') => {
    const response = await api.post('/notifications/send-reminder', {
      rentalId,
      recipientEmail
    });
    return response.data;
  }
};
