export interface User {
  id: number | string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  first_name?: string;
  last_name?: string;
  companyId?: string | null; // null = superadmin, string = empresa asignada
  companyName?: string; // Nombre de la empresa (para mostrar)
  active?: boolean; // Si el usuario está activo
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  active: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
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

export interface Distributor {
  id: string;
  name: string;
  logo: string;
}

export interface DistributorConfig {
  distributor: string;
  name: string;
  active: boolean;
  credentials: any;
  lastSync?: string | null;
  syncStats?: any;
}

export interface Supplier {
  id: string;
  name: string;
  active: boolean;
  columnMapping: ColumnMapping;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColumnMapping {
  // Campos del sistema -> columnas del Excel
  sku?: string; // Nombre de la columna en el Excel
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  vat?: string;
  // Campos adicionales que pueden venir del Excel
  [key: string]: string | undefined;
}
