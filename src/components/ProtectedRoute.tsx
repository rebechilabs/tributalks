import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'needs-onboarding';

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        console.log('[ProtectedRoute] Checking auth for:', location.pathname);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (cancelled) return;
        
        if (!session?.user) {
          console.log('[ProtectedRoute] No session found');
          setAuthState('unauthenticated');
          return;
        }

        console.log('[ProtectedRoute] Session found:', session.user.id);

        // If we don't require onboarding check, user is authenticated
        if (!requireOnboarding) {
          setAuthState('authenticated');
          return;
        }

        // Check onboarding status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('[ProtectedRoute] Profile error:', error);
          setAuthState('authenticated'); // Allow access if profile check fails
          return;
        }

        console.log('[ProtectedRoute] Profile:', profile);

        if (!profile?.onboarding_complete && location.pathname !== '/onboarding') {
          console.log('[ProtectedRoute] Needs onboarding');
          setAuthState('needs-onboarding');
        } else {
          setAuthState('authenticated');
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error:', error);
        if (!cancelled) setAuthState('unauthenticated');
      }
    };

    checkAuth();

    // Safety timeout
    const timeout = setTimeout(() => {
      if (!cancelled && authState === 'loading') {
        console.warn('[ProtectedRoute] Timeout - forcing auth check');
        setAuthState('unauthenticated');
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [requireOnboarding, location.pathname]);

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (authState === 'unauthenticated') {
    console.log('[ProtectedRoute] Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if needed
  if (authState === 'needs-onboarding') {
    console.log('[ProtectedRoute] Redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
