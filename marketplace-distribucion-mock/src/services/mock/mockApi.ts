/**
 * Mock API Implementation
 * Simula llamadas al backend con delays y persistencia en localStorage
 */

import type { Product, User, AuthResponse, DistributorConfig, Company, Supplier, ColumnMapping } from '../../types';
import { mockUsers, mockProducts, mockCompanies } from './mockData';
import * as XLSX from 'xlsx';

// Simular delay de red
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'mock_products',
  CONFIGS: 'mock_configs',
  USERS: 'mock_users',
  COMPANIES: 'mock_companies',
  SUPPLIERS: 'mock_suppliers',
  TOKEN: 'jwt_token'
};

// Inicializar datos en localStorage si no existen
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIGS)) {
    localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(mockCompanies));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify([]));
  }
};

initStorage();

// Helper para obtener productos del storage
const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return stored ? JSON.parse(stored) : mockProducts;
};

// Helper para guardar productos
const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

// Helper para obtener configs
const getConfigs = (): DistributorConfig[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONFIGS);
  return stored ? JSON.parse(stored) : [];
};

// Helper para guardar configs
const saveConfigs = (configs: DistributorConfig[]) => {
  localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
};

// Helper para obtener usuarios del storage
const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  return stored ? JSON.parse(stored) : mockUsers;
};

// Helper para guardar usuarios
const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Helper para obtener empresas del storage
const getCompanies = (): Company[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  return stored ? JSON.parse(stored) : mockCompanies;
};

// Helper para guardar empresas
const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
};

// Helper para obtener proveedores del storage
const getSuppliers = (): Supplier[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
  return stored ? JSON.parse(stored) : [];
};

// Helper para guardar proveedores
const saveSuppliers = (suppliers: Supplier[]) => {
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
};

export const mockApi = {
  // ========== AUTH ==========
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(800);
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user || password !== 'password123' || !user.active) {
      throw new Error('Credenciales inválidas');
    }

    const token = `mock_token_${Date.now()}_${user.id}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    return {
      token,
      user
    };
  },

  async me(): Promise<User> {
    await delay(300);
    
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      throw new Error('No autenticado');
    }

    // Simular extracción de user ID del token (formato: mock_token_timestamp_userId)
    const match = token.match(/_(\d+)$/);
    const userId = match ? Number(match[1]) : 1;
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // ========== PRODUCTS ==========
  async getProducts(params?: { limit?: number }): Promise<Product[]> {
    await delay(600);
    
    let products = getProducts();
    
    if (params?.limit) {
      products = products.slice(0, params.limit);
    }

    return products;
  },

  async getProduct(id: string): Promise<Product> {
    await delay(400);
    
    const products = getProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return product;
  },

  // ========== CONFIG ==========
  async getConfigs(): Promise<DistributorConfig[]> {
    await delay(400);
    return getConfigs();
  },

  async saveConfig(config: DistributorConfig): Promise<void> {
    await delay(500);
    
    const configs = getConfigs();
    const index = configs.findIndex(c => c.distributor === config.distributor);
    
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    
    saveConfigs(configs);
  },

  async syncDistributor(distributor: string): Promise<any> {
    await delay(2000); // Simular proceso largo de sincronización
    
    // Simular actualización de algunos productos
    const products = getProducts();
    const distributorProducts = products.filter(p => p.distributorId === distributor);
    
    // Simular cambios de stock aleatorios
    distributorProducts.forEach(product => {
      if (Math.random() > 0.5) {
        product.stock = Math.max(0, product.stock + Math.floor(Math.random() * 5) - 2);
      }
    });
    
    saveProducts(products);
    
    // Actualizar config con última sync
    const configs = getConfigs();
    const configIndex = configs.findIndex(c => c.distributor === distributor);
    const syncStats = {
      total: distributorProducts.length,
      processed: distributorProducts.length,
      created: 0,
      updated: distributorProducts.length
    };
    
    if (configIndex >= 0) {
      configs[configIndex].lastSync = new Date().toISOString();
      configs[configIndex].syncStats = syncStats;
    } else {
      configs.push({
        distributor,
        name: distributor,
        active: true,
        credentials: {},
        lastSync: new Date().toISOString(),
        syncStats
      });
    }
    
    saveConfigs(configs);
    
    return {
      success: true,
      message: `Sincronización de ${distributor} completada`,
      stats: syncStats
    };
  },

  // ========== USERS MANAGEMENT ==========
  async getUsers(): Promise<User[]> {
    await delay(400);
    const users = getUsers();
    // El filtrado por empresa se hace en el frontend según el rol del usuario actual
    // Esto permite que el superadmin vea todos y el admin solo los de su empresa
    return users;
  },

  async getUser(id: string | number): Promise<User> {
    await delay(300);
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await delay(600);
    const users = getUsers();
    const newId = Math.max(...users.map(u => typeof u.id === 'number' ? u.id : 0), 0) + 1;
    const company = getCompanies().find(c => c.id === userData.companyId);
    const newUser: User = {
      ...userData,
      id: newId,
      companyName: company?.name || (userData.companyId === null ? 'Sistema' : 'Sin empresa'),
      active: userData.active !== undefined ? userData.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  async updateUser(id: string | number, userData: Partial<User>): Promise<User> {
    await delay(500);
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }
    const company = userData.companyId !== undefined 
      ? getCompanies().find(c => c.id === userData.companyId)
      : null;
    users[index] = {
      ...users[index],
      ...userData,
      companyName: company?.name || (userData.companyId === null ? 'Sistema' : users[index].companyName),
      updatedAt: new Date().toISOString()
    };
    saveUsers(users);
    return users[index];
  },

  async deleteUser(id: string | number): Promise<void> {
    await delay(400);
    const users = getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) {
      throw new Error('Usuario no encontrado');
    }
    saveUsers(filtered);
  },

  // ========== COMPANIES ==========
  async getCompanies(): Promise<Company[]> {
    await delay(300);
    return getCompanies();
  },

  async createCompany(companyData: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    await delay(500);
    const companies = getCompanies();
    const newId = `emp-${String(companies.length + 1).padStart(3, '0')}`;
    const newCompany: Company = {
      ...companyData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    companies.push(newCompany);
    saveCompanies(companies);
    return newCompany;
  },

  // ========== SUPPLIERS ==========
  async getSuppliers(): Promise<Supplier[]> {
    await delay(400);
    return getSuppliers();
  },

  async getSupplier(id: string): Promise<Supplier> {
    await delay(300);
    const suppliers = getSuppliers();
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) {
      throw new Error('Proveedor no encontrado');
    }
    return supplier;
  },

  async createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    await delay(500);
    const suppliers = getSuppliers();
    const newId = `supplier-${Date.now()}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    saveSuppliers(suppliers);
    return newSupplier;
  },

  async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    await delay(500);
    const suppliers = getSuppliers();
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Proveedor no encontrado');
    }
    suppliers[index] = {
      ...suppliers[index],
      ...supplierData,
      updatedAt: new Date().toISOString()
    };
    saveSuppliers(suppliers);
    return suppliers[index];
  },

  async deleteSupplier(id: string): Promise<void> {
    await delay(400);
    const suppliers = getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    if (filtered.length === suppliers.length) {
      throw new Error('Proveedor no encontrado');
    }
    saveSuppliers(filtered);
  },

  async parseExcelFile(file: File): Promise<{ columns: string[]; sampleData: any[]; headerRow?: number }> {
    await delay(800);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length === 0) {
            reject(new Error('El archivo Excel está vacío'));
            return;
          }

          // Buscar la fila que tiene los headers (buscar palabras clave comunes)
          const headerKeywords = ['sku', 'descripcion', 'descripción', 'cantidad', 'precio', 'stock', 'marca', 'categoria', 'rubro', 'iva'];
          let headerRowIndex = -1;
          
          // Buscar en las primeras 10 filas
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;
            
            const rowText = row.map(cell => String(cell || '').toLowerCase().trim()).join(' ');
            const matches = headerKeywords.filter(keyword => rowText.includes(keyword));
            
            // Si encuentra al menos 2 palabras clave, probablemente es la fila de headers
            if (matches.length >= 2) {
              headerRowIndex = i;
              break;
            }
          }
          
          // Si no encontró, usar la primera fila que tenga al menos 3 columnas con texto
          if (headerRowIndex === -1) {
            for (let i = 0; i < Math.min(10, jsonData.length); i++) {
              const row = jsonData[i] as any[];
              const nonEmptyCells = row.filter(cell => String(cell || '').trim().length > 0);
              if (nonEmptyCells.length >= 3) {
                headerRowIndex = i;
                break;
              }
            }
          }
          
          // Si aún no encontró, usar la fila 0
          if (headerRowIndex === -1) {
            headerRowIndex = 0;
          }

          // Obtener headers de la fila detectada
          const headerRow = jsonData[headerRowIndex] as any[];
          const columns = headerRow.map((col: any, idx: number) => {
            const colText = String(col || '').trim();
            // Si la columna está vacía, usar el índice de columna (A, B, C...)
            return colText || `Columna ${String.fromCharCode(65 + idx)}`;
          }).filter((col, idx) => {
            // Filtrar columnas completamente vacías, pero mantener al menos las primeras
            return idx < 10 || col.trim().length > 0;
          });
          
          // Si todas las columnas están vacías, usar números
          if (columns.every(col => col.startsWith('Columna'))) {
            const numColumns = Math.max(columns.length, headerRow.length);
            for (let i = 0; i < numColumns; i++) {
              if (i < columns.length) {
                columns[i] = `Columna ${i + 1}`;
              } else {
                columns.push(`Columna ${i + 1}`);
              }
            }
          }
          
          // Tomar las primeras 5 filas de datos después de los headers (ignorar filas vacías)
          const dataStartRow = headerRowIndex + 1;
          const sampleData: any[] = [];
          let rowCount = 0;
          
          for (let i = dataStartRow; i < jsonData.length && rowCount < 5; i++) {
            const row = jsonData[i] as any[];
            // Ignorar filas completamente vacías
            const hasData = row && row.some(cell => String(cell || '').trim().length > 0);
            if (!hasData) continue;
            
            const obj: any = {};
            columns.forEach((col, idx) => {
              obj[col] = row && row[idx] !== undefined ? String(row[idx] || '').trim() : '';
            });
            sampleData.push(obj);
            rowCount++;
          }

          console.log('Header row detectada:', headerRowIndex);
          console.log('Columnas encontradas:', columns);
          console.log('Datos de muestra:', sampleData);

          resolve({ columns, sampleData, headerRow: headerRowIndex });
        } catch (error) {
          reject(new Error('Error al leer el archivo Excel: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  },

  async importProductsFromExcel(supplierId: string, file: File): Promise<Product[]> {
    await delay(1500);
    
    const supplier = await this.getSupplier(supplierId);
    const mapping = supplier.columnMapping;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('El archivo Excel no tiene datos'));
            return;
          }

          // Usar la misma lógica de detección de headers que en parseExcelFile
          const headerKeywords = ['sku', 'descripcion', 'descripción', 'cantidad', 'precio', 'stock', 'marca', 'categoria', 'rubro', 'iva'];
          let headerRowIndex = -1;
          
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;
            
            const rowText = row.map(cell => String(cell || '').toLowerCase().trim()).join(' ');
            const matches = headerKeywords.filter(keyword => rowText.includes(keyword));
            
            if (matches.length >= 2) {
              headerRowIndex = i;
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            for (let i = 0; i < Math.min(10, jsonData.length); i++) {
              const row = jsonData[i] as any[];
              const nonEmptyCells = row.filter(cell => String(cell || '').trim().length > 0);
              if (nonEmptyCells.length >= 3) {
                headerRowIndex = i;
                break;
              }
            }
          }
          
          if (headerRowIndex === -1) {
            headerRowIndex = 0;
          }

          const headerRow = jsonData[headerRowIndex] as any[];
          const columns = headerRow.map((col: any, idx: number) => {
            const colText = String(col || '').trim();
            return colText || `Columna ${String.fromCharCode(65 + idx)}`;
          }).filter((col, idx) => idx < 10 || col.trim().length > 0);
          
          if (columns.every(col => col.startsWith('Columna'))) {
            const numColumns = Math.max(columns.length, headerRow.length);
            for (let i = 0; i < numColumns; i++) {
              if (i < columns.length) {
                columns[i] = `Columna ${i + 1}`;
              } else {
                columns.push(`Columna ${i + 1}`);
              }
            }
          }
          
          const rows = jsonData.slice(headerRowIndex + 1).filter(row => {
            // Filtrar filas completamente vacías
            return row && row.some(cell => String(cell || '').trim().length > 0);
          });
          
          // Validar que el mapeo existe
          if (!mapping || Object.keys(mapping).length === 0) {
            reject(new Error('El proveedor no tiene mapeo de columnas configurado. Configurá el mapeo primero.'));
            return;
          }
          
          console.log('=== IMPORTACIÓN DE PRODUCTOS ===');
          console.log('Columnas encontradas en el Excel:', columns);
          console.log('Mapeo configurado del proveedor:', mapping);
          
          // Verificar que las columnas mapeadas existan en el Excel
          const missingColumns: string[] = [];
          Object.entries(mapping).forEach(([fieldKey, excelColumnName]) => {
            if (excelColumnName && !columns.includes(excelColumnName)) {
              missingColumns.push(`${fieldKey} -> "${excelColumnName}"`);
            }
          });
          
          if (missingColumns.length > 0) {
            reject(new Error(`Las siguientes columnas mapeadas no se encontraron en el Excel: ${missingColumns.join(', ')}. Columnas disponibles: ${columns.join(', ')}`));
            return;
          }
          
          const products: Product[] = rows.map((row: any[], index: number) => {
            const getValue = (field: string | undefined) => {
              if (!field) return undefined;
              // Buscar la columna mapeada (el nombre exacto que viene del Excel)
              const colIndex = columns.findIndex(col => col === field);
              if (colIndex === -1) {
                return undefined;
              }
              const value = row[colIndex];
              return value !== undefined && value !== null ? value : undefined;
            };

            const sku = String(getValue(mapping.sku) || `SKU-${supplierId}-${index}`).trim();
            const name = String(getValue(mapping.name) || 'Sin nombre').trim();
            const price = parseFloat(String(getValue(mapping.price) || 0));
            const stock = parseInt(String(getValue(mapping.stock) || 0));

            return {
              id: `${supplierId}-${sku}-${index}`,
              sku,
              name,
              description: getValue(mapping.description) ? String(getValue(mapping.description)).trim() : undefined,
              price: isNaN(price) ? 0 : price,
              stock: isNaN(stock) ? 0 : stock,
              category: getValue(mapping.category) ? String(getValue(mapping.category)).trim() : undefined,
              brand: getValue(mapping.brand) ? String(getValue(mapping.brand)).trim() : undefined,
              imageUrl: getValue(mapping.imageUrl) ? String(getValue(mapping.imageUrl)).trim() : null,
              distributorId: supplierId as any, // Usamos el supplierId como distributorId
              vat: getValue(mapping.vat) ? parseFloat(String(getValue(mapping.vat))) : undefined
            };
          }).filter(p => p.sku && p.name); // Filtrar productos inválidos

          // Agregar productos al storage
          const existingProducts = getProducts();
          const newProducts = [...existingProducts, ...products];
          saveProducts(newProducts);

          resolve(products);
        } catch (error) {
          reject(new Error('Error al importar productos: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }
};

