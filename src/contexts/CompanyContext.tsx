import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlanAccess, CNPJ_LIMITS } from '@/hooks/useFeatureAccess';

export interface Company {
  id: string;
  user_id: string;
  cnpj_principal: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  regime_tributario: string | null;
  uf_sede: string | null;
  municipio_sede: string | null;
  setor: string | null;
  segmento: string | null;
  porte: string | null;
  num_funcionarios: number | null;
  faturamento_anual: number | null;
  cnae_principal: string | null;
  folha_mensal: number | null;
  receita_liquida_mensal: number | null;
  margem_bruta_percentual: number | null;
  compras_insumos_mensal: number | null;
  prolabore_mensal: number | null;
  dados_financeiros_origem: string | null;
  dados_financeiros_atualizados_em: string | null;
  created_at?: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  addCompany: (company: Partial<Company>) => Promise<Company | null>;
  removeCompany: (companyId: string) => Promise<boolean>;
  updateCompany: (companyId: string, data: Partial<Company>) => Promise<boolean>;
  maxCompanies: number;
  canAddMore: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'tributalks_current_company_id';

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentPlan } = usePlanAccess();
  const queryClient = useQueryClient();
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  });

  // Fetch companies
  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ['user-companies', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('company_profile')
        .select('id, user_id, cnpj_principal, razao_social, nome_fantasia, regime_tributario, uf_sede, municipio_sede, setor, segmento, porte, num_funcionarios, faturamento_anual, cnae_principal, folha_mensal, receita_liquida_mensal, margem_bruta_percentual, compras_insumos_mensal, prolabore_mensal, dados_financeiros_origem, dados_financeiros_atualizados_em, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching companies:', error);
        return [];
      }

      return data as Company[];
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  });

  // Get max companies based on plan
  const maxCompanies = CNPJ_LIMITS[currentPlan] === 'unlimited' ? 999 : (CNPJ_LIMITS[currentPlan] as number);
  const canAddMore = companies.length < maxCompanies;

  // Current company
  const currentCompany = companies.find(c => c.id === currentCompanyId) || companies[0] || null;

  // Update current company
  const setCurrentCompany = useCallback((company: Company) => {
    setCurrentCompanyId(company.id);
    localStorage.setItem(LOCAL_STORAGE_KEY, company.id);
    // Invalidate all queries that depend on company
    queryClient.invalidateQueries({ queryKey: ['home-state'] });
    queryClient.invalidateQueries({ queryKey: ['dre'] });
    queryClient.invalidateQueries({ queryKey: ['tax-score'] });
    queryClient.invalidateQueries({ queryKey: ['credits'] });
  }, [queryClient]);

  // Ensure current company is valid
  useEffect(() => {
    if (companies.length > 0 && !currentCompany) {
      const firstCompany = companies[0];
      setCurrentCompanyId(firstCompany.id);
      localStorage.setItem(LOCAL_STORAGE_KEY, firstCompany.id);
    }
  }, [companies, currentCompany]);

  // Add company
  const addCompany = useCallback(async (companyData: Partial<Company>): Promise<Company | null> => {
    if (!user?.id || !canAddMore) return null;

    const { data, error } = await supabase
      .from('company_profile')
      .insert({
        user_id: user.id,
        cnpj_principal: companyData.cnpj_principal,
        razao_social: companyData.razao_social,
        nome_fantasia: companyData.nome_fantasia,
        regime_tributario: companyData.regime_tributario || 'simples',
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding company:', error);
      return null;
    }

    refetch();
    return data as Company;
  }, [user?.id, canAddMore, refetch]);

  // Remove company
  const removeCompany = useCallback(async (companyId: string): Promise<boolean> => {
    if (companies.length <= 1) return false; // Can't remove last company

    const { error } = await supabase
      .from('company_profile')
      .delete()
      .eq('id', companyId)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error removing company:', error);
      return false;
    }

    // If removing current company, switch to another
    if (currentCompanyId === companyId) {
      const otherCompany = companies.find(c => c.id !== companyId);
      if (otherCompany) {
        setCurrentCompany(otherCompany);
      }
    }

    refetch();
    return true;
  }, [companies, currentCompanyId, user?.id, refetch, setCurrentCompany]);

  // Update company
  const updateCompany = useCallback(async (companyId: string, data: Partial<Company>): Promise<boolean> => {
    const { error } = await supabase
      .from('company_profile')
      .update(data)
      .eq('id', companyId)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error updating company:', error);
      return false;
    }

    refetch();
    return true;
  }, [user?.id, refetch]);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        setCurrentCompany,
        addCompany,
        removeCompany,
        updateCompany,
        maxCompanies,
        canAddMore,
        isLoading,
        refetch,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
