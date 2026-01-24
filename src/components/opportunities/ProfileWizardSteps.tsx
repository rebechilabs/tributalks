import { Monitor, Factory, ShoppingBag, Wrench, HeartPulse, Wheat } from "lucide-react";

// Step 1: Setor options
export const SETOR_OPTIONS = [
  { value: 'tecnologia', label: 'Tecnologia', icon: Monitor, description: 'Software, Apps, TI' },
  { value: 'industria', label: 'Indústria', icon: Factory, description: 'Fábrica, Produção' },
  { value: 'comercio', label: 'Comércio', icon: ShoppingBag, description: 'Loja, Revenda' },
  { value: 'servicos', label: 'Serviços', icon: Wrench, description: 'Consultoria, Profissional' },
  { value: 'saude', label: 'Saúde', icon: HeartPulse, description: 'Clínica, Hospital' },
  { value: 'agro', label: 'Agro', icon: Wheat, description: 'Fazenda, Agrícola' },
];

// Step 2: Porte/Faturamento options
export const FATURAMENTO_OPTIONS = [
  { value: 'mei', label: 'Até R$ 81 mil/ano', tag: 'MEI', faturamentoAnual: 81000 },
  { value: 'micro', label: 'R$ 81 mil a R$ 360 mil/ano', tag: 'Micro', faturamentoAnual: 220000 },
  { value: 'pequena', label: 'R$ 360 mil a R$ 4,8 milhões/ano', tag: 'Pequena', faturamentoAnual: 2400000 },
  { value: 'media', label: 'R$ 4,8 a R$ 78 milhões/ano', tag: 'Média', faturamentoAnual: 40000000 },
  { value: 'grande', label: 'Acima de R$ 78 milhões/ano', tag: 'Grande', faturamentoAnual: 100000000 },
];

// Step 3: Produtos específicos
export const PRODUTOS_ESPECIFICOS = [
  { field: 'vende_combustiveis', label: 'Combustíveis (posto, distribuidora)' },
  { field: 'vende_bebidas', label: 'Bebidas (cervejas, refrigerantes, águas)' },
  { field: 'vende_farmacos', label: 'Medicamentos / Produtos farmacêuticos' },
  { field: 'vende_cosmeticos', label: 'Cosméticos / Perfumaria / Higiene pessoal' },
  { field: 'vende_autopecas', label: 'Autopeças / Pneus' },
  { field: 'vende_eletronicos', label: 'Eletrônicos / Informática' },
];

// Step 5: Regime tributário options
export const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional', description: 'Pago o DAS mensalmente' },
  { value: 'presumido', label: 'Lucro Presumido', description: 'Tributação sobre receita presumida' },
  { value: 'real', label: 'Lucro Real', description: 'Tributação sobre lucro efetivo' },
  { value: 'misto', label: 'Regimes diferentes no grupo', description: 'Tenho empresas em regimes diferentes' },
  { value: 'nao_sei', label: 'Não sei', description: 'Vou perguntar ao contador' },
];

// Step 6: Folha options
export const FOLHA_OPTIONS = [
  { value: 'baixa', label: 'Menos de 20%', percentual: 15 },
  { value: 'media', label: 'Entre 20% e 28%', percentual: 24 },
  { value: 'alta', label: 'Mais de 28%', percentual: 35, highlight: true },
  { value: 'nao_sei', label: 'Não sei', percentual: 0 },
];

// Wizard steps configuration
export const WIZARD_STEPS = [
  { id: 1, title: 'Seu Negócio', description: 'Setor de atuação' },
  { id: 2, title: 'Tamanho', description: 'Faturamento anual' },
  { id: 3, title: 'O que Vende', description: 'Produtos e serviços' },
  { id: 4, title: 'Para Quem', description: 'Clientes e abrangência' },
  { id: 5, title: 'Estrutura', description: 'CNPJs e regime' },
  { id: 6, title: 'Especial', description: 'Características extras' },
];

export interface ProfileFormData {
  // Step 1
  setor: string;
  
  // Step 2
  porte: string;
  faturamento_anual: number;
  
  // Step 3
  vende_produtos: boolean;
  vende_servicos: boolean;
  vende_combustiveis: boolean;
  vende_bebidas: boolean;
  vende_farmacos: boolean;
  vende_cosmeticos: boolean;
  vende_autopecas: boolean;
  vende_pneus: boolean;
  vende_eletronicos: boolean;
  tem_produtos_monofasicos: boolean;
  tem_atividades_mistas: boolean;
  
  // Step 4
  vende_pf: boolean;
  vende_pj: boolean;
  percentual_pf: number;
  percentual_pj: number;
  vende_governo: boolean;
  opera_outros_estados: boolean;
  exporta_produtos: boolean;
  exporta_servicos: boolean;
  
  // Step 5
  qtd_cnpjs: number;
  tem_holding: boolean;
  tem_filiais: boolean;
  regime_tributario: string;
  
  // Step 6
  tem_atividade_pd: boolean;
  tem_patentes: boolean;
  zona_franca: boolean;
  folha_percentual_faturamento: number;
}

export const INITIAL_PROFILE_DATA: ProfileFormData = {
  setor: '',
  porte: '',
  faturamento_anual: 0,
  vende_produtos: false,
  vende_servicos: false,
  vende_combustiveis: false,
  vende_bebidas: false,
  vende_farmacos: false,
  vende_cosmeticos: false,
  vende_autopecas: false,
  vende_pneus: false,
  vende_eletronicos: false,
  tem_produtos_monofasicos: false,
  tem_atividades_mistas: false,
  vende_pf: false,
  vende_pj: false,
  percentual_pf: 50,
  percentual_pj: 50,
  vende_governo: false,
  opera_outros_estados: false,
  exporta_produtos: false,
  exporta_servicos: false,
  qtd_cnpjs: 1,
  tem_holding: false,
  tem_filiais: false,
  regime_tributario: '',
  tem_atividade_pd: false,
  tem_patentes: false,
  zona_franca: false,
  folha_percentual_faturamento: 0,
};
