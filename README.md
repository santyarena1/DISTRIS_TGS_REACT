# Documentación de APIs – Marketplace Distribución

Este documento reúne toda la información que necesita un desarrollador backend para entender cómo funcionan las APIs que consume el frontend y cómo integrar a los distribuidores. Incluye endpoints, tipos de datos, credenciales de prueba y configuración por distribuidor.

---

## Índice

1. [Resumen del sistema](#resumen-del-sistema)
2. [Base URL y autenticación](#base-url-y-autenticación)
3. [Credenciales de prueba (login)](#credenciales-de-prueba-login)
4. [Endpoints de la API](#endpoints-de-la-api)
5. [Tipos de datos (modelos)](#tipos-de-datos-modelos)
6. [Distribuidores y credenciales por proveedor](#distribuidores-y-credenciales-por-proveedor)
7. [Sincronización de distribuidores](#sincronización-de-distribuidores)
8. [Variables de entorno](#variables-de-entorno)

---

## Resumen del sistema

- **Frontend:** React + Vite (carpeta `marketplace-distribucion-mock`). Actualmente usa una API mock con `localStorage`; está preparado para conectar a un backend real vía `VITE_API_URL`.
- **Contrato:** El frontend espera un backend que exponga los endpoints descritos abajo. La interfaz TypeScript que debe cumplir el backend está en `marketplace-distribucion-mock/src/services/apiClient.ts`.
- **Distribuidores soportados:** `newbytes`, `gruponucleo`, `tgs`, `elit`, `gamingcity`. Cada uno puede tener credenciales distintas (token, user/password, user_id, o ninguno si es público).

---

## Base URL y autenticación

- **Base URL:** `process.env.VITE_API_URL` o por defecto `http://localhost:3000/api`.
- **Headers:** `Content-Type: application/json`.
- **Autenticación:** JWT en header:
  - `Authorization: Bearer <token>`
- El token se obtiene con `POST /auth/login` y el frontend lo guarda en `localStorage` como `jwt_token`. Todas las peticiones (excepto login) deben enviar este header.

---

## Credenciales de prueba (login)

Para probar el sistema y que el backend pueda validar usuarios:

| Rol         | Email               | Password   | Notas                          |
|------------|----------------------|------------|---------------------------------|
| Super Admin| `superadmin@tgs.com` | `password123` | Acceso total, sin empresa      |
| Admin      | `admin@tgs.com`      | `password123` | Acceso a configuración, empresa `emp-001` |
| User       | `user@tgs.com`       | `password123` | Usuario estándar, empresa `emp-001` |
| Admin 2    | `admin2@digital.com`  | `password123` | Admin de empresa `emp-002`     |
| User 2     | `user2@digital.com`  | `password123` | User empresa `emp-002`         |
| User 3     | `user3@gaming.com`   | `password123` | User empresa `emp-003`         |

**Importante:** En el mock, cualquier usuario válido acepta la contraseña `password123`. El backend real debe implementar su propia lógica de contraseñas.

---

## Endpoints de la API

### Autenticación

| Método | Ruta           | Auth | Descripción |
|--------|----------------|------|-------------|
| POST   | `/auth/login`  | No   | Login. Body: `{ email, password }`. Devuelve `{ token, user }`. |
| GET    | `/auth/me`     | Sí   | Usuario actual. Respuesta: `{ user: User }`. |

### Productos

| Método | Ruta            | Auth | Descripción |
|--------|-----------------|------|-------------|
| GET    | `/products`     | Sí   | Listado. Query: `limit` (opcional). Respuesta: array de `Product` o `{ products: Product[] }`. |
| GET    | `/products/:id` | Sí   | Detalle de un producto. Respuesta: `Product`. |

### Configuración (admin) – distribuidores

| Método | Ruta    | Auth | Descripción |
|--------|---------|------|-------------|
| GET    | `/config`       | Sí   | Lista de configuraciones de distribuidores. Respuesta: `DistributorConfig[]`. |
| POST   | `/config`       | Sí   | Crear/actualizar configuración. Body: `DistributorConfig`. |
| POST   | `/sync/:distributor` | Sí | Sincronizar productos de un distribuidor. Ej: `POST /sync/newbytes`. Respuesta: `{ success, message?, stats?: { total, processed, created, updated } }`. |

### Usuarios

| Método | Ruta        | Auth | Descripción |
|--------|-------------|------|-------------|
| GET    | `/users`    | Sí   | Lista de usuarios. Respuesta: `User[]`. |
| GET    | `/users/:id`| Sí   | Usuario por id. Respuesta: `User`. |
| POST   | `/users`    | Sí   | Crear usuario. Body: `Omit<User, 'id' \| 'createdAt' \| 'updatedAt'>`. |
| PATCH/PUT | `/users/:id` | Sí | Actualizar usuario. Body: `Partial<User>`. |
| DELETE | `/users/:id` | Sí | Eliminar usuario. |

### Empresas

| Método | Ruta       | Auth | Descripción |
|--------|------------|------|-------------|
| GET    | `/companies`   | Sí   | Lista de empresas. Respuesta: `Company[]`. |
| POST   | `/companies`   | Sí   | Crear empresa. Body: `Omit<Company, 'id' \| 'createdAt'>`. |

### Proveedores (Suppliers) – importación Excel

| Método | Ruta        | Auth | Descripción |
|--------|-------------|------|-------------|
| GET    | `/suppliers`     | Sí   | Lista de proveedores. Respuesta: `Supplier[]`. |
| GET    | `/suppliers/:id` | Sí   | Proveedor por id. Respuesta: `Supplier`. |
| POST   | `/suppliers`     | Sí   | Crear proveedor. Body: `Omit<Supplier, 'id' \| 'createdAt' \| 'updatedAt'>`. |
| PATCH/PUT | `/suppliers/:id` | Sí | Actualizar proveedor. Body: `Partial<Supplier>`. |
| DELETE | `/suppliers/:id` | Sí | Eliminar proveedor. |

*Nota: La importación desde Excel (`parseExcelFile`, `importProductsFromExcel`) se hace en el frontend; el backend solo necesita exponer CRUD de proveedores y productos si se quiere persistir en servidor.*

---

## Tipos de datos (modelos)

### User

```ts
{
  id: number | string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  first_name?: string;
  last_name?: string;
  companyId?: string | null;   // null = superadmin
  companyName?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### AuthResponse

```ts
{ token: string; user: User; }
```

### Product

```ts
{
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  imageUrl?: string | null;
  distributorId: 'newbytes' | 'gruponucleo' | 'elit' | 'tgs' | 'gamingcity';
  vat?: number;
}
```

### DistributorConfig

```ts
{
  distributor: string;   // id: newbytes | gruponucleo | tgs | elit | gamingcity
  name: string;
  active: boolean;
  credentials: {
    token?: string;
    user_id?: string;
    user?: string;
    password?: string;
    [key: string]: string | undefined;
  };
  lastSync?: string | null;   // ISO date
  syncStats?: { total?: number; processed?: number; created?: number; updated?: number; };
}
```

### Company

```ts
{
  id: string;
  name: string;
  active: boolean;
  createdAt?: string;
}
```

### Supplier

```ts
{
  id: string;
  name: string;
  active: boolean;
  columnMapping: ColumnMapping;
  createdAt?: string;
  updatedAt?: string;
}
```

### ColumnMapping (mapeo Excel → Product)

```ts
{
  sku?: string;
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  vat?: string;
  [key: string]: string | undefined;
}
```

---

## Distribuidores y credenciales por proveedor

El frontend muestra campos de credenciales según el distribuidor. El backend debe guardar y usar estas credenciales al sincronizar (`POST /sync/:distributor`).

| Distribuidor   | Tipo de conexión     | Credenciales que usa el frontend | Notas |
|----------------|----------------------|-----------------------------------|--------|
| **newbytes**   | API con token        | `credentials.token`               | Token API. |
| **elit**       | API con token + user | `credentials.token`, `credentials.user_id` | Token + User ID. |
| **gruponucleo**| User / Password      | `credentials.user`, `credentials.password`  | Usuario y contraseña. |
| **tgs**        | Feed XML             | Ninguna (o las que definas)      | Stock desde `thegamershop.com.ar/feed...`. El frontend indica “Presiona Sincronizar para actualizar”. |
| **gamingcity** | Público / Scraping   | Ninguna                           | El frontend indica “Modo Scraping”, público. |

Resumen para backend:

- **newbytes:** usar `config.credentials.token` en las llamadas a la API del distribuidor.
- **elit:** usar `config.credentials.token` y `config.credentials.user_id`.
- **gruponucleo:** usar `config.credentials.user` y `config.credentials.password` (ej. Basic Auth o login).
- **tgs:** conectar al feed XML de thegamershop.com.ar; no se piden credenciales en la UI pero puedes guardar opciones extra en `credentials` si lo necesitas.
- **gamingcity:** sin credenciales en la UI; scraping o API pública.

Los valores se guardan en `DistributorConfig.credentials` por distribuidor (por ejemplo al guardar desde la pantalla de Configuración → Distribuidores).

### Credenciales por distribuidor (valores a configurar)

Rellenar con los valores reales que entrega cada distribuidor. El backend debe leer estos valores desde `DistributorConfig.credentials` al ejecutar `POST /sync/:distributor`.

| Distribuidor    | Campo en `credentials` | Descripción           | Valor real / ejemplo   |
|----------------|-------------------------|------------------------|-------------------------|
| **newbytes**   | `token`                 | Token API New Bytes   | *(pedir a New Bytes)*  |
| **elit**       | `token`                 | Token API Elit        | *(pedir a Elit)*        |
| **elit**       | `user_id`               | User ID / cliente     | *(pedir a Elit)*        |
| **gruponucleo**| `user`                  | Usuario / login       | *(pedir a Grupo Nucleo)* |
| **gruponucleo**| `password`              | Contraseña            | *(pedir a Grupo Nucleo)* |
| **tgs**        | —                       | Feed XML público      | No requiere credenciales |
| **gamingcity**| —                       | Scraping público      | No requiere credenciales |

**Ejemplo de objeto `credentials` por distribuidor (para el backend):**

```json
{
  "newbytes": {
    "token": "REEMPLAZAR_CON_TOKEN_REAL_DE_NEWBYTES"
  },
  "elit": {
    "token": "REEMPLAZAR_CON_TOKEN_REAL_DE_ELIT",
    "user_id": "REEMPLAZAR_CON_USER_ID_DE_ELIT"
  },
  "gruponucleo": {
    "user": "REEMPLAZAR_CON_USUARIO_GRUPONUCLEO",
    "password": "REEMPLAZAR_CON_PASSWORD_GRUPONUCLEO"
  },
  "tgs": {},
  "gamingcity": {}
}
```

Cuando tengas los valores reales (token de New Bytes, token y user_id de Elit, user y password de Grupo Nucleo), configurarlos en la pantalla **Configuración → pestaña Distribuidores** del frontend, o guardarlos vía `POST /config`. El backend debe persistir y usar esas credenciales en cada sincronización.

---

## Sincronización de distribuidores

- **Endpoint:** `POST /sync/:distributor`  
  Ejemplos: `POST /sync/newbytes`, `POST /sync/elit`, `POST /sync/gamingcity`.

- **Comportamiento esperado:**
  1. El backend lee la configuración del distribuidor (incluidas credenciales) desde su almacenamiento (ej. tabla `config` o equivalente).
  2. Según el distribuidor, llama a la API/feed del proveedor (o ejecuta el proceso de scraping).
  3. Actualiza o inserta productos en la base de datos (modelo `Product`, con `distributorId` = id del distribuidor).
  4. Opcionalmente actualiza `lastSync` y `syncStats` en la configuración del distribuidor.

- **Respuesta sugerida:**

```json
{
  "success": true,
  "message": "Sincronización de newbytes completada",
  "stats": {
    "total": 150,
    "processed": 150,
    "created": 10,
    "updated": 140
  }
}
```

El frontend muestra “Última Sync” y estadísticas en la pestaña Distribuidores de Configuración; si el backend persiste `lastSync` y `syncStats` en `DistributorConfig`, al hacer `GET /config` se reflejarán ahí.

---

## Variables de entorno

En el frontend (Vite):

- `VITE_API_URL`: URL base del API. Ejemplo: `http://localhost:3000/api`.

El backend puede usar sus propias variables para cada distribuidor (URLs de API, feeds, etc.); el frontend solo envía y almacena lo que el usuario ingresa en `credentials` (token, user, password, user_id) vía `GET/POST /config`.

---

## Referencia rápida de archivos del frontend

- Contrato de API: `marketplace-distribucion-mock/src/services/apiClient.ts`
- Tipos: `marketplace-distribucion-mock/src/types/index.ts`
- Implementación mock (ejemplo de uso): `marketplace-distribucion-mock/src/services/mock/mockApi.ts`
- Pantalla de configuración y credenciales por distribuidor: `marketplace-distribucion-mock/src/pages/ConfigPage.tsx`
- README del proyecto mock: `marketplace-distribucion-mock/README.md`

Con esta documentación y las credenciales de prueba, un desarrollador backend puede implementar la API y la lógica de cada distribuidor sin necesidad de revisar todo el código del frontend.
