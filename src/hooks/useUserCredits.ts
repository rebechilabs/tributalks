import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CONFIG } from '@/config/site';

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
      id: 'credits_10',
      credits: 10,
      price: 29.90,
      priceFormatted: 'R$ 29,90',
      paymentLink: CONFIG.STRIPE_PAYMENT_LINKS.CREDITS_10 || '',
    },
    {
      id: 'credits_20',
      credits: 20,
      price: 54.90,
      priceFormatted: 'R$ 54,90',
      paymentLink: CONFIG.STRIPE_PAYMENT_LINKS.CREDITS_20 || '',
    },
    {
      id: 'credits_30',
      credits: 30,
      price: 74.90,
      priceFormatted: 'R$ 74,90',
      paymentLink: CONFIG.STRIPE_PAYMENT_LINKS.CREDITS_30 || '',
    },
  ];
}

export function useUserCredits() {
  const { user, profile } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userPlan = (profile?.plano as string) || 'FREE';
  const isNavigator = userPlan === 'NAVIGATOR';
  const isProfessionalOrHigher = userPlan === 'PROFESSIONAL' || userPlan === 'ENTERPRISE';
  
  // Show upsell after 3+ purchases
  const shouldShowUpsell = credits && credits.purchaseCount >= UPSELL_THRESHOLD;

  useEffect(() => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    fetchCredits();
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

  const consumeCredit = async (feature: string = 'tribubot', metadata: object = {}): Promise<boolean> => {
    if (!user || !credits) return false;
    
    // Professional+ users have unlimited access
    if (isProfessionalOrHigher) return true;
    
    // Navigator users check balance
    if (credits.balance <= 0) return false;

    try {
      // Decrement balance
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ balance: credits.balance - 1 })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log usage
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

  return {
    credits,
    loading,
    error,
    isNavigator,
    isProfessionalOrHigher,
    shouldShowUpsell,
    consumeCredit,
    addCredits,
    refetch: fetchCredits,
  };
}
