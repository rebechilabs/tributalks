import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  total_referrals: number;
  successful_referrals: number;
  created_at: string;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'expired' | 'cancelled';
  referred_at: string;
  subscription_started_at: string | null;
  qualified_at: string | null;
  reward_applied_at: string | null;
  discount_percentage: number;
}

// Gera código único no formato TRIBXXXX
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomPart = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `TRIB${randomPart}`;
}

// Calcula desconto baseado em indicações bem-sucedidas
export function calculateDiscount(successfulReferrals: number): number {
  if (successfulReferrals >= 10) return 20;
  if (successfulReferrals >= 5) return 15;
  if (successfulReferrals >= 3) return 10;
  if (successfulReferrals >= 1) return 5;
  return 0;
}

// Próximo nível de desconto
export function getNextDiscountLevel(successfulReferrals: number): { referralsNeeded: number; discount: number } | null {
  if (successfulReferrals >= 10) return null; // Já no máximo
  if (successfulReferrals >= 5) return { referralsNeeded: 10, discount: 20 };
  if (successfulReferrals >= 3) return { referralsNeeded: 5, discount: 15 };
  if (successfulReferrals >= 1) return { referralsNeeded: 3, discount: 10 };
  return { referralsNeeded: 1, discount: 5 };
}

export function useReferral() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCode, setIsCreatingCode] = useState(false);

  // Busca ou cria o código de indicação do usuário
  const fetchOrCreateCode = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Tenta buscar código existente
      const { data: existingCode, error: fetchError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingCode) {
        setReferralCode(existingCode as ReferralCode);
      } else {
        // Cria novo código
        setIsCreatingCode(true);
        let newCode = generateReferralCode();
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          const { data: inserted, error: insertError } = await supabase
            .from('referral_codes')
            .insert({
              user_id: user.id,
              code: newCode,
            })
            .select()
            .single();

          if (!insertError && inserted) {
            setReferralCode(inserted as ReferralCode);
            break;
          }

          // Se código já existe, tenta outro
          if (insertError?.code === '23505') {
            newCode = generateReferralCode();
            attempts++;
          } else {
            throw insertError;
          }
        }
        setIsCreatingCode(false);
      }
    } catch (error) {
      console.error('Erro ao buscar/criar código de indicação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seu código de indicação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Busca indicações feitas pelo usuário
  const fetchReferrals = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('referred_at', { ascending: false });

      if (error) throw error;
      setReferrals((data || []) as Referral[]);
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchOrCreateCode();
      fetchReferrals();
    }
  }, [user?.id, fetchOrCreateCode, fetchReferrals]);

  // Valida se um código de indicação existe (para uso no cadastro)
  const validateReferralCode = async (code: string): Promise<{ valid: boolean; referrerId?: string }> => {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('user_id, code')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error || !data) {
        return { valid: false };
      }

      return { valid: true, referrerId: data.user_id };
    } catch {
      return { valid: false };
    }
  };

  // Registra uma indicação (chamado após cadastro com código)
  const registerReferral = async (code: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const validation = await validateReferralCode(code);
      if (!validation.valid || !validation.referrerId) {
        return false;
      }

      // Não permite auto-indicação
      if (validation.referrerId === user.id) {
        return false;
      }

      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: validation.referrerId,
          referred_id: user.id,
          referral_code: code.toUpperCase(),
          status: 'pending',
        });

      if (error) {
        // Ignora erro de duplicata (usuário já foi indicado)
        if (error.code === '23505') {
          return true;
        }
        throw error;
      }

      // Incrementa contador usando update direto (evita problema de types)
      const { data: currentData } = await supabase
        .from('referral_codes')
        .select('total_referrals')
        .eq('user_id', validation.referrerId)
        .single();

      if (currentData) {
        await supabase
          .from('referral_codes')
          .update({ total_referrals: (currentData.total_referrals || 0) + 1 })
          .eq('user_id', validation.referrerId);
      }

      return true;
    } catch (error) {
      console.error('Erro ao registrar indicação:', error);
      return false;
    }
  };

  const currentDiscount = calculateDiscount(referralCode?.successful_referrals || 0);
  const nextLevel = getNextDiscountLevel(referralCode?.successful_referrals || 0);

  const referralLink = referralCode
    ? `${window.location.origin}/cadastro?ref=${referralCode.code}`
    : null;

  const pendingCount = referrals.filter(r => r.status === 'pending').length;
  const qualifiedCount = referrals.filter(r => r.status === 'qualified').length;
  const rewardedCount = referrals.filter(r => r.status === 'rewarded').length;

  return {
    referralCode,
    referralLink,
    referrals,
    isLoading,
    isCreatingCode,
    currentDiscount,
    nextLevel,
    pendingCount,
    qualifiedCount,
    rewardedCount,
    validateReferralCode,
    registerReferral,
    refetch: () => {
      fetchOrCreateCode();
      fetchReferrals();
    },
  };
}
