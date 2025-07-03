export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register'
  },
  reports: {
    list: '/api/reports',
    create: '/api/reports',
    get: (id) => `/api/reports/${id}`,
    updateStatus: (id) => `/api/reports/${id}/status`
  }
};
