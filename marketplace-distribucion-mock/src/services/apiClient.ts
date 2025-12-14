/**
 * Interfaz del cliente API
 * Esta es la capa de abstracción que define los contratos
 * Las implementaciones mock y http deben cumplir con esta interfaz
 */

import type { Product, User, AuthResponse, DistributorConfig, Company, Supplier, ColumnMapping } from '../types';

export interface ApiClient {
  // Auth
  login(email: string, password: string): Promise<AuthResponse>;
  me(): Promise<User>;
  logout(): void;

  // Products
  getProducts(params?: { limit?: number }): Promise<Product[]>;
  getProduct(id: string): Promise<Product>;

  // Config (Admin)
  getConfigs(): Promise<DistributorConfig[]>;
  saveConfig(config: DistributorConfig): Promise<void>;
  syncDistributor(distributor: string): Promise<any>;

  // Users Management
  getUsers(): Promise<User[]>;
  getUser(id: string | number): Promise<User>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string | number, user: Partial<User>): Promise<User>;
  deleteUser(id: string | number): Promise<void>;

  // Companies
  getCompanies(): Promise<Company[]>;
  createCompany(company: Omit<Company, 'id' | 'createdAt'>): Promise<Company>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier>;
  createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  parseExcelFile(file: File): Promise<{ columns: string[]; sampleData: any[]; headerRow?: number }>;
  importProductsFromExcel(supplierId: string, file: File): Promise<Product[]>;
}
