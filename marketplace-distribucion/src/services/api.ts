// src/services/api.ts
import axios from 'axios';

// Usamos el proxy configurado en vite.config.ts, así que la baseURL es relativa
const api = axios.create({
  baseURL: '/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de cada petición, inyecta el token si existe
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

// Interceptor: Si el backend devuelve 401 (Token inválido), cierra sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      // Opcional: Redirigir al login usando window.location o un evento
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;