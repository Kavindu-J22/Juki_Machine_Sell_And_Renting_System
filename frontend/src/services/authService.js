import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('juki_token', response.data.token);
      localStorage.setItem('juki_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register new user / staff (Admin only or setup)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get logged in user details
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Get list of users (Admin only)
  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('juki_token');
    localStorage.removeItem('juki_user');
  },

  // Get user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('juki_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
};
