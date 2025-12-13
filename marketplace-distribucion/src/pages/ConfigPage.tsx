import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { configService, DistributorConfig } from '@/services/config.service';
import { syncService } from '@/services/sync.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, RefreshCw, Eye, EyeOff, Server, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ConfigPage() {
  const { isAdmin } = useAuth();
  const { 
    exchangeRate, setExchangeRate, 
    defaultMarkup, setDefaultMarkup,
    distributorSettings, updateDistributorPhone 
  } = useSettings();

  const [configs, setConfigs] = useState<DistributorConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBackend, setErrorBackend] = useState(false);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) loadBackendConfigs();
  }, [isAdmin]);

  const loadBackendConfigs = async () => {
    setLoading(true);
    setErrorBackend(false);
    try {
      const data = await configService.getAll();
      if (Array.isArray(data)) {
        setConfigs(data);
      } else {
        setConfigs([]);
        setErrorBackend(true);
      }
    } catch (error) {
      setConfigs([]);
      setErrorBackend(true);
    } finally {
      setLoading(false);
    }
  };

  const getDistributorConfig = (key: string) => {
    const found = configs.find(c => c.distributor === key);
    return found || { 
      distributor: key, 
      name: distributorSettings[key]?.name || key, 
      active: true, 
      credentials: {}, 
      lastSync: null,
      syncStats: null
    };
  };

  const handleCredentialChange = (distributor: string, field: string, value: string) => {
    const exists = configs.find(c => c.distributor === distributor);
    if (exists) {
      setConfigs(prev => prev.map(c => {
        if (c.distributor === distributor) {
          return { ...c, credentials: { ...c.credentials, [field]: value } };
        }
        return c;
      }));
    } else {
      setConfigs(prev => [...prev, {
        distributor,
        name: distributorSettings[distributor]?.name || distributor,
        active: true,
        credentials: { [field]: value },
        lastSync: null,
        syncStats: null
      }]);
    }
  };

  const saveBackendConfig = async (distributorKey: string) => {
    const configToSave = getDistributorConfig(distributorKey);
    try {
      await configService.save(configToSave);
      toast.success(`Configuración de ${configToSave.name} guardada.`);
      await loadBackendConfigs(); 
    } catch (error) {
      toast.error(`Error al guardar ${configToSave.name}.`);
    }
  };

  const handleSync = async (distributor: string) => {
    setSyncing(distributor);
    try {
      let result;
      
      // ✅ LOGICA DE SYNC COMPLETA
      if (distributor === 'newbytes') result = await syncService.syncNewBytes();
      else if (distributor === 'gruponucleo') result = await syncService.syncGrupoNucleo();
      else if (distributor === 'elit') result = await syncService.syncElit();
      else if (distributor === 'gamingcity') result = await syncService.syncGamingCity();
      else if (distributor === 'tgs') result = await syncService.syncTgs(); // <--- AHORA SÍ FUNCIONA

      console.log("Sync Result:", result);
      toast.success(`Sincronización de ${distributorSettings[distributor]?.name} completada.`);
      loadBackendConfigs(); 
    } catch (error: any) {
      console.error(error);
      toast.error(`Fallo al sincronizar: ${error.response?.data?.error || error.message}`);
    } finally {
      setSyncing(null);
    }
  };

  const togglePass = (dist: string) => {
    setShowPass(prev => ({ ...prev, [dist]: !prev[dist] }));
  };

  if (!isAdmin) return <div className="p-12 text-center text-muted-foreground">Acceso denegado.</div>;

  return (
    <div className="container mx-auto py-8 max-w-5xl px-4 animate-in fade-in">
      <h1 className="text-3xl font-bold mb-6">Configuración del Sistema</h1>
      
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="distributors">Distribuidores</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Parámetros Generales</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Cotización Dólar</Label>
                    <Input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Margen PC Default</Label>
                    <Input type="number" value={defaultMarkup} onChange={(e) => setDefaultMarkup(Number(e.target.value))} />
                  </div>
               </div>
               <Separator />
               <div className="space-y-4">
                  <h3 className="font-semibold">WhatsApp Proveedores</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(distributorSettings).map(([key, data]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{data.name}</Label>
                        <Input value={data.whatsapp} onChange={(e) => updateDistributorPhone(key, e.target.value)} />
                      </div>
                    ))}
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributors">
          {loading && configs.length === 0 ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary"/></div>
          ) : (
            <div className="grid gap-6">
              {Object.keys(distributorSettings).map((distKey) => {
                const config = getDistributorConfig(distKey);
                const dataName = distributorSettings[distKey].name;

                return (
                  <Card key={distKey} className="overflow-hidden border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 pb-4">
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="capitalize text-xl">{dataName}</CardTitle>
                          <CardDescription>Conexión API</CardDescription>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleSync(distKey)}
                        disabled={!!syncing}
                        className={syncing === distKey ? "opacity-80" : ""}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncing === distKey ? 'animate-spin' : ''}`} />
                        {syncing === distKey ? 'Sincronizando...' : 'Sincronizar'}
                      </Button>
                    </CardHeader>

                    <div className="bg-gray-50 px-6 py-2 flex items-center justify-between text-xs text-muted-foreground border-b">
                      <div className="flex gap-4">
                        <span>
                          🕒 Última Sync: {config.lastSync ? new Date(config.lastSync).toLocaleString() : 'Nunca'}
                        </span>
                        {config.syncStats && (
                          <span title={typeof config.syncStats === 'string' ? config.syncStats : JSON.stringify(config.syncStats)}>
                            📊 {(() => {
                              try {
                                const s = typeof config.syncStats === 'string' ? JSON.parse(config.syncStats) : config.syncStats;
                                // Ajuste para mostrar "procesados" si es TGS/Feed
                                return `${s.total || '?'} items (${s.processed ? 'Proc:' + s.processed : 'C:' + (s.created||0)})`;
                              } catch { return 'Datos...'; }
                            })()}
                          </span>
                        )}
                      </div>
                      <div className={`h-2 w-2 rounded-full ${config.lastSync ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        
                        {/* New Bytes & Elit (Token) */}
                        {(distKey === 'newbytes' || distKey === 'elit') && (
                          <div className="space-y-2">
                            <Label>Token API</Label>
                            <div className="relative">
                              <Input 
                                type={showPass[distKey] ? "text" : "password"}
                                value={config.credentials?.token || ''}
                                onChange={(e) => handleCredentialChange(distKey, 'token', e.target.value)}
                                className="pr-10"
                              />
                              <button type="button" onClick={() => togglePass(distKey)} className="absolute right-3 top-2.5 text-muted-foreground">
                                {showPass[distKey] ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Elit (User ID) */}
                        {distKey === 'elit' && (
                          <div className="space-y-2">
                            <Label>User ID</Label>
                            <Input 
                              value={config.credentials?.user_id || ''}
                              onChange={(e) => handleCredentialChange(distKey, 'user_id', e.target.value)}
                            />
                          </div>
                        )}

                        {/* Grupo Nucleo (User/Pass) */}
                        {distKey === 'gruponucleo' && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Usuario</Label>
                              <Input 
                                value={config.credentials?.user || ''}
                                onChange={(e) => handleCredentialChange(distKey, 'user', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Password</Label>
                              <div className="relative">
                                <Input 
                                  type={showPass[distKey] ? "text" : "password"}
                                  value={config.credentials?.password || ''}
                                  onChange={(e) => handleCredentialChange(distKey, 'password', e.target.value)}
                                  className="pr-10"
                                />
                                <button type="button" onClick={() => togglePass(distKey)} className="absolute right-3 top-2.5 text-muted-foreground">
                                  {showPass[distKey] ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Gaming City */}
                        {distKey === 'gamingcity' && (
                          <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded border border-blue-100">
                            <p><strong>Modo Scraping:</strong> Este proveedor es público.</p>
                            <p>Presiona <b>Sincronizar</b> para descargar la lista actualizada.</p>
                          </div>
                        )}

                        {/* TGS */}
                        {distKey === 'tgs' && (
                          <div className="text-sm text-muted-foreground bg-green-50 p-4 rounded border border-green-100">
                            <p><strong>Conexión Feed XML:</strong></p>
                            <p>El sistema descargará el stock desde <i>thegamershop.com.ar/feed...</i></p>
                            <p className="mt-1">Presiona <b>Sincronizar</b> para actualizar.</p>
                          </div>
                        )}

                        {/* Botón Guardar (Solo si tiene credenciales editables) */}
                        {distKey !== 'gamingcity' && distKey !== 'tgs' && (
                          <div className="flex justify-end pt-2">
                            <Button onClick={() => saveBackendConfig(distKey)} variant="secondary">
                              <Save className="mr-2 h-4 w-4" /> Guardar Credenciales
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}