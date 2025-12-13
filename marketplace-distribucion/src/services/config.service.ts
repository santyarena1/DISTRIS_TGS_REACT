import api from './api';

export interface DistributorConfig {
  distributor: string;
  name: string;
  active: boolean;
  credentials: any; 
}

export const configService = {
  // ✅ CORREGIDO: Usamos '/config' (sin /api extra)
  // Resultado final: http://localhost:3000/api/config
  getAll: async () => {
    const response = await api.get<DistributorConfig[]>('/config');
    return response.data;
  },

  save: async (config: DistributorConfig) => {
    const response = await api.post('/config', config);
    return response.data;
  }
};