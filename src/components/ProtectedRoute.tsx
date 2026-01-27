import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkState, setCheckState] = useState<'pending' | 'checking' | 'done'>('pending');
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  const checkProfile = useCallback(async (userId: string) => {
    if (!requireOnboarding) {
      setCheckState('done');
      return;
    }
    
    setCheckState('checking');
    try {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('user_id', userId)
        .maybeSingle();
      
      setOnboardingComplete(data?.onboarding_complete ?? false);
    } catch (error) {
      console.error('Error checking profile:', error);
      setOnboardingComplete(false);
    } finally {
      setCheckState('done');
    }
  }, [requireOnboarding]);

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      checkProfile(user.id);
    } else {
      setCheckState('done');
    }
  }, [user, loading, checkProfile]);

  // Timeout separado - só executa uma vez no mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCheckState(prev => {
        if (prev !== 'done') {
          console.warn('[ProtectedRoute] Force completing after timeout');
          return 'done';
        }
        return prev;
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Loading state
  if (loading || checkState !== 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if needed
  if (requireOnboarding && onboardingComplete === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
