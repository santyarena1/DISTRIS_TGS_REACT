# HTTP API Implementation (Placeholder)

Este directorio está preparado para cuando quieras conectar el backend real.

## Cómo implementar

1. Crea un archivo `httpApi.ts` que implemente la interfaz `ApiClient`
2. Usa axios o fetch para hacer las llamadas HTTP reales
3. En `services/index.ts`, cambia la exportación de `mockApi` a `httpApi`

Ejemplo de estructura:

```typescript
import axios from 'axios';
import { ApiClient, Product, User, AuthResponse } from '@/types';

const httpClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const httpApi: ApiClient = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await httpClient.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('jwt_token', data.token);
    }
    return data;
  },
  // ... resto de métodos
};
```

