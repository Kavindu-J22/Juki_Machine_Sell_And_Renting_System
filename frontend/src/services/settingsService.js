import api from './api';

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },

  updateExchangeRate: async (usdToLkrRate) => {
    const response = await api.put('/settings/exchange-rate', { usdToLkrRate });
    return response.data;
  },

  getBackup: async () => {
    const response = await api.get('/settings/backup');
    return response.data;
  },

  restoreBackup: async (backupData) => {
    const response = await api.post('/settings/restore', backupData);
    return response.data;
  }
};
