import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

/**
 * Determina a rota padrão - todos vão para Home inteligente
 * A Home detecta o estado do usuário e direciona para o próximo passo
 */
const getDefaultRoute = (): string => {
  return '/dashboard/home';
};

/**
 * ProtectedRoute - Protege rotas que requerem autenticação
 * Usa o hook useAuth para verificar estado de autenticação
 * Redireciona por plano após onboarding completo
 */
export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, profile, loading } = useAuth();

  // Loading state - aguarda inicialização do auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redireciona para login
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Aguardar o perfil carregar antes de decidir sobre onboarding
  if (requireOnboarding && profile === null) {
    console.log('[ProtectedRoute] Waiting for profile to load...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Se requer onboarding e não está completo, redireciona
  if (requireOnboarding && profile && !profile.onboarding_complete && location.pathname !== '/onboarding') {
    console.log('[ProtectedRoute] Needs onboarding, redirecting');
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect para Home na primeira visita ao dashboard genérico
  if (
    profile?.onboarding_complete &&
    location.pathname === '/dashboard' &&
    !location.state?.skipPlanRedirect
  ) {
    const defaultRoute = getDefaultRoute();
    console.log('[ProtectedRoute] Redirecting to home:', defaultRoute);
    return <Navigate to={defaultRoute} state={{ skipPlanRedirect: true }} replace />;
  }

  return <>{children}</>;
};
