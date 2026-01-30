import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CONFIG } from '@/config/site';
import { CLARA_DAILY_LIMITS, type UserPlan } from './useFeatureAccess';

interface UserCredits {
  balance: number;
  totalPurchased: number;
  purchaseCount: number;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  priceFormatted: string;
  paymentLink: string;
}

// Number of purchases before suggesting Professional plan
export const UPSELL_THRESHOLD = 3;

export function getCreditPackages(): CreditPackage[] {
  return [
    {
      id: 'credits_30',
      credits: 30,
      price: 74.90,
      priceFormatted: 'R$ 74,90',
      paymentLink: CONFIG.PAYMENT_LINKS.CREDITS_30 || '',
    },
    {
      id: 'credits_50',
      credits: 50,
      price: 109.90,
      priceFormatted: 'R$ 109,90',
      paymentLink: CONFIG.PAYMENT_LINKS.CREDITS_50 || '',
    },
    {
      id: 'credits_100',
      credits: 100,
      price: 199.90,
      priceFormatted: 'R$ 199,90',
      paymentLink: CONFIG.PAYMENT_LINKS.CREDITS_100 || '',
    },
  ];
}

// Mapeamento de planos legados
const LEGACY_PLAN_MAP: Record<string, UserPlan> = {
  'FREE': 'FREE',
  'BASICO': 'STARTER',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

export function useUserCredits() {
  const { user, profile } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normaliza o plano
  const rawPlan = (profile?.plano as string) || 'FREE';
  const userPlan: UserPlan = LEGACY_PLAN_MAP[rawPlan] || 'FREE';
  
  const isStarter = userPlan === 'STARTER';
  const isNavigator = userPlan === 'NAVIGATOR';
  const isProfessionalOrHigher = userPlan === 'PROFESSIONAL' || userPlan === 'ENTERPRISE';
  
  // Pode comprar créditos extras (STARTER e NAVIGATOR)
  const canBuyCredits = isStarter || isNavigator;
  
  // Limite diário do plano
  const dailyLimit = CLARA_DAILY_LIMITS[userPlan];
  
  // Mensagens restantes hoje (do limite diário + créditos extras comprados)
  const dailyRemaining = typeof dailyLimit === 'number' 
    ? Math.max(0, dailyLimit - dailyUsage) + (credits?.balance || 0)
    : 'unlimited';
  
  // Show upsell after 3+ purchases
  const shouldShowUpsell = credits && credits.purchaseCount >= UPSELL_THRESHOLD && canBuyCredits;

  useEffect(() => {
    if (!user) {
      setCredits(null);
      setDailyUsage(0);
      setLoading(false);
      return;
    }

    fetchCredits();
    fetchDailyUsage();
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('balance, total_purchased, purchase_count')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setCredits({
          balance: data.balance,
          totalPurchased: data.total_purchased,
          purchaseCount: data.purchase_count,
        });
      } else {
        // Create initial credits record
        const { data: newData, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id, balance: 0, total_purchased: 0, purchase_count: 0 })
          .select('balance, total_purchased, purchase_count')
          .single();

        if (insertError) throw insertError;

        if (newData) {
          setCredits({
            balance: newData.balance,
            totalPurchased: newData.total_purchased,
            purchaseCount: newData.purchase_count,
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching credits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyUsage = async () => {
    if (!user) return;
    
    try {
      // Busca uso de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error: countError } = await supabase
        .from('credit_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('feature', 'tribubot')
        .gte('created_at', today.toISOString());

      if (countError) throw countError;
      
      setDailyUsage(count || 0);
    } catch (err) {
      console.error('Error fetching daily usage:', err);
    }
  };

  const consumeCredit = async (feature: string = 'tribubot', metadata: object = {}): Promise<boolean> => {
    if (!user) return false;
    
    // Professional+ users have unlimited access
    if (isProfessionalOrHigher) {
      // Log usage but don't check limits
      await supabase
        .from('credit_usage')
        .insert({
          user_id: user.id,
          credits_used: 0, // Não consome crédito
          feature,
          metadata: metadata as any,
        });
      return true;
    }
    
    // FREE não tem acesso à Clara
    if (userPlan === 'FREE') return false;
    
    // STARTER e NAVIGATOR: verificar limite diário + créditos extras
    const currentDailyLimit = typeof dailyLimit === 'number' ? dailyLimit : 0;
    
    // Ainda tem mensagens do limite diário?
    if (dailyUsage < currentDailyLimit) {
      // Usa do limite diário (não consome crédito comprado)
      await supabase
        .from('credit_usage')
        .insert({
          user_id: user.id,
          credits_used: 0, // Contabiliza uso mas não crédito
          feature,
          metadata: metadata as any,
        });
      
      setDailyUsage(prev => prev + 1);
      return true;
    }
    
    // Limite diário esgotado - verificar créditos comprados
    if (!credits || credits.balance <= 0) return false;

    try {
      // Decrement balance from purchased credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ balance: credits.balance - 1 })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log usage with credit consumption
      await supabase
        .from('credit_usage')
        .insert({
          user_id: user.id,
          credits_used: 1,
          feature,
          metadata: metadata as any,
        });

      // Update local state
      setCredits(prev => prev ? { ...prev, balance: prev.balance - 1 } : null);
      
      return true;
    } catch (err) {
      console.error('Error consuming credit:', err);
      return false;
    }
  };

  const addCredits = async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const currentBalance = credits?.balance || 0;
      const currentTotal = credits?.totalPurchased || 0;
      const currentCount = credits?.purchaseCount || 0;

      const { error: updateError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          balance: currentBalance + amount,
          total_purchased: currentTotal + amount,
          purchase_count: currentCount + 1,
        });

      if (updateError) throw updateError;

      await fetchCredits();
      return true;
    } catch (err) {
      console.error('Error adding credits:', err);
      return false;
    }
  };

  // Verifica se pode enviar mensagem (para UI)
  const canSendMessage = (): boolean => {
    if (isProfessionalOrHigher) return true;
    if (userPlan === 'FREE') return false;
    
    const currentDailyLimit = typeof dailyLimit === 'number' ? dailyLimit : 0;
    
    // Tem mensagens do limite diário?
    if (dailyUsage < currentDailyLimit) return true;
    
    // Tem créditos comprados?
    return (credits?.balance || 0) > 0;
  };

  return {
    credits,
    dailyUsage,
    dailyLimit,
    dailyRemaining,
    loading,
    error,
    userPlan,
    isStarter,
    isNavigator,
    isProfessionalOrHigher,
    canBuyCredits,
    shouldShowUpsell,
    canSendMessage,
    consumeCredit,
    addCredits,
    refetch: fetchCredits,
  };
}
