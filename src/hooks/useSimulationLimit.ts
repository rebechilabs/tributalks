import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SimulationLimitResult {
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar a contagem de simulações do mês atual para uma calculadora específica
 * Usado para limitar o uso de calculadoras no plano grátis
 */
export function useSimulationLimit(calculatorSlug: string): SimulationLimitResult {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Início do mês atual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { count: simulationCount, error: queryError } = await supabase
        .from('simulations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('calculator_slug', calculatorSlug)
        .gte('created_at', startOfMonth.toISOString());

      if (queryError) {
        throw queryError;
      }

      setCount(simulationCount || 0);
    } catch (err) {
      console.error('Error fetching simulation count:', err);
      setError('Erro ao buscar contagem de simulações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [user, calculatorSlug]);

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  };
}

/**
 * Hook para buscar a contagem total de simulações do mês (todas as calculadoras)
 */
export function useTotalSimulationLimit(): SimulationLimitResult {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Início do mês atual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { count: simulationCount, error: queryError } = await supabase
        .from('simulations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (queryError) {
        throw queryError;
      }

      setCount(simulationCount || 0);
    } catch (err) {
      console.error('Error fetching total simulation count:', err);
      setError('Erro ao buscar contagem de simulações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [user]);

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  };
}
