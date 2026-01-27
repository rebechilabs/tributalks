import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Fetch fresh profile directly to avoid stale context data
  useEffect(() => {
    const checkProfile = async () => {
      if (user && requireOnboarding) {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setOnboardingComplete(data?.onboarding_complete ?? false);
      }
      setProfileChecked(true);
    };

    if (!loading && user) {
      checkProfile();
    } else if (!loading && !user) {
      setProfileChecked(true);
    }
  }, [user, loading, requireOnboarding]);

  if (loading || !profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if profile is incomplete
  if (requireOnboarding && onboardingComplete === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
