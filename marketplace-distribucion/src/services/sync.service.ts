import api from './api';

export const syncService = {
  syncNewBytes: async () => {
    const response = await api.post('/sync/newbytes');
    return response.data;
  },

  syncGrupoNucleo: async () => {
    const response = await api.post('/sync/gruponucleo');
    return response.data;
  },

  syncElit: async () => {
    const response = await api.post('/sync/elit');
    return response.data;
  },

  syncGamingCity: async () => {
    const response = await api.post('/sync/gamingcity');
    return response.data;
  },

  // ✅ AGREGADO: Llamada al endpoint de TGS (XML Feed)
  syncTgs: async () => {
    const response = await api.post('/sync/tgs');
    return response.data;
  }
};