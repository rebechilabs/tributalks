import { useCompany } from '@/contexts/CompanyContext';

export interface SharedCompanyData {
  regime_tributario: string | null;
  faturamento_anual: number | null;
  folha_anual: number | null;
  cnae_principal: string | null;
  setor: string | null;
  receita_liquida_mensal: number | null;
  margem_bruta_percentual: number | null;
  compras_insumos_anual: number | null;
  origem: string | null;
  atualizado_em: string | null;
  isLoading: boolean;
}

export function useSharedCompanyData(): SharedCompanyData {
  const { currentCompany, isLoading } = useCompany();

  if (!currentCompany) {
    return {
      regime_tributario: null,
      faturamento_anual: null,
      folha_anual: null,
      cnae_principal: null,
      setor: null,
      receita_liquida_mensal: null,
      margem_bruta_percentual: null,
      compras_insumos_anual: null,
      origem: null,
      atualizado_em: null,
      isLoading,
    };
  }

  const c = currentCompany as any; // extended fields may not be in strict type

  return {
    regime_tributario: c.regime_tributario ?? null,
    faturamento_anual: c.faturamento_anual ?? null,
    folha_anual: c.folha_mensal ? c.folha_mensal * 12 : null,
    cnae_principal: c.cnae_principal ?? null,
    setor: c.setor ?? null,
    receita_liquida_mensal: c.receita_liquida_mensal ?? null,
    margem_bruta_percentual: c.margem_bruta_percentual ?? null,
    compras_insumos_anual: c.compras_insumos_mensal ? c.compras_insumos_mensal * 12 : null,
    origem: c.dados_financeiros_origem ?? null,
    atualizado_em: c.dados_financeiros_atualizados_em ?? null,
    isLoading,
  };
}
