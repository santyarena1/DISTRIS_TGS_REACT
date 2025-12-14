import type { Product, User, Company } from '../../types';

// Empresas mock
export const mockCompanies: Company[] = [
  {
    id: 'emp-001',
    name: 'Tech Solutions SA',
    active: true,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'emp-002',
    name: 'Digital Commerce',
    active: true,
    createdAt: new Date('2024-02-20').toISOString()
  },
  {
    id: 'emp-003',
    name: 'Gaming Store',
    active: true,
    createdAt: new Date('2024-03-10').toISOString()
  }
];

// Usuarios mock
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'superadmin@tgs.com',
    role: 'superadmin',
    first_name: 'Super',
    last_name: 'Admin',
    companyId: null,
    companyName: 'Sistema',
    active: true,
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 2,
    email: 'admin@tgs.com',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'TGS',
    companyId: 'emp-001',
    companyName: 'Tech Solutions SA',
    active: true,
    createdAt: new Date('2024-01-16').toISOString()
  },
  {
    id: 3,
    email: 'user@tgs.com',
    role: 'user',
    first_name: 'Usuario',
    last_name: 'Test',
    companyId: 'emp-001',
    companyName: 'Tech Solutions SA',
    active: true,
    createdAt: new Date('2024-01-17').toISOString()
  },
  {
    id: 4,
    email: 'admin2@digital.com',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'Digital',
    companyId: 'emp-002',
    companyName: 'Digital Commerce',
    active: true,
    createdAt: new Date('2024-02-21').toISOString()
  },
  {
    id: 5,
    email: 'user2@digital.com',
    role: 'user',
    first_name: 'Usuario',
    last_name: 'Digital',
    companyId: 'emp-002',
    companyName: 'Digital Commerce',
    active: true,
    createdAt: new Date('2024-02-22').toISOString()
  },
  {
    id: 6,
    email: 'user3@gaming.com',
    role: 'user',
    first_name: 'Gamer',
    last_name: 'User',
    companyId: 'emp-003',
    companyName: 'Gaming Store',
    active: true,
    createdAt: new Date('2024-03-11').toISOString()
  }
];

// Productos mock realistas
export const mockProducts: Product[] = [
  // New Bytes
  {
    id: 'nb-001',
    sku: 'NB-RTX4090',
    name: 'NVIDIA GeForce RTX 4090 24GB',
    price: 1200,
    stock: 5,
    category: 'Tarjetas Gráficas',
    brand: 'NVIDIA',
    distributorId: 'newbytes',
    imageUrl: 'https://placehold.co/400x400?text=RTX+4090',
    vat: 21
  },
  {
    id: 'nb-002',
    sku: 'NB-RTX4080',
    name: 'NVIDIA GeForce RTX 4080 16GB',
    price: 900,
    stock: 8,
    category: 'Tarjetas Gráficas',
    brand: 'NVIDIA',
    distributorId: 'newbytes',
    imageUrl: 'https://placehold.co/400x400?text=RTX+4080',
    vat: 21
  },
  {
    id: 'nb-003',
    sku: 'NB-I9-13900K',
    name: 'Intel Core i9-13900K 24-Core',
    price: 650,
    stock: 12,
    category: 'Procesadores',
    brand: 'Intel',
    distributorId: 'newbytes',
    imageUrl: 'https://placehold.co/400x400?text=i9-13900K',
    vat: 21
  },
  {
    id: 'nb-004',
    sku: 'NB-Z790',
    name: 'ASUS ROG Strix Z790-E Gaming',
    price: 450,
    stock: 6,
    category: 'Motherboards',
    brand: 'ASUS',
    distributorId: 'newbytes',
    imageUrl: 'https://placehold.co/400x400?text=Z790',
    vat: 21
  },
  {
    id: 'nb-005',
    sku: 'NB-DDR5-32',
    name: 'Corsair Vengeance DDR5 32GB 6000MHz',
    price: 180,
    stock: 20,
    category: 'Memoria RAM',
    brand: 'Corsair',
    distributorId: 'newbytes',
    imageUrl: 'https://placehold.co/400x400?text=DDR5',
    vat: 21
  },
  // Grupo Nucleo
  {
    id: 'gn-001',
    sku: 'GN-RX7900XTX',
    name: 'AMD Radeon RX 7900 XTX 24GB',
    price: 950,
    stock: 4,
    category: 'Tarjetas Gráficas',
    brand: 'AMD',
    distributorId: 'gruponucleo',
    imageUrl: 'https://placehold.co/400x400?text=RX+7900',
    vat: 21
  },
  {
    id: 'gn-002',
    sku: 'GN-R9-7950X',
    name: 'AMD Ryzen 9 7950X 16-Core',
    price: 600,
    stock: 10,
    category: 'Procesadores',
    brand: 'AMD',
    distributorId: 'gruponucleo',
    imageUrl: 'https://placehold.co/400x400?text=R9+7950X',
    vat: 21
  },
  {
    id: 'gn-003',
    sku: 'GN-X670E',
    name: 'MSI MEG X670E Ace',
    price: 500,
    stock: 3,
    category: 'Motherboards',
    brand: 'MSI',
    distributorId: 'gruponucleo',
    imageUrl: 'https://placehold.co/400x400?text=X670E',
    vat: 21
  },
  {
    id: 'gn-004',
    sku: 'GN-PSU-1000',
    name: 'Seasonic Prime TX-1000 80+ Titanium',
    price: 280,
    stock: 15,
    category: 'Fuentes de Poder',
    brand: 'Seasonic',
    distributorId: 'gruponucleo',
    imageUrl: 'https://placehold.co/400x400?text=PSU+1000W',
    vat: 21
  },
  // TGS
  {
    id: 'tgs-001',
    sku: 'TGS-RTX4070',
    name: 'Gigabyte GeForce RTX 4070 12GB',
    price: 700,
    stock: 7,
    category: 'Tarjetas Gráficas',
    brand: 'Gigabyte',
    distributorId: 'tgs',
    imageUrl: 'https://placehold.co/400x400?text=RTX+4070',
    vat: 21
  },
  {
    id: 'tgs-002',
    sku: 'TGS-I7-13700K',
    name: 'Intel Core i7-13700K 16-Core',
    price: 450,
    stock: 9,
    category: 'Procesadores',
    brand: 'Intel',
    distributorId: 'tgs',
    imageUrl: 'https://placehold.co/400x400?text=i7-13700K',
    vat: 21
  },
  {
    id: 'tgs-003',
    sku: 'TGS-SSD-2TB',
    name: 'Samsung 990 PRO 2TB NVMe',
    price: 220,
    stock: 18,
    category: 'Almacenamiento',
    brand: 'Samsung',
    distributorId: 'tgs',
    imageUrl: 'https://placehold.co/400x400?text=SSD+2TB',
    vat: 21
  },
  {
    id: 'tgs-004',
    sku: 'TGS-AIO-360',
    name: 'Corsair iCUE H150i Elite Capellix 360mm',
    price: 200,
    stock: 11,
    category: 'Refrigeración',
    brand: 'Corsair',
    distributorId: 'tgs',
    imageUrl: 'https://placehold.co/400x400?text=AIO+360',
    vat: 21
  },
  // Elit
  {
    id: 'elit-001',
    sku: 'ELIT-RTX4060',
    name: 'MSI GeForce RTX 4060 8GB',
    price: 400,
    stock: 15,
    category: 'Tarjetas Gráficas',
    brand: 'MSI',
    distributorId: 'elit',
    imageUrl: 'https://placehold.co/400x400?text=RTX+4060',
    vat: 21
  },
  {
    id: 'elit-002',
    sku: 'ELIT-R5-7600X',
    name: 'AMD Ryzen 5 7600X 6-Core',
    price: 280,
    stock: 20,
    category: 'Procesadores',
    brand: 'AMD',
    distributorId: 'elit',
    imageUrl: 'https://placehold.co/400x400?text=R5+7600X',
    vat: 21
  },
  {
    id: 'elit-003',
    sku: 'ELIT-B650',
    name: 'ASUS TUF Gaming B650-Plus',
    price: 220,
    stock: 14,
    category: 'Motherboards',
    brand: 'ASUS',
    distributorId: 'elit',
    imageUrl: 'https://placehold.co/400x400?text=B650',
    vat: 21
  },
  {
    id: 'elit-004',
    sku: 'ELIT-CASE-5000D',
    name: 'Corsair 5000D Airflow',
    price: 180,
    stock: 8,
    category: 'Gabinetes',
    brand: 'Corsair',
    distributorId: 'elit',
    imageUrl: 'https://placehold.co/400x400?text=5000D',
    vat: 21
  },
  // Gaming City
  {
    id: 'gc-001',
    sku: 'GC-RTX4070TI',
    name: 'ASUS TUF GeForce RTX 4070 Ti 12GB',
    price: 850,
    stock: 6,
    category: 'Tarjetas Gráficas',
    brand: 'ASUS',
    distributorId: 'gamingcity',
    imageUrl: 'https://placehold.co/400x400?text=RTX+4070Ti',
    vat: 21
  },
  {
    id: 'gc-002',
    sku: 'GC-I5-13600K',
    name: 'Intel Core i5-13600K 14-Core',
    price: 320,
    stock: 16,
    category: 'Procesadores',
    brand: 'Intel',
    distributorId: 'gamingcity',
    imageUrl: 'https://placehold.co/400x400?text=i5-13600K',
    vat: 21
  },
  {
    id: 'gc-003',
    sku: 'GC-SSD-1TB',
    name: 'WD Black SN850X 1TB NVMe',
    price: 120,
    stock: 25,
    category: 'Almacenamiento',
    brand: 'Western Digital',
    distributorId: 'gamingcity',
    imageUrl: 'https://placehold.co/400x400?text=SSD+1TB',
    vat: 21
  },
  {
    id: 'gc-004',
    sku: 'GC-PSU-850',
    name: 'Corsair RM850x 80+ Gold',
    price: 150,
    stock: 12,
    category: 'Fuentes de Poder',
    brand: 'Corsair',
    distributorId: 'gamingcity',
    imageUrl: 'https://placehold.co/400x400?text=PSU+850W',
    vat: 21
  },
  {
    id: 'gc-005',
    sku: 'GC-KB-MECH',
    name: 'Corsair K70 RGB Mechanical Keyboard',
    price: 180,
    stock: 9,
    category: 'Periféricos',
    brand: 'Corsair',
    distributorId: 'gamingcity',
    imageUrl: 'https://placehold.co/400x400?text=K70',
    vat: 21
  },
  // Más productos para tener variedad
  {
    id: 'nb-006',
    sku: 'NB-MONITOR-27',
    name: 'ASUS ROG Swift PG27UQ 27" 4K 144Hz',
    price: 800,
    stock: 4,
    category: 'Monitores',
    brand: 'ASUS',
    distributorId: 'newbytes',
    imageUrl: 'https://placehold.co/400x400?text=Monitor+27',
    vat: 21
  },
  {
    id: 'gn-005',
    sku: 'GN-MOUSE-G502',
    name: 'Logitech G502 Hero',
    price: 80,
    stock: 30,
    category: 'Periféricos',
    brand: 'Logitech',
    distributorId: 'gruponucleo',
    imageUrl: 'https://placehold.co/400x400?text=G502',
    vat: 21
  },
  {
    id: 'tgs-005',
    sku: 'TGS-HEADSET',
    name: 'SteelSeries Arctis 7P Wireless',
    price: 150,
    stock: 13,
    category: 'Periféricos',
    brand: 'SteelSeries',
    distributorId: 'tgs',
    imageUrl: 'https://placehold.co/400x400?text=Arctis+7P',
    vat: 21
  },
  {
    id: 'elit-005',
    sku: 'ELIT-WIFI6',
    name: 'TP-Link Archer AX6000 WiFi 6 Router',
    price: 250,
    stock: 7,
    category: 'Redes',
    brand: 'TP-Link',
    distributorId: 'elit',
    imageUrl: 'https://placehold.co/400x400?text=AX6000',
    vat: 21
  },
  {
    id: 'gc-006',
    sku: 'GC-WEBCAM',
    name: 'Logitech C920 HD Pro Webcam',
    price: 90,
    stock: 22,
    category: 'Periféricos',
    brand: 'Logitech',
    distributorId: 'gamingcity',
    imageUrl: 'https://placehold.co/400x400?text=C920',
    vat: 21
  }
];

