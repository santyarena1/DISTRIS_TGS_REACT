import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter, ArrowUpDown, Eye } from "lucide-react";
import { useSettings, TaxMode } from "@/context/SettingsContext";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterBarProps {
  brands: string[];
  selectedBrands: string[];
  onBrandChange: (brand: string) => void;
  distributors: string[];
  selectedDistributors: string[];
  onDistributorChange: (dist: string) => void;
  sortBy: string;
  onSortByChange: (sort: 'price-asc' | 'price-desc' | 'name') => void;
  hideOutOfStock: boolean;
  onHideOutOfStockChange: (val: boolean) => void;
}

export function FilterBar({
  brands,
  selectedBrands,
  onBrandChange,
  distributors,
  selectedDistributors,
  onDistributorChange,
  sortBy,
  onSortByChange,
  hideOutOfStock,
  onHideOutOfStockChange
}: FilterBarProps) {
  
  const { taxMode, setTaxMode, currency, setCurrency } = useSettings();

  const sortLabel = {
    'name': 'Nombre (A-Z)',
    'price-asc': 'Precio: Menor a Mayor',
    'price-desc': 'Precio: Mayor a Menor',
  }[sortBy];

  const taxLabel = {
    'final': 'Precio Final (IVA Inc)',
    'breakdown': 'Detallar Impuestos',
    'half-vat': 'Medio IVA (10.5%)',
  }[taxMode];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-1">
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-dashed">
            <Filter className="mr-2 h-4 w-4" />
            Distribuidores
            {selectedDistributors.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                {selectedDistributors.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Seleccionar Proveedor</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {distributors.map((dist) => (
            <div key={dist} className="flex items-center space-x-2 px-2 py-1.5">
              <Checkbox
                checked={selectedDistributors.includes(dist)}
                onCheckedChange={() => onDistributorChange(dist)}
              />
              <Label className="text-sm capitalize cursor-pointer">{dist}</Label>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-dashed">
            Marcas
            {selectedBrands.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                {selectedBrands.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2 px-2 py-1.5">
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => onBrandChange(brand)}
              />
              <Label className="text-sm cursor-pointer">{brand}</Label>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-md border shadow-sm h-9">
        <Switch 
          id="stock-filter" 
          checked={hideOutOfStock}
          onCheckedChange={onHideOutOfStockChange}
        />
        <Label htmlFor="stock-filter" className="text-sm cursor-pointer font-normal">Con Stock</Label>
      </div>

      <div className="flex-1" />

      <div className="bg-muted p-1 rounded-md flex h-9">
        <button 
          onClick={() => setCurrency('USD')}
          className={`px-3 text-xs font-medium rounded-sm transition-all ${currency === 'USD' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          USD
        </button>
        <button 
          onClick={() => setCurrency('ARS')}
          className={`px-3 text-xs font-medium rounded-sm transition-all ${currency === 'ARS' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          ARS
        </button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 hidden sm:flex">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
            {taxLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Visualización de Precios</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTaxMode('final' as TaxMode)}>Precio Final</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTaxMode('breakdown' as TaxMode)}>Base + IVA (Detalle)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTaxMode('half-vat' as TaxMode)}>Calcular Medio IVA</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortByChange('name')}>
            Nombre (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortByChange('price-asc')}>
            Precio: Menor a Mayor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortByChange('price-desc')}>
            Precio: Mayor a Menor
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

