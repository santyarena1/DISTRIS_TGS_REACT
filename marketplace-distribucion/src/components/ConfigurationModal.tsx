import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { syncService } from '@/services/sync.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Save, Database, Server, HardDrive, DollarSign, MessageSquare, Monitor } from 'lucide-react';

interface ConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigurationModal({ open, onOpenChange }: ConfigurationModalProps) {
  const { isAdmin } = useAuth();
  const { 
    distributorSettings, 
    updateDistributorPhone, 
    exchangeRate, 
    setExchangeRate,
    defaultMarkup,
    setDefaultMarkup
  } = useSettings();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');

  const handleSync = async (provider: 'newbytes' | 'gruponucleo' | 'tgs' | 'elit') => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      if (provider === 'newbytes') await syncService.syncNewBytes();
      if (provider === 'gruponucleo') await syncService.syncGrupoNucleo();
      if (provider === 'tgs') await syncService.syncTgs();
      if (provider === 'elit') await syncService.syncElit();
      setLastSync(`✅ Última sincro exitosa: ${provider.toUpperCase()} a las ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error(error);
      alert(`Error al sincronizar ${provider}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Configuración del Sistema</DialogTitle>
          <DialogDescription>
            Personaliza tu experiencia de ventas y catálogos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="general" className="h-full flex flex-col">
              <div className="px-6 pt-4 shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General y WhatsApp</TabsTrigger>
                  {isAdmin && <TabsTrigger value="sync">Sincronización</TabsTrigger>}
                </TabsList>
              </div>

              {/* TAB GENERAL */}
              <TabsContent value="general" className="hidden flex-1 overflow-hidden flex-col p-0 data-[state=active]:flex min-h-0">
                <ScrollArea className="flex-1 px-6 py-4">
                  <div className="space-y-6 pb-6">
                    
                    {/* Sección Precios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cotización */}
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" /> Cotización Dólar
                        </h4>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="exchange" className="text-xs font-bold text-blue-800">1 USD =</Label>
                          <Input 
                            id="exchange"
                            type="number" 
                            value={exchangeRate} 
                            onChange={(e) => setExchangeRate(Number(e.target.value))}
                            className="h-8 bg-white border-blue-200"
                          />
                          <span className="text-xs text-blue-800">ARS</span>
                        </div>
                      </div>

                      {/* Margen PC */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                          <Monitor className="h-4 w-4" /> Margen PC Default
                        </h4>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="markup" className="text-xs font-bold text-zinc-800">Ganancia</Label>
                          <Input 
                            id="markup"
                            type="number" 
                            value={defaultMarkup} 
                            onChange={(e) => setDefaultMarkup(Number(e.target.value))}
                            className="h-8 bg-white border-zinc-300 w-20"
                          />
                          <span className="text-xs text-zinc-800">%</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* WhatsApps */}
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Números de Pedido (WhatsApp)
                      </h4>
                      <div className="grid gap-4">
                        {Object.entries(distributorSettings).map(([key, data]) => (
                          <div key={key} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-4">
                            <Label className="capitalize sm:text-right col-span-1">{data.name}</Label>
                            <Input 
                              className="col-span-2"
                              placeholder="Ej: 54911..." 
                              value={data.whatsapp}
                              onChange={(e) => updateDistributorPhone(key, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-4 text-center bg-gray-50 p-2 rounded">
                        ℹ️ Ingresa los números con código de país, sin el "+" (Ej: 5491112345678)
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* TAB SINCRONIZACIÓN (SOLO ADMIN) */}
              {isAdmin && (
                <TabsContent value="sync" className="hidden flex-1 overflow-hidden flex-col p-0 data-[state=active]:flex min-h-0">
                   <ScrollArea className="flex-1 px-6 py-4">
                      <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 flex gap-3 items-start">
                          <div className="mt-0.5 text-amber-600">⚠️</div>
                          <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Estas acciones descargan el catálogo completo del proveedor y actualizan la base de datos. 
                            Puede demorar unos minutos dependiendo de la conexión.
                          </p>
                        </div>

                        {lastSync && (
                          <div className="bg-green-50 border border-green-200 text-green-700 p-2 rounded text-xs text-center font-medium animate-in fade-in">
                            {lastSync}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                          <Button variant="outline" className="justify-start h-auto py-3 px-4 hover:bg-gray-50" onClick={() => handleSync('newbytes')} disabled={isSyncing}>
                            <RefreshCw className={`mr-4 h-5 w-5 ${isSyncing ? 'animate-spin text-gray-400' : 'text-blue-500'}`} />
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">New Bytes</div>
                              <div className="text-xs text-muted-foreground">Sincronizar API Remota</div>
                            </div>
                          </Button>

                          <Button variant="outline" className="justify-start h-auto py-3 px-4 hover:bg-gray-50" onClick={() => handleSync('gruponucleo')} disabled={isSyncing}>
                            <Server className={`mr-4 h-5 w-5 ${isSyncing ? 'animate-spin text-gray-400' : 'text-green-500'}`} />
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">Grupo Núcleo</div>
                              <div className="text-xs text-muted-foreground">Sincronizar API Remota</div>
                            </div>
                          </Button>

                          <Button variant="outline" className="justify-start h-auto py-3 px-4 hover:bg-gray-50" onClick={() => handleSync('tgs')} disabled={isSyncing}>
                            <Database className={`mr-4 h-5 w-5 ${isSyncing ? 'animate-spin text-gray-400' : 'text-orange-500'}`} />
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">TGS (Local)</div>
                              <div className="text-xs text-muted-foreground">Sincronizar desde XML</div>
                            </div>
                          </Button>

                          <Button variant="outline" className="justify-start h-auto py-3 px-4 hover:bg-gray-50" onClick={() => handleSync('elit')} disabled={isSyncing}>
                            <HardDrive className={`mr-4 h-5 w-5 ${isSyncing ? 'animate-spin text-gray-400' : 'text-red-500'}`} />
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">Elit</div>
                              <div className="text-xs text-muted-foreground">Sincronizar API Remota</div>
                            </div>
                          </Button>
                        </div>
                      </div>
                   </ScrollArea>
                </TabsContent>
              )}
            </Tabs>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
           <Button onClick={() => onOpenChange(false)} className="pl-6 pr-6">
             <Save className="mr-2 h-4 w-4" />
             Guardar y Cerrar
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}