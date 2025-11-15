// This will be the single source of truth for your backend URL
// For Vercel, we will set REACT_APP_API_URL to your Render URL.
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    googleLogin: '/api/auth/google-login',
    adminLogin: '/api/auth/admin-login'
  },
  reports: {
    list: '/api/reports',
    create: '/api/reports',
    get: (id) => `/api/reports/${id}`,
    update: (id) => `/api/reports/${id}`,
    delete: (id) => `/api/reports/${id}`,
    notifications: '/api/reports/notifications',
    readNotification: (id) => `/api/reports/notifications/${id}/read`,
  },
  admin: {
    allReports: '/api/admin/all-reports',
    approveMatch: '/api/admin/approve-match',
    deleteReport: (id) => `/api/admin/report/${id}`,
  },
  users: {
    profile: '/api/users/profile'
  }
};

// Export the base URL to be used by axios and socket.io
export default API_BASE_URL;