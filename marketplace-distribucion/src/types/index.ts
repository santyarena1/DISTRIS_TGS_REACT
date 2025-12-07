// src/types/index.ts

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: string; // Usamos string para compatibilidad (sku o uuid)
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  imageUrl?: string;
  distributorId: 'newbytes' | 'gruponucleo' | 'elit' | 'tgs'; // Identificador del proveedor
}

export interface Distributor {
  id: string;
  name: string;
  logo: string;
}