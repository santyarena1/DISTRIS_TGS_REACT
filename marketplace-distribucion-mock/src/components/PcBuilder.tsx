import { X, Trash2, Monitor, Share2 } from 'lucide-react';
import { usePcBuilder } from '@/context/PcBuilderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function PcBuilder({ onClose }: { onClose: () => void }) {
  const { 
    buildItems, 
    removeFromBuild, 
    updateQuantity, 
    updateMarkup, 
    clearBuild, 
    totalCost,
    totalSellPrice 
  } = usePcBuilder();

  const handleCopyBudget = () => {
    let text = `🖥️ *PRESUPUESTO PC GAMER*\n\n`;
    
    buildItems.forEach(item => {
      const sellPrice = item.product.price * (1 + item.markup / 100);
      text += `▫️ ${item.quantity}x ${item.product.name}\n`;
      text += `   USD ${(sellPrice * item.quantity).toFixed(2)}\n`;
    });

    text += `\n💰 *TOTAL FINAL: USD ${totalSellPrice.toFixed(2)}*`;
    
    navigator.clipboard.writeText(text);
    alert("¡Presupuesto copiado al portapapeles!");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-300 border-l">
        
        <div className="p-4 border-b flex items-center justify-between bg-zinc-900 text-white shrink-0">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5 text-green-400" />
            Armador de PC
            <Badge variant="secondary" className="bg-zinc-700 text-white hover:bg-zinc-600">
              {buildItems.length} componentes
            </Badge>
          </h2>
          <Button size="icon" variant="ghost" className="hover:bg-zinc-800 text-white" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-gray-50">
          {buildItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground p-8 text-center">
              <Monitor className="h-16 w-16 mb-4 opacity-20" />
              <p className="mb-4">No has agregado componentes.</p>
              <Button variant="outline" onClick={onClose}>Ir al catálogo</Button>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              {buildItems.map(item => {
                const costPrice = item.product.price * item.quantity;
                const sellPrice = costPrice * (1 + item.markup / 100);

                return (
                  <div key={item.product.id} className="mb-4 bg-white p-3 rounded-lg border shadow-sm group hover:border-blue-200 transition-colors">
                     <div className="flex gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-50 rounded border flex items-center justify-center shrink-0">
                           <img 
                             src={item.product.imageUrl || '/placeholder.png'} 
                             className="max-w-full max-h-full object-contain p-1" 
                             onError={(e) => (e.target as HTMLImageElement).src = "https://placehold.co/50x50?text=..."}
                           />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-medium leading-snug text-gray-800 line-clamp-2" title={item.product.name}>
                              {item.product.name}
                            </h4>
                            <button onClick={() => removeFromBuild(item.product.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4"/>
                            </button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            Costo Unit: USD {item.product.price.toFixed(2)}
                          </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center bg-white rounded border shadow-sm h-8">
                          <button className="px-2 hover:bg-gray-100 text-gray-600" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                          <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                          <button className="px-2 hover:bg-gray-100 text-gray-600" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                        </div>

                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">Ganancia %</span>
                          <Input 
                            type="number" 
                            className="h-8 text-xs w-16 text-center" 
                            value={item.markup}
                            onChange={(e) => updateMarkup(item.product.id, Number(e.target.value))}
                          />
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">Venta</div>
                          <div className="font-bold text-sm text-green-700">USD {sellPrice.toFixed(2)}</div>
                        </div>
                     </div>
                  </div>
                );
              })}
            </ScrollArea>
          )}
        </div>

        {buildItems.length > 0 && (
          <div className="p-4 border-t bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Costo Total (Distribuidores)</span>
                <span>USD {totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Ganancia Estimada</span>
                <span>USD {(totalSellPrice - totalCost).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-end pt-2">
                <span className="font-bold text-lg text-gray-800">Precio Final Venta</span>
                <span className="text-3xl font-black text-primary">USD {totalSellPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={clearBuild}>
                Vaciar
              </Button>
              <Button className="w-full bg-zinc-900 hover:bg-zinc-800" onClick={handleCopyBudget}>
                <Share2 className="mr-2 h-4 w-4" />
                Copiar Presupuesto
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

