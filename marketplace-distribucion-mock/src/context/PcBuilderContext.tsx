import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { useSettings } from './SettingsContext';

export interface BuildItem {
  product: Product;
  quantity: number;
  markup: number;
}

interface PcBuilderContextType {
  buildItems: BuildItem[];
  addToBuild: (product: Product) => void;
  removeFromBuild: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateMarkup: (productId: string, markup: number) => void;
  clearBuild: () => void;
  totalBuildItems: number;
  totalCost: number;
  totalSellPrice: number;
}

const PcBuilderContext = createContext<PcBuilderContextType | undefined>(undefined);

export function PcBuilderProvider({ children }: { children: ReactNode }) {
  const { defaultMarkup } = useSettings();
  
  const [buildItems, setBuildItems] = useState<BuildItem[]>(() => {
    const saved = localStorage.getItem('tgs_pc_build');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tgs_pc_build', JSON.stringify(buildItems));
  }, [buildItems]);

  const addToBuild = (product: Product) => {
    setBuildItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, markup: defaultMarkup }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBuild(productId);
      return;
    }
    setBuildItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const updateMarkup = (productId: string, markup: number) => {
    setBuildItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, markup } : item
    ));
  };

  const removeFromBuild = (productId: string) => {
    setBuildItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearBuild = () => setBuildItems([]);

  const totalBuildItems = buildItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCost = buildItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalSellPrice = buildItems.reduce((sum, item) => {
    const cost = item.product.price * item.quantity;
    const sell = cost * (1 + (item.markup / 100));
    return sum + sell;
  }, 0);

  return (
    <PcBuilderContext.Provider value={{
      buildItems,
      addToBuild,
      removeFromBuild,
      updateQuantity,
      updateMarkup,
      clearBuild,
      totalBuildItems,
      totalCost,
      totalSellPrice
    }}>
      {children}
    </PcBuilderContext.Provider>
  );
}

export const usePcBuilder = () => {
  const context = useContext(PcBuilderContext);
  if (!context) throw new Error("usePcBuilder debe usarse dentro de PcBuilderProvider");
  return context;
};

