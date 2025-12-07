import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { Loader2 } from 'lucide-react';

// Componente interno que decide qué vista mostrar
function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si no está autenticado, mostramos Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Si está autenticado, mostramos la App Principal (Por ahora solo un placeholder)
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Bienvenido al Marketplace</h1>
        <p className="mb-4">Has iniciado sesión como: <strong>{user?.email}</strong> ({user?.role})</p>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

// Componente principal
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}