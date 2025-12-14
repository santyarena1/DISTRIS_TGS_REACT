import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services';
import { Supplier, ColumnMapping } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, MoreVertical, Edit, Trash2, Upload, FileSpreadsheet, Map } from 'lucide-react';
import { toast } from 'sonner';

const PRODUCT_FIELDS = [
  { key: 'sku', label: 'SKU', required: true },
  { key: 'name', label: 'Nombre', required: true },
  { key: 'description', label: 'Descripción', required: false },
  { key: 'price', label: 'Precio', required: true },
  { key: 'stock', label: 'Stock', required: true },
  { key: 'category', label: 'Categoría', required: false },
  { key: 'brand', label: 'Marca', required: false },
  { key: 'imageUrl', label: 'URL Imagen', required: false },
  { key: 'vat', label: 'IVA', required: false },
];

export function SuppliersPage() {
  const { canManageUsers } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    active: true
  });
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canManageUsers) {
      loadSuppliers();
    }
  }, [canManageUsers]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error cargando proveedores', error);
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        active: supplier.active
      });
      setColumnMapping(supplier.columnMapping || {});
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        active: true
      });
      setColumnMapping({});
      setExcelFile(null);
      setExcelColumns([]);
      setSampleData([]);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setShowMappingDialog(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      active: true
    });
    setColumnMapping({});
    setExcelFile(null);
    setExcelColumns([]);
    setSampleData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Por favor seleccioná un archivo Excel (.xlsx o .xls)');
      return;
    }

    setExcelFile(file);
    setLoading(true);

    try {
      const result = await apiClient.parseExcelFile(file);
      console.log('✅ Excel parseado correctamente:', result);
      
      if (!result.columns || result.columns.length === 0) {
        toast.error('El archivo Excel no tiene columnas válidas');
        setExcelFile(null);
        setExcelColumns([]);
        setSampleData([]);
        return;
      }
      
      // Establecer columnas y datos primero
      setExcelColumns(result.columns);
      setSampleData(result.sampleData || []);
      
      // Si es edición y ya tiene mapeo, mantenerlo pero validar
      if (editingSupplier && editingSupplier.columnMapping) {
        const existingMapping = { ...editingSupplier.columnMapping };
        // Filtrar mapeos que ya no existen en el nuevo Excel
        Object.keys(existingMapping).forEach(key => {
          const mappedCol = existingMapping[key];
          if (mappedCol && !result.columns.includes(mappedCol)) {
            console.warn(`Columna mapeada "${mappedCol}" no existe en el nuevo Excel, removiendo mapeo`);
            delete existingMapping[key];
          }
        });
        setColumnMapping(existingMapping);
        console.log('Mapeo existente validado:', existingMapping);
      } else {
        // Auto-mapeo inteligente (buscar columnas similares)
        const autoMapping: ColumnMapping = {};
        PRODUCT_FIELDS.forEach(field => {
          const match = result.columns.find(col => {
            const colLower = col.toLowerCase().trim();
            const keyLower = field.key.toLowerCase();
            const labelLower = field.label.toLowerCase();
            return colLower === keyLower || 
                   colLower === labelLower ||
                   colLower.includes(keyLower) ||
                   colLower.includes(labelLower);
          });
          if (match) {
            autoMapping[field.key] = match;
          }
        });
        setColumnMapping(autoMapping);
        console.log('Auto-mapeo generado:', autoMapping);
      }
      
      // Abrir diálogo de mapeo después de establecer todo el estado
      setTimeout(() => {
        setShowMappingDialog(true);
      }, 100);
    } catch (error: any) {
      console.error('❌ Error al parsear Excel:', error);
      toast.error(error.message || 'Error al leer el archivo Excel');
      setExcelFile(null);
      setExcelColumns([]);
      setSampleData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!editingSupplier && !excelFile) {
      toast.error('Debés cargar un archivo Excel para crear el proveedor');
      return;
    }

    if (!editingSupplier && Object.keys(columnMapping).length === 0) {
      toast.error('Debés configurar el mapeo de columnas');
      return;
    }

    // Validar que los campos requeridos estén mapeados
    const requiredFields = PRODUCT_FIELDS.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !columnMapping[f.key]);
    if (missingFields.length > 0) {
      toast.error(`Faltan mapear campos requeridos: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      console.log('Guardando proveedor con mapeo:', columnMapping);
      if (editingSupplier) {
        const updated = await apiClient.updateSupplier(editingSupplier.id, {
          name: formData.name,
          active: formData.active,
          columnMapping
        });
        console.log('Proveedor actualizado:', updated);
        toast.success('Proveedor actualizado');
      } else {
        const created = await apiClient.createSupplier({
          name: formData.name,
          active: formData.active,
          columnMapping
        });
        console.log('Proveedor creado:', created);
        toast.success('Proveedor creado');
      }
      handleCloseDialog();
      loadSuppliers();
    } catch (error: any) {
      console.error('Error al guardar proveedor:', error);
      toast.error(error.message || 'Error al guardar proveedor');
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    
    try {
      await apiClient.deleteSupplier(supplierId);
      toast.success('Proveedor eliminado');
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar proveedor');
    }
  };

  const handleImportProducts = async (supplierId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        const products = await apiClient.importProductsFromExcel(supplierId, file);
        toast.success(`${products.length} productos importados correctamente`);
        loadSuppliers();
      } catch (error: any) {
        toast.error(error.message || 'Error al importar productos');
      } finally {
        setLoading(false);
      }
    };
    fileInput.click();
  };

  if (!canManageUsers) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">No tenés permisos para gestionar proveedores.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => handleOpenDialog()}>
          <Upload className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {loading && !suppliers.length ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>
                      Creado: {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('es-AR') : '-'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(supplier)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleImportProducts(supplier.id)}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Importar Productos
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(supplier.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Badge variant={supplier.active ? 'default' : 'secondary'}>
                      {supplier.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mapeo configurado:</span>
                    <Badge variant="outline">
                      {Object.keys(supplier.columnMapping || {}).length} campos
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {suppliers.length === 0 && (
            <div className="col-span-full p-12 text-center text-muted-foreground">
              No hay proveedores configurados. Creá uno para comenzar.
            </div>
          )}
        </div>
      )}

      {/* Dialog para crear/editar proveedor */}
      <Dialog open={showDialog && !showMappingDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
            <DialogDescription>
              {editingSupplier 
                ? 'Modificá los datos del proveedor' 
                : 'Cargá un archivo Excel y configurá el mapeo de columnas'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Proveedor *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Proveedor ABC"
                />
              </div>

              {!editingSupplier && (
                <div className="space-y-2">
                  <Label htmlFor="excelFile">Archivo Excel *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="excelFile"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cargá un archivo Excel para detectar las columnas y configurar el mapeo
                  </p>
                </div>
              )}

              {editingSupplier && (
                <div className="space-y-2">
                  <Label>Mapeo de Columnas</Label>
                  <div className="border rounded-md p-4 bg-muted/50">
                    <div className="grid gap-2">
                      {PRODUCT_FIELDS.map(field => {
                        const mappedColumn = columnMapping[field.key];
                        return (
                          <div key={field.key} className="flex items-center justify-between text-sm">
                            <span className={field.required ? 'font-medium' : ''}>
                              {field.label} {field.required && <span className="text-destructive">*</span>}
                            </span>
                            <span className="text-muted-foreground">
                              {mappedColumn || 'No mapeado'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Actualizar Mapeo desde Excel
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Proveedor activo
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {editingSupplier ? 'Guardar Cambios' : 'Continuar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para mapeo de columnas */}
      <Dialog open={showMappingDialog} onOpenChange={(open) => {
        setShowMappingDialog(open);
        if (!open) {
          // Si se cierra sin confirmar y no hay proveedor editando, limpiar
          if (!editingSupplier) {
            setExcelFile(null);
            setExcelColumns([]);
            setSampleData([]);
            setColumnMapping({});
          }
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mapeo de Columnas</DialogTitle>
            <DialogDescription>
              Asigná cada columna del Excel a un campo del sistema. Los campos marcados con * son obligatorios.
              {excelColumns.length > 0 && (
                <span className="block mt-2 text-xs">
                  Columnas encontradas: {excelColumns.length} - {excelColumns.join(', ')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {excelColumns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay columnas disponibles. Por favor, cargá un archivo Excel válido.</p>
              </div>
            ) : (
              <>
                {PRODUCT_FIELDS.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`mapping-${field.key}`}>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                <select
                  id={`mapping-${field.key}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={columnMapping[field.key] || ''}
                  onChange={(e) => {
                    console.log('Cambiando mapeo para', field.key, 'a', e.target.value);
                    const newMapping = { ...columnMapping };
                    if (e.target.value) {
                      newMapping[field.key] = e.target.value;
                    } else {
                      delete newMapping[field.key];
                    }
                    console.log('Nuevo mapeo:', newMapping);
                    setColumnMapping(newMapping);
                  }}
                  required={field.required}
                  disabled={excelColumns.length === 0}
                >
                  <option value="">-- Seleccionar columna --</option>
                  {excelColumns.length === 0 ? (
                    <option value="" disabled>No hay columnas disponibles</option>
                  ) : (
                    excelColumns.map(col => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ))}

            {sampleData.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Vista Previa (primeras filas)</Label>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {excelColumns.map(col => (
                          <th key={col} className="px-3 py-2 text-left border-b">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.map((row, idx) => (
                        <tr key={idx}>
                          {excelColumns.map(col => (
                            <td key={col} className="px-3 py-2 border-b">
                              {row[col] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowMappingDialog(false);
                // Si se cancela y no hay proveedor editando, limpiar todo
                if (!editingSupplier) {
                  setExcelFile(null);
                  setExcelColumns([]);
                  setSampleData([]);
                  setColumnMapping({});
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                console.log('Confirmando mapeo:', columnMapping);
                console.log('Columnas disponibles:', excelColumns);
                
                const requiredFields = PRODUCT_FIELDS.filter(f => f.required);
                const missingFields = requiredFields.filter(f => !columnMapping[f.key]);
                
                if (missingFields.length > 0) {
                  toast.error(`Faltan mapear campos requeridos: ${missingFields.map(f => f.label).join(', ')}`);
                  return;
                }
                
                // Validar que las columnas mapeadas existan en el Excel
                const invalidMappings: string[] = [];
                Object.entries(columnMapping).forEach(([fieldKey, excelCol]) => {
                  if (excelCol && !excelColumns.includes(excelCol)) {
                    const fieldLabel = PRODUCT_FIELDS.find(f => f.key === fieldKey)?.label || fieldKey;
                    invalidMappings.push(`${fieldLabel} -> "${excelCol}"`);
                  }
                });
                
                if (invalidMappings.length > 0) {
                  toast.error(`Columnas inválidas: ${invalidMappings.join(', ')}`);
                  return;
                }
                
                toast.success('Mapeo confirmado');
                setShowMappingDialog(false);
              }}
            >
              Confirmar Mapeo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

