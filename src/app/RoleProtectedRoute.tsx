import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * RoleProtectedRoute - Protege rotas baseadas em roles do usuário
 * 
 * Verifica se o usuário autenticado possui pelo menos uma das roles permitidas.
 * Se não possuir, redireciona para o dashboard principal.
 * 
 * @param children - Componente filho a ser renderizado se autorizado
 * @param allowedRoles - Array de roles permitidas (ex: ['PROFESSOR', 'MANTENEDORA_ADMIN'])
 */
export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário possui pelo menos uma das roles permitidas
  const userRoles = user?.user?.roles || [];
  const hasAllowedRole = userRoles.some((role: string) => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    console.warn(`Acesso negado: usuário não possui role permitida. Roles do usuário: ${userRoles.join(', ')}, Roles permitidas: ${allowedRoles.join(', ')}`);
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
