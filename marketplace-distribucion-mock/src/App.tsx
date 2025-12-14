import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { Layout } from '@/components/Layout';
import { Sidebar } from '@/components/Sidebar';
import { FilterBar } from '@/components/FilterBar';
import { ProductGrid } from '@/components/ProductGrid';
import { ConfigPage } from '@/pages/ConfigPage';
import { LoginPage } from '@/pages/LoginPage';
import { UsersPage } from '@/pages/UsersPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { apiClient } from '@/services';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function CatalogPage({ searchQuery }: { searchQuery: string }) {
  const { addToCart } = useCart();
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('price-asc');
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedBrands, selectedDistributors, sortBy, hideOutOfStock]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const loadAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await apiClient.getProducts({ limit: 10000 });
      setAllProducts(products);
    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const availableCategories = useMemo(() => Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean).sort(), [allProducts]);
  const availableBrands = useMemo(() => Array.from(new Set(allProducts.map(p => p.brand))).filter(Boolean).sort(), [allProducts]);
  const availableDistributors = ['newbytes', 'gruponucleo', 'tgs', 'elit', 'gamingcity'];

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (hideOutOfStock && product.stock <= 0) return false;
      const pName = (product.name || '').toLowerCase();
      const pSku = (product.sku || '').toLowerCase();
      const search = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || pName.includes(search) || pSku.includes(search);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category!);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand!);
      const matchesDist = selectedDistributors.length === 0 || selectedDistributors.includes(product.distributorId);
      return matchesSearch && matchesCategory && matchesBrand && matchesDist;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [allProducts, searchQuery, selectedCategories, selectedBrands, selectedDistributors, sortBy, hideOutOfStock]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredProducts, currentPage]);

  const toggleFilter = (item: string, current: string[], setFn: any) => {
    setFn(current.includes(item) ? current.filter(i => i !== item) : [...current, item]);
  };

  const generatePaginationItems = () => {
    const items = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      if (currentPage <= 3) items.push(1, 2, 3, '...', totalPages);
      else if (currentPage >= totalPages - 2) items.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      else items.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return items;
  };

  return (
    <div className="flex flex-1 container mx-auto py-6 gap-6 px-4">
        <Sidebar 
          categories={availableCategories}
          selectedCategories={selectedCategories}
          onCategoryChange={(cat) => toggleFilter(cat, selectedCategories, setSelectedCategories)}
          onClearFilters={() => setSelectedCategories([])}
        />
        <main className="flex-1 flex flex-col">
          <FilterBar 
            brands={availableBrands}
            selectedBrands={selectedBrands}
            onBrandChange={(b) => toggleFilter(b, selectedBrands, setSelectedBrands)}
            distributors={availableDistributors}
            selectedDistributors={selectedDistributors}
            onDistributorChange={(d) => toggleFilter(d, selectedDistributors, setSelectedDistributors)}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            hideOutOfStock={hideOutOfStock}
            onHideOutOfStockChange={setHideOutOfStock}
          />
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mostrando {paginatedProducts.length} de {filteredProducts.length} productos</span>
          </div>
          <ProductGrid products={paginatedProducts} isLoading={loadingProducts} onAddToCart={addToCart} />
          {totalPages > 1 && (
            <div className="mt-8 mb-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(p => p - 1); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                  {generatePaginationItems().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? <PaginationEllipsis /> : (
                        <PaginationLink href="#" isActive={currentPage === page} onClick={(e) => { e.preventDefault(); setCurrentPage(Number(page)); }}>{page}</PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(p => p + 1); }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>
      </div>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
              <CatalogPage searchQuery={searchQuery} />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/config" 
        element={
          <PrivateRoute>
            <Layout>
              <ConfigPage />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <PrivateRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/suppliers" 
        element={
          <PrivateRoute>
            <Layout>
              <SuppliersPage />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

