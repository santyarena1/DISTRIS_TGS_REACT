import { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Monitor } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePcBuilder } from '@/context/PcBuilderContext';
import { useSettings } from '@/context/SettingsContext';
import { toast } from 'sonner';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart: (product: Product) => void;
}

const distributorColors: Record<string, string> = {
  newbytes: 'bg-blue-500',
  gruponucleo: 'bg-green-500',
  tgs: 'bg-orange-500',
  elit: 'bg-red-600',
  gamingcity: 'bg-purple-600',
};

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  const { addToCart } = useCart();
  const { addToBuild } = usePcBuilder();
  const { taxMode, defaultVat, currency, exchangeRate } = useSettings(); 

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderPrice = (product: Product) => {
    let netPrice = product.price || 0;
    
    if (product.distributorId === 'gamingcity' || product.distributorId === 'tgs') {
        const vatDivisor = 1 + (defaultVat / 100);
        netPrice = netPrice / vatDivisor;
    }

    if (currency === 'ARS') {
      netPrice = netPrice * exchangeRate;
    }

    const productVatRate = product.vat !== undefined ? product.vat : defaultVat;
    const currencySymbol = currency === 'ARS' ? '$' : 'USD';
    
    let iibbAmount = 0;
    if (product.distributorId === 'newbytes') {
      iibbAmount = netPrice * 0.03;
    }

    if (taxMode === 'breakdown') {
      const vatAmount = netPrice * (productVatRate / 100);
      const finalPrice = netPrice + vatAmount + iibbAmount;
      
      return (
        <div className="flex flex-col items-end leading-none">
          <span className="text-sm font-semibold text-gray-600">
            Neto: {currencySymbol} {formatPrice(netPrice)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            + IVA ({productVatRate}%): {currencySymbol} {formatPrice(vatAmount)}
          </span>
          
          {iibbAmount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              + IIBB (3%): {currencySymbol} {formatPrice(iibbAmount)}
            </span>
          )}

          <span className="text-sm font-bold text-primary border-t border-gray-300 mt-0.5 pt-0.5">
            Total: {currencySymbol} {formatPrice(finalPrice)}
          </span>
        </div>
      );
    }

    if (taxMode === 'half-vat') {
      
      if (product.distributorId === 'gamingcity') {
        const finalPrice = netPrice * (1 + (productVatRate / 100));
        const promoPrice = finalPrice * 0.95;

        return (
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-primary">
              {currencySymbol} {formatPrice(promoPrice)}
            </span>
            <Badge variant="outline" className="text-[9px] h-4 px-1 border-purple-200 text-purple-700 bg-purple-50">
              Promo 5% OFF (GC)
            </Badge>
          </div>
        );
      }

      if (product.distributorId === 'gruponucleo') {
        return (
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-primary">
              {currencySymbol} {formatPrice(netPrice)}
            </span>
            <Badge variant="outline" className="text-[9px] h-4 px-1 border-blue-200 text-blue-700 bg-blue-50">
              Sin IVA (GN)
            </Badge>
          </div>
        );
      }

      if (product.distributorId === 'elit') {
        const fullPrice = netPrice * (1 + productVatRate / 100);
        return (
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-primary">
              {currencySymbol} {formatPrice(fullPrice)}
            </span>
            <Badge variant="outline" className="text-[9px] h-4 px-1 border-gray-200 text-gray-700 bg-gray-50">
              IVA Completo
            </Badge>
          </div>
        );
      }

      const halfVatRate = productVatRate / 2;
      const halfVatPrice = netPrice * (1 + (halfVatRate / 100));
      const finalHalfPrice = halfVatPrice + iibbAmount;

      return (
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-primary">
            {currencySymbol} {formatPrice(finalHalfPrice)}
          </span>
          <div className="flex flex-col items-end">
            <Badge variant="outline" className="text-[9px] h-4 px-1 border-green-200 text-green-700 bg-green-50 mb-0.5">
              Medio IVA ({halfVatRate.toFixed(2)}%)
            </Badge>
            {iibbAmount > 0 && (
                <span className="text-[9px] text-muted-foreground">+ IIBB</span>
            )}
          </div>
        </div>
      );
    }

    const vatAmount = netPrice * (productVatRate / 100);
    const finalPrice = netPrice + vatAmount + iibbAmount;
    
    return (
      <div className="flex flex-col items-end">
        <span className="text-xl font-bold text-primary">
          {currencySymbol} {formatPrice(finalPrice)}
        </span>
        <div className="flex gap-1">
           {productVatRate !== 21 && (
             <span className="text-[9px] text-muted-foreground">IVA {productVatRate}%</span>
           )}
           {iibbAmount > 0 && (
             <span className="text-[9px] text-muted-foreground">+ IIBB</span>
           )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando catálogo completo...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg mt-8">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No se encontraron productos</h3>
        <p className="text-muted-foreground">Intenta con otra búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const dotColor = distributorColors[product.distributorId] || 'bg-gray-500';
        
        return (
          <Card key={`${product.distributorId}-${product.id}`} className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="aspect-square relative overflow-hidden rounded-t-lg bg-white p-4 group">
                <img 
                  src={product.imageUrl || '/placeholder.png'} 
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Sin+Imagen"; }}
                />
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                    <Badge variant="destructive" className="text-sm px-3 py-1 shadow-md">Sin Stock</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className="text-xs uppercase truncate max-w-[120px]">
                  {product.brand || 'Genérico'}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
              </div>
              
              <h3 className="font-medium text-sm leading-tight line-clamp-2 h-10" title={product.name}>
                {product.name}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                 <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                 <span className="uppercase font-semibold">{product.distributorId}</span>
              </div>
            </CardContent>
  
            <CardFooter className="p-4 pt-0 flex flex-col gap-3">
              <div className="w-full flex items-end justify-between border-t pt-3 min-h-[3.5rem]">
                <span className="text-xs text-muted-foreground mb-1">Precio</span>
                {renderPrice(product)}
              </div>
              
              <div className="flex gap-2 w-full">
                <Button 
                  className="flex-1" 
                  onClick={() => { addToCart(product); toast.success("Agregado al carrito"); }}
                  disabled={product.stock <= 0}
                  variant={product.stock > 0 ? "default" : "secondary"}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar
                </Button>

                <Button 
                  size="icon" 
                  variant="outline" 
                  className="shrink-0 border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={() => { addToBuild(product); toast.success("Agregado al armador"); }}
                  disabled={product.stock <= 0}
                  title="Agregar al Armador de PC"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

