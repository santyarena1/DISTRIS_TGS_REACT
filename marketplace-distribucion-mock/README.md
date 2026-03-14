# Marketplace Distribución - Frontend Mock

Frontend completo con datos mock y persistencia local (localStorage). Listo para conectar con backend real más adelante.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

El build se generará en la carpeta `dist/`

### Preview del Build

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
marketplace-distribucion-mock/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/             # Componentes UI base (shadcn/ui)
│   │   ├── Header.tsx      # Header principal
│   │   ├── Sidebar.tsx     # Sidebar de filtros
│   │   ├── FilterBar.tsx   # Barra de filtros
│   │   ├── ProductGrid.tsx  # Grid de productos
│   │   ├── Cart.tsx        # Carrito de compras
│   │   └── PcBuilder.tsx   # Armador de PC
│   ├── context/            # Contextos de React
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── SettingsContext.tsx
│   │   └── PcBuilderContext.tsx
│   ├── pages/              # Páginas principales
│   │   ├── LoginPage.tsx
│   │   └── ConfigPage.tsx
│   ├── services/           # Capa de servicios
│   │   ├── apiClient.ts    # Interfaz del cliente API
│   │   ├── index.ts        # Exportación principal
│   │   ├── mock/           # Implementación mock
│   │   │   ├── mockData.ts # Datos mock
│   │   │   └── mockApi.ts  # API mock con localStorage
│   │   └── http/           # Placeholder para backend real
│   │       └── README.md
│   ├── types/              # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/              # Utilidades
│   │   └── cn.ts
│   ├── App.tsx             # Componente principal con rutas
│   ├── main.tsx             # Punto de entrada
│   └── index.css           # Estilos globales
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 Credenciales Mock

### Usuario Admin
- **Email:** `admin@tgs.com`
- **Password:** `password123`
- **Rol:** Admin (acceso a configuración)

### Usuario Regular
- **Email:** `user@tgs.com`
- **Password:** `password123`
- **Rol:** User

## 🎯 Funcionalidades

### ✅ Implementadas con Mock

- **Autenticación:** Login/Logout con persistencia de sesión
- **Catálogo de Productos:** 
  - Listado con paginación
  - Filtros por categoría, marca, distribuidor
  - Búsqueda por nombre/SKU
  - Ordenamiento (precio, nombre)
  - Visualización de precios (Final, Desglose, Medio IVA)
  - Conversión USD/ARS
- **Carrito de Compras:**
  - Agregar/remover productos
  - Actualizar cantidades
  - Agrupar por distribuidor
  - Generar mensaje WhatsApp
- **Armador de PC:**
  - Agregar componentes
  - Configurar margen de ganancia por item
  - Calcular presupuesto total
  - Copiar presupuesto al portapapeles
- **Configuración (Admin):**
  - Cotización dólar
  - Margen default
  - Configuración de distribuidores
  - Sincronización mock de productos

### 📦 Datos Mock

- **Productos:** ~25 productos realistas de diferentes categorías
- **Distribuidores:** newbytes, gruponucleo, tgs, elit, gamingcity
- **Persistencia:** Todos los datos se guardan en localStorage

## 🔄 Cómo Conectar el Backend Real

### Paso 1: Crear la implementación HTTP

Crea el archivo `src/services/http/httpApi.ts` que implemente la interfaz `ApiClient`:

```typescript
import axios from 'axios';
import { ApiClient, Product, User, AuthResponse, DistributorConfig } from '@/types';

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
  
  async me(): Promise<User> {
    const { data } = await httpClient.get<{ user: User }>('/auth/me');
    return data.user;
  },
  
  logout(): void {
    localStorage.removeItem('jwt_token');
  },
  
  async getProducts(params?: { limit?: number }): Promise<Product[]> {
    const { data } = await httpClient.get('/products', { params });
    return Array.isArray(data) ? data : data.products || [];
  },
  
  async getProduct(id: string): Promise<Product> {
    const { data } = await httpClient.get(`/products/${id}`);
    return data;
  },
  
  async getConfigs(): Promise<DistributorConfig[]> {
    const { data } = await httpClient.get('/config');
    return data;
  },
  
  async saveConfig(config: DistributorConfig): Promise<void> {
    await httpClient.post('/config', config);
  },
  
  async syncDistributor(distributor: string): Promise<any> {
    const { data } = await httpClient.post(`/sync/${distributor}`);
    return data;
  }
};
```

### Paso 2: Cambiar la exportación

En `src/services/index.ts`, cambia:

```typescript
// Antes (mock)
export const apiClient: ApiClient = mockApi;

// Después (HTTP)
import { httpApi } from './http/httpApi';
export const apiClient: ApiClient = httpApi;
```

### Paso 3: Configurar variables de entorno

Crea un archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

¡Listo! La aplicación ahora usará el backend real sin cambiar nada más en la UI.

## 🛠️ Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Ruteo
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes accesibles
- **Sonner** - Notificaciones toast
- **Lucide React** - Iconos

## 📝 Notas

- Todos los datos se persisten en `localStorage`
- Los delays de red están simulados (300-2000ms)
- La sincronización de distribuidores es mock pero actualiza datos
- El proyecto está listo para deploy en Vercel/Netlify (SPA routing)

## 🚢 Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Sube la carpeta dist/ a Netlify
```

**Importante:** Configura el redirect para SPA routing:
- **Vercel:** Crea `vercel.json` con redirects
- **Netlify:** Crea `_redirects` en `public/` con `/* /index.html 200`

## 📄 Licencia

Este proyecto es una reconstrucción mock del frontend original.


