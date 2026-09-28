import api from './api';

export const expenseService = {
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  getExpenses: async (expenseType = '', status = '') => {
    const params = new URLSearchParams();
    if (expenseType) params.append('expenseType', expenseType);
    if (status) params.append('status', status);

    const response = await api.get(`/expenses?${params.toString()}`);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};
