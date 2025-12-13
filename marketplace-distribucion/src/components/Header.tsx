import { ShoppingCart, Search, User, LogOut, Settings, Monitor, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { usePcBuilder } from '@/context/PcBuilderContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartItemCount: number;
  onCartClick: () => void;
  onPcBuilderClick: () => void;
  exchangeRate: number;
  onNavigate: (view: 'catalog' | 'config') => void;
}

export function Header({ 
  searchQuery, 
  onSearchChange, 
  cartItemCount, 
  onCartClick,
  onPcBuilderClick,
  exchangeRate,
  onNavigate
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { totalBuildItems } = usePcBuilder();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        
        {/* LOGO: Clickeable para volver al inicio */}
        <div 
          className="flex items-center gap-2 font-bold text-xl mr-4 select-none cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => onNavigate('catalog')}
        >
          <div className="bg-primary text-primary-foreground p-1 rounded">
            TGS
          </div>
          <span className="hidden md:inline">Distribuidora</span>
        </div>

        {/* BUSCADOR */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos, SKU, marca..."
            className="pl-8 bg-muted/50 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-2 ml-auto">
          
          {/* Cotización */}
          <div className="hidden md:flex flex-col items-end mr-4 text-xs text-muted-foreground">
            <span>Cotización USD</span>
            <span className="font-mono font-bold text-foreground bg-gray-100 px-1.5 py-0.5 rounded">
              ${exchangeRate}
            </span>
          </div>

          {/* Botón PC Builder */}
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100" onClick={onPcBuilderClick}>
            <Monitor className="h-5 w-5" />
            {totalBuildItems > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-800 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in border border-white shadow-sm">
                {totalBuildItems}
              </span>
            )}
          </Button>

          {/* Botón Carrito */}
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100" onClick={onCartClick}>
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-in zoom-in shadow-sm">
                {cartItemCount}
              </span>
            )}
          </Button>

          {/* Menú Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>Mi Cuenta</span>
                  <span className="text-xs font-normal text-muted-foreground truncate">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onNavigate('catalog')} className="cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                Catálogo
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onNavigate('config')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}