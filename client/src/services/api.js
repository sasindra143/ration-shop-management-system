import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || 'https://ration-shop-management-system.onrender.com/api';
if (!baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from storage on every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('rationUser');
  if (stored) {
    const { token } = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rationUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
