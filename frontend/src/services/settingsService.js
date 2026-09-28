import api from './api';

export const settingsService = {
  // Fetch company settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update company settings (Admin only)
  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  }
};
