import axios from 'axios';

// ✅ RESTAURADO: Apunta a /api para que el Login funcione
const API_URL = 'http://localhost:3000/api'; 

const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config.url && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('jwt_token');
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;