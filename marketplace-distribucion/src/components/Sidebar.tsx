import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Opcional, si no tienes ScrollArea usa div con overflow
import { Separator } from "@/components/ui/separator"; // Opcional, o hr

interface SidebarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

export function Sidebar({ 
  categories, 
  selectedCategories, 
  onCategoryChange,
  onClearFilters
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 flex-col gap-6 pr-6 border-r">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtros</h3>
        {(selectedCategories.length > 0) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs h-8 px-2 text-muted-foreground hover:text-primary"
          >
            Limpiar
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm">Categorías</h4>
        <div className="space-y-3">
           {/* Si no hay categorías, mostramos mensaje */}
           {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">Cargando categorías...</p>
           )}

           {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${category}`} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryChange(category)}
              />
              <Label 
                htmlFor={`cat-${category}`}
                className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}