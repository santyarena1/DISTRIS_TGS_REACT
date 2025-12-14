import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Cart } from '@/components/Cart';
import { PcBuilder } from '@/components/PcBuilder';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Layout({ children, searchQuery, onSearchChange }: LayoutProps) {
  const { exchangeRate } = useSettings();
  const { totalItems } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showPcBuilder, setShowPcBuilder] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" richColors />
      <Header 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        cartItemCount={totalItems}
        onCartClick={() => setShowCart(true)}
        onPcBuilderClick={() => setShowPcBuilder(true)}
        exchangeRate={exchangeRate}
      />
      <div className="flex-1">
        {children}
      </div>
      {showCart && <Cart onClose={() => setShowCart(false)} />}
      {showPcBuilder && <PcBuilder onClose={() => setShowPcBuilder(false)} />}
    </div>
  );
}

