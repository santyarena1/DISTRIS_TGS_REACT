import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services';
import { User, Company } from '@/types';
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
import { Loader2, Plus, MoreVertical, Edit, Trash2, UserPlus, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export function UsersPage() {
  const { user: currentUser, isSuperAdmin, canManageUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user' as 'superadmin' | 'admin' | 'user',
    companyId: '',
    active: true
  });

  useEffect(() => {
    if (canManageUsers) {
      loadData();
    }
  }, [canManageUsers]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, companiesData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getCompanies()
      ]);
      
      // Filtrar usuarios según el rol
      let filteredUsers = usersData;
      if (!isSuperAdmin && currentUser?.companyId) {
        // Admin de empresa solo ve usuarios de su empresa
        filteredUsers = usersData.filter(u => u.companyId === currentUser.companyId);
      }
      
      setUsers(filteredUsers);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error cargando datos', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        companyId: user.companyId || '',
        active: user.active !== undefined ? user.active : true
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user',
        companyId: isSuperAdmin ? '' : (currentUser?.companyId || ''),
        active: true
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'user',
      companyId: '',
      active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('El email es requerido');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (formData.role === 'admin' && !formData.companyId && !isSuperAdmin) {
      toast.error('Debe asignar una empresa al administrador');
      return;
    }

    try {
      if (editingUser) {
        const updateData: Partial<User> = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          companyId: formData.companyId || null,
          active: formData.active
        };
        if (formData.password) {
          // En un sistema real, esto se manejaría en el backend
          updateData.password = formData.password;
        }
        await apiClient.updateUser(editingUser.id, updateData);
        toast.success('Usuario actualizado');
      } else {
        await apiClient.createUser({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          companyId: formData.companyId || null,
          active: formData.active
        });
        toast.success('Usuario creado');
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar usuario');
    }
  };

  const handleDelete = async (userId: string | number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await apiClient.deleteUser(userId);
      toast.success('Usuario eliminado');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar usuario');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'superadmin') return 'destructive';
    if (role === 'admin') return 'default';
    return 'secondary';
  };

  const getRoleLabel = (role: string) => {
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    return 'Usuario';
  };

  if (!canManageUsers) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No tenés permisos para gestionar usuarios.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? 'Administrá usuarios de todas las empresas' 
              : `Administrá usuarios de ${currentUser?.companyName || 'tu empresa'}`}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Usuario</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Rol</th>
                    {isSuperAdmin && (
                      <th className="px-6 py-3 text-left text-sm font-semibold">Empresa</th>
                    )}
                    <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Creado</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.companyName || 'Sin empresa'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <Badge variant={user.active ? 'default' : 'secondary'}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No hay usuarios para mostrar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Modificá los datos del usuario' 
                : 'Completá los datos para crear un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser ? 'Dejar vacío para mantener la actual' : ''}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    disabled={!isSuperAdmin && formData.role === 'superadmin'}
                  >
                    {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                    <option value="admin">Admin</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>
                {(isSuperAdmin || formData.role === 'admin') && (
                  <div className="space-y-2">
                    <Label htmlFor="companyId">
                      Empresa {formData.role === 'admin' && !isSuperAdmin && '*'}
                    </Label>
                    <select
                      id="companyId"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      required={formData.role === 'admin' && !isSuperAdmin}
                    >
                      <option value="">Sin empresa</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Usuario activo
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

