import { X, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Cart({ onClose }: { onClose: () => void }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { distributorSettings } = useSettings();

  // Agrupar por distribuidor
  const itemsByDistributor = cartItems.reduce((acc, item) => {
    const dist = item.product.distributorId;
    if (!acc[dist]) acc[dist] = [];
    acc[dist].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  const distributors = Object.keys(itemsByDistributor);
  const totalGeneral = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = (distributorId: string) => {
    const items = itemsByDistributor[distributorId];
    const settings = distributorSettings[distributorId];
    
    if (!settings?.whatsapp) {
      alert("Configura el número de WhatsApp en tu Perfil -> Configuración.");
      return;
    }

    let message = `Hola *${settings.name}*, quisiera realizar el siguiente pedido:\n\n`;
    let total = 0;
    
    items.forEach(item => {
      const sub = item.product.price * item.quantity;
      total += sub;
      message += `- (${item.quantity}) ${item.product.name} [${item.product.sku}]\n`;
    });

    message += `\n*Total Estimado: USD ${total.toFixed(2)}*`;
    
    const url = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-300 border-l">
        
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground shrink-0">
          <h2 className="font-bold text-lg flex items-center gap-2">
            Carrito de Compras
            <span className="bg-white text-primary text-xs px-2 py-0.5 rounded-full font-mono">
              {cartItems.reduce((a,b)=>a+b.quantity,0)}
            </span>
          </h2>
          <Button size="icon" variant="ghost" className="hover:bg-primary/80 text-primary-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground p-8 text-center">
              <p className="mb-4">Tu carrito está vacío.</p>
              <Button variant="outline" onClick={onClose}>Volver al catálogo</Button>
            </div>
          ) : (
            <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden h-full">
              <div className="px-4 pt-4 shrink-0 bg-white z-10">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="general">Resumen General</TabsTrigger>
                  <TabsTrigger value="provider">Por Proveedor</TabsTrigger>
                </TabsList>
              </div>

              {/* TAB: GENERAL */}
              {/* CORRECCIÓN: Quitamos 'flex' base y usamos 'data-[state=active]:flex' */}
              <TabsContent value="general" className="hidden flex-1 overflow-hidden flex-col m-0 p-0 data-[state=active]:flex min-h-0">
                <ScrollArea className="flex-1 p-4">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="flex gap-3 mb-4 bg-gray-50 p-2 rounded border group">
                       <div className="w-16 h-16 bg-white rounded border flex items-center justify-center shrink-0">
                          <img 
                            src={item.product.imageUrl || '/placeholder.png'} 
                            className="max-w-full max-h-full object-contain p-1" 
                            alt=""
                            onError={(e) => (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=IMG"}
                          />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                           <h4 className="text-sm font-medium line-clamp-2 leading-snug" title={item.product.name}>
                             {item.product.name}
                           </h4>
                           <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                             <Trash2 className="h-4 w-4"/>
                           </button>
                         </div>
                         <div className="flex items-center justify-between mt-2">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider bg-gray-200 px-1 rounded">
                              {item.product.distributorId}
                            </div>
                            <div className="flex items-center gap-2 bg-white rounded border shadow-sm">
                              <button className="px-2 py-0.5 hover:bg-gray-100 text-sm border-r" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <button className="px-2 py-0.5 hover:bg-gray-100 text-sm border-l" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                            </div>
                         </div>
                         <div className="text-right font-bold text-sm mt-1 text-primary">
                           USD {(item.product.price * item.quantity).toFixed(2)}
                         </div>
                       </div>
                    </div>
                  ))}
                </ScrollArea>
                <div className="p-4 border-t bg-gray-50 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-muted-foreground font-medium">Total Estimado</span>
                    <span className="text-2xl font-bold text-primary">USD {totalGeneral.toFixed(2)}</span>
                  </div>
                  <Button variant="destructive" className="w-full" onClick={clearCart}>Vaciar Todo</Button>
                </div>
              </TabsContent>

              {/* TAB: POR PROVEEDOR */}
              {/* CORRECCIÓN: Quitamos 'flex' base y usamos 'data-[state=active]:flex' */}
              <TabsContent value="provider" className="hidden flex-1 overflow-hidden flex-col m-0 p-0 data-[state=active]:flex min-h-0">
                <ScrollArea className="flex-1 p-4">
                  {distributors.map(dist => {
                    const items = itemsByDistributor[dist];
                    const totalDist = items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
                    const settings = distributorSettings[dist];

                    return (
                      <div key={dist} className="mb-6 border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
                          <h3 className="font-bold capitalize text-gray-800 flex items-center gap-2">
                            {settings?.name || dist}
                          </h3>
                          <span className="text-xs bg-white px-2 py-0.5 rounded border text-muted-foreground font-mono">
                            {items.length} items
                          </span>
                        </div>
                        <div className="p-3">
                          <ul className="space-y-3 mb-4">
                            {items.map(i => (
                              <li key={i.product.id} className="text-sm flex justify-between items-start gap-4 border-b border-dashed pb-2 last:border-0 last:pb-0">
                                <span className="text-gray-600 flex-1">
                                  <span className="font-bold text-gray-900 mr-1">{i.quantity}x</span> 
                                  {i.product.name}
                                </span>
                                <span className="font-mono font-medium whitespace-nowrap text-gray-900">
                                  ${(i.product.price * i.quantity).toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded">
                            <span className="text-sm font-medium text-gray-600">Total a pedir:</span>
                            <span className="font-bold text-lg text-primary">USD {totalDist.toFixed(2)}</span>
                          </div>
                          <Button 
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold transition-colors" 
                            onClick={() => handleCheckout(dist)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Pedir a {settings?.name || dist}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}