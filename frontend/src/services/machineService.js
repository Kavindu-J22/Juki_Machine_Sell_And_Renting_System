import api from './api';

export const machineService = {
  getMachines: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.sourceType) params.append('sourceType', filters.sourceType);
    if (filters.partnerShare) params.append('partnerShare', filters.partnerShare);
    if (filters.isPartnerMachine !== undefined) {
      params.append('isPartnerMachine', filters.isPartnerMachine);
    }
    if (filters.q) params.append('q', filters.q);

    const response = await api.get(`/machines?${params.toString()}`);
    return response.data;
  },

  getMachineById: async (id) => {
    const response = await api.get(`/machines/${id}`);
    return response.data;
  },

  searchBySerialNumber: async (serialNumber) => {
    const response = await api.get(`/machines/search?serialNumber=${encodeURIComponent(serialNumber)}`);
    return response.data;
  },

  createMachine: async (machineData) => {
    const response = await api.post('/machines', machineData);
    return response.data;
  },

  updateMachine: async (id, machineData) => {
    const response = await api.put(`/machines/${id}`, machineData);
    return response.data;
  },

  deleteMachine: async (id) => {
    const response = await api.delete(`/machines/${id}`);
    return response.data;
  },

  exportCsv: async () => {
    const response = await api.get('/machines/export/csv', { responseType: 'blob' });
    return response.data;
  },

  importCsv: async (items) => {
    const response = await api.post('/machines/import/csv', { items });
    return response.data;
  }
};
