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
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('[ProtectedRoute] Checking auth...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (!session?.user) {
          console.log('[ProtectedRoute] No session, unauthenticated');
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!mounted) return;

        console.log('[ProtectedRoute] Profile check:', profile?.onboarding_complete);

        if (!profile?.onboarding_complete && location.pathname !== '/onboarding') {
          setAuthState('needs-onboarding');
        } else {
          setAuthState('authenticated');
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error:', error);
        if (mounted) setAuthState('unauthenticated');
      }
    };

    checkAuth();

    // Timeout safety
    const timeout = setTimeout(() => {
      if (mounted && authState === 'loading') {
        console.warn('[ProtectedRoute] Force completing after timeout');
        setAuthState('unauthenticated');
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [requireOnboarding, location.pathname]);

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (authState === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if needed
  if (authState === 'needs-onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
