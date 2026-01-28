import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - Redireciona usuários autenticados para o dashboard
 * Usado em rotas como /login e /cadastro para evitar que usuários
 * já logados acessem essas páginas
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, profile, loading } = useAuth();

  // Enquanto verifica auth, mostra loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando...</p>
        </div>
      </div>
    );
  }

  // Se usuário está autenticado, redireciona
  if (user) {
    // Se onboarding não está completo, vai para onboarding
    if (profile && !profile.onboarding_complete) {
      return <Navigate to="/onboarding" replace />;
    }
    // Caso contrário, vai para dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Se não está autenticado, renderiza a página normalmente
  return <>{children}</>;
};
