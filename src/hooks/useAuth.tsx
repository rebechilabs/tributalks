import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  nome: string | null;
  empresa: string | null;
  regime: 'SIMPLES' | 'PRESUMIDO' | 'REAL' | null;
  setor: 'industria' | 'comercio' | 'servicos' | 'tecnologia' | 'outro' | null;
  faturamento_mensal: number | null;
  estado: string | null;
  cnae: string | null;
  percentual_vendas_pj: number | null;
  plano: 'FREE' | 'BASICO' | 'PROFISSIONAL' | 'PREMIUM' | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_period_end: string | null;
  onboarding_complete: boolean | null;
  notif_novidades: boolean | null;
  notif_legislacao: boolean | null;
  notif_consultorias: boolean | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[Auth] Profile fetch error:', error);
        return null;
      }
      return data as Profile | null;
    } catch (err) {
      console.error('[Auth] Profile fetch exception:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      // Small delay to give webhook time to process
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[Auth] Refreshing profile for user:', user.id);
      const profileData = await fetchProfile(user.id);
      console.log('[Auth] Profile refreshed:', profileData?.plano, 'onboarding:', profileData?.onboarding_complete);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Force complete loading after 3s max
    const forceTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('[Auth] Force completing after timeout');
        setLoading(false);
      }
    }, 3000);

    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('[Auth] Session:', !!currentSession?.user);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id);
          if (mounted) setProfile(profileData);
        }
        
        if (mounted) {
          clearTimeout(forceTimeout);
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Init error:', error);
        if (mounted) {
          clearTimeout(forceTimeout);
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log('[Auth] State change:', event);
        
        // Update session on meaningful events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            // Defer profile fetch to avoid blocking
            setTimeout(async () => {
              if (!mounted) return;
              const profileData = await fetchProfile(newSession.user.id);
              if (mounted) setProfile(profileData);
            }, 0);
          } else {
            setProfile(null);
          }
          
          // Mark loading as complete
          if (mounted) {
            clearTimeout(forceTimeout);
            setLoading(false);
          }
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      clearTimeout(forceTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome }
      }
    });

    if (error) throw error;

    // Update profile with nome after signup
    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser) {
      await supabase
        .from('profiles')
        .update({ nome })
        .eq('user_id', newUser.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signInWithMagicLink,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
