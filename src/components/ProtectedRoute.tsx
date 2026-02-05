import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

/**
 * ProtectedRoute - Protege rotas que requerem autenticação
 * Fluxo: Login → Setup → Welcome → Dashboard
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

  // Aguardar o perfil carregar antes de decidir sobre redirecionamentos
  if (profile === null) {
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

  // Check onboarding requirements only if requireOnboarding is true
  if (requireOnboarding) {
    // If onboarding not complete and not on onboarding page, redirect
    if (!profile.onboarding_complete && location.pathname !== '/onboarding') {
      console.log('[ProtectedRoute] Needs onboarding, redirecting');
      return <Navigate to="/onboarding" replace />;
    }

    // If onboarding complete but setup not complete, redirect to setup
    if (profile.onboarding_complete && !profile.setup_complete && location.pathname !== '/setup') {
      console.log('[ProtectedRoute] Needs setup, redirecting to /setup');
      return <Navigate to="/setup" replace />;
    }

    // If setup complete but welcome not seen, redirect to welcome
    if (profile.setup_complete && !profile.welcome_seen && location.pathname !== '/welcome') {
      console.log('[ProtectedRoute] Needs welcome, redirecting to /welcome');
      return <Navigate to="/welcome" replace />;
    }
  }

  // Redirect to home when visiting /dashboard directly after full setup
  if (
    profile.setup_complete &&
    profile.welcome_seen &&
    location.pathname === '/dashboard' &&
    !location.state?.skipPlanRedirect
  ) {
    console.log('[ProtectedRoute] Redirecting to home');
    return <Navigate to="/dashboard/home" state={{ skipPlanRedirect: true }} replace />;
  }

  return <>{children}</>;
};
