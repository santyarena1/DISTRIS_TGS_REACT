import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { FilterBar } from '@/components/FilterBar';
import { ProductGrid } from '@/components/ProductGrid';
import { Cart } from '@/components/Cart';
import { PcBuilder } from '@/components/PcBuilder';
import { ConfigPage } from '@/pages/ConfigPage';
import { LoginPage } from '@/pages/LoginPage';
import api from '@/services/api';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { exchangeRate, setExchangeRate } = useSettings();
  const { addToCart, totalItems } = useCart();
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [currentView, setCurrentView] = useState<'catalog' | 'config'>('catalog');
  const [showCart, setShowCart] = useState(false);
  const [showPcBuilder, setShowPcBuilder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('price-asc');
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllProducts();
    }
  }, [isAuthenticated]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedBrands, selectedDistributors, sortBy, hideOutOfStock]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const loadAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = { limit: 10000 };

      // ✅ AGREGAMOS TGS A LA CARGA
      const [resNewBytes, resGrupo, resTgs, resElit, resGaming] = await Promise.allSettled([
        api.get('/newbytes-products', { params }),
        api.get('/gruponucleo-products', { params }),
        api.get('/tgs-products', { params }), // <--- TGS CARGA AQUÍ
        api.get('/elit-products', { params }),
        api.get('/gamingcity-products')
      ]);

      let currentRate = exchangeRate; 
      
      if (resElit.status === 'fulfilled') {
        const elitData = Array.isArray(resElit.value.data) ? resElit.value.data : [];
        const productWithRate = elitData.find((p: any) => p.cotizacion && Number(p.cotizacion) > 0);
        if (productWithRate) {
          const newRate = Number(productWithRate.cotizacion);
          if (Math.abs(newRate - exchangeRate) > 0.01) {
            setExchangeRate(newRate);
            currentRate = newRate; 
          }
        }
      }

      let products: Product[] = [];

      const normalize = (list: any[], distId: any) => 
        (list || []).map((p: any) => {
          let price = Number(p.price || p.precio || 0);
          
          if (distId === 'tgs' || distId === 'gamingcity') {
             price = price / currentRate;
          }

          const productVat = p.iva ? parseFloat(String(p.iva)) : undefined;

          return {
            ...p,
            id: String(p.id || p.sku), // Fallback a SKU si no hay ID
            name: p.name || p.nombre || p.detalle || 'Producto sin nombre',
            sku: p.sku || p.codigo || p.nombre || 'S/N',
            price: price, 
            stock: Number(p.stock || p.stockTotal || 0),
            category: p.category || p.categoria || 'Otros',
            brand: p.brand || p.marca || 'Genérico',
            distributorId: distId,
            imageUrl: p.imageUrl || p.imagen,
            vat: productVat
          };
        });

      if (resNewBytes.status === 'fulfilled') products.push(...normalize(resNewBytes.value.data.products || resNewBytes.value.data, 'newbytes'));
      if (resGrupo.status === 'fulfilled') products.push(...normalize(resGrupo.value.data.products || resGrupo.value.data, 'gruponucleo'));
      if (resTgs.status === 'fulfilled') products.push(...normalize(Array.isArray(resTgs.value.data) ? resTgs.value.data : [], 'tgs'));
      if (resElit.status === 'fulfilled') products.push(...normalize(Array.isArray(resElit.value.data) ? resElit.value.data : [], 'elit'));
      if (resGaming.status === 'fulfilled') products.push(...normalize(Array.isArray(resGaming.value.data) ? resGaming.value.data : [], 'gamingcity'));

      setAllProducts(products);

    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const availableCategories = useMemo(() => Array.from(new Set(allProducts.map(p => p.category))).sort(), [allProducts]);
  const availableBrands = useMemo(() => Array.from(new Set(allProducts.map(p => p.brand))).sort(), [allProducts]);
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

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" richColors />
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemCount={totalItems}
        onCartClick={() => setShowCart(true)}
        onPcBuilderClick={() => setShowPcBuilder(true)}
        exchangeRate={exchangeRate}
        onNavigate={(view) => setCurrentView(view)}
      />
      
      {currentView === 'config' ? (
        <ConfigPage />
      ) : (
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
      )}
      {showCart && <Cart onClose={() => setShowCart(false)} />}
      {showPcBuilder && <PcBuilder onClose={() => setShowPcBuilder(false)} />}
    </div>
  );
}

export default AppContent;