export type PerfilClientes = 'B2B' | 'B2C' | 'MISTO';

export type RegimeType = 
  | 'SIMPLES_NACIONAL'
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_REAL'
  | 'SIMPLES_2027_DENTRO'
  | 'SIMPLES_2027_FORA';

export interface SimprontoFormData {
  // Passo 1
  faturamento_anual: string;
  folha_pagamento: string;
  cnae_principal: string;
  
  // Passo 2
  compras_insumos: string;
  despesas_operacionais: string;
  margem_lucro: string;
  perfil_clientes: PerfilClientes | '';
}

export interface RegimeCalculation {
  tipo: RegimeType;
  nome: string;
  imposto_anual: number;
  aliquota_efetiva: number;
  creditos_gerados: number;
  vantagem: string;
  is_elegivel: boolean;
  motivo_inelegibilidade?: string;
}

export interface SimprontoResult {
  regimes: RegimeCalculation[];
  recomendado: RegimeType;
  economia_vs_segundo: number;
  justificativa: string;
  disclaimer: string;
}

export interface SimprontoInput {
  faturamento_anual: number;
  folha_pagamento: number;
  cnae_principal: string;
  compras_insumos: number;
  despesas_operacionais: number;
  margem_lucro: number;
  perfil_clientes: PerfilClientes;
}
