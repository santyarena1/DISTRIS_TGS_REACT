export interface User {
  id: number | string;
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
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  imageUrl?: string | null;
  
  // ✅ AQUÍ ESTÁ LA CLAVE: Agregamos gamingcity
  distributorId: 'newbytes' | 'gruponucleo' | 'elit' | 'tgs' | 'gamingcity'; 
  
  vat?: number; // IVA opcional
}

export interface Distributor {
  id: string;
  name: string;
  logo: string;
}