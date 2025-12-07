// src/services/auth.service.ts
import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('jwt_token', data.token);
    }
    return data;
  },

  me: async (): Promise<User> => {
    // El endpoint /auth/me devuelve { user: ... } o directamente el user según tu controlador
    // Ajustaremos esto si el backend devuelve otra estructura.
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  }
};