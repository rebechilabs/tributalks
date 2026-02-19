import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompanyProfile {
  user_id: string;
  setor?: string;
  segmento?: string;
  porte?: string;
  faturamento_anual?: number;
  faturamento_mensal_medio?: number;
  regime_tributario?: string;
  qtd_cnpjs?: number;
  tem_holding?: boolean;
  tem_filiais?: boolean;
  qtd_filiais?: number;
  vende_produtos?: boolean;
  vende_servicos?: boolean;
  percentual_produtos?: number;
  percentual_servicos?: number;
  vende_pf?: boolean;
  vende_pj?: boolean;
  vende_governo?: boolean;
  tem_atividades_mistas?: boolean;
  tem_produtos_monofasicos?: boolean;
  vende_combustiveis?: boolean;
  vende_bebidas?: boolean;
  vende_cosmeticos?: boolean;
  vende_farmacos?: boolean;
  vende_autopecas?: boolean;
  vende_pneus?: boolean;
  vende_eletronicos?: boolean;
  vende_automoveis?: boolean;
  vende_cigarros?: boolean;
  exporta_produtos?: boolean;
  exporta_servicos?: boolean;
  importa_produtos?: boolean;
  importa_insumos?: boolean;
  percentual_exportacao?: number;
  percentual_importacao?: number;
  tem_atividade_pd?: boolean;
  investe_em_inovacao?: boolean;
  tem_patentes?: boolean;
  uf_sede?: string;
  ufs_operacao?: string[];
  opera_outros_estados?: boolean;
  opera_todo_brasil?: boolean;
  folha_mensal?: number;
  folha_percentual_faturamento?: number;
  num_funcionarios?: number;
  zona_franca?: boolean;
  area_livre_comercio?: boolean;
  zona_especial?: string;
  tem_loja_fisica?: boolean;
  tem_ecommerce?: boolean;
  tem_marketplace?: boolean;
  cnae_principal?: string;
  cnae_secundarios?: string[];
  tipo_societario?: string;
  atividades_diferentes_tributacao?: boolean;
  
  // Agro-specific fields
  tem_area_preservacao?: boolean;
  comercializa_commodities?: boolean;
  compra_insumos?: boolean;
  investe_maquinas?: boolean;
  tipo_cooperativa?: boolean;
  
  // Energia-specific fields
  tem_geracao_solar?: boolean;
  compra_equipamento_solar?: boolean;
  importa_equipamento_solar?: boolean;
  projeto_infraestrutura?: boolean;
  
  // Saúde-specific fields
  tem_internacao_ou_procedimento_complexo?: boolean;
  comercializa_medicamentos?: boolean;
  compra_equipamentos_medicos?: boolean;
  investe_pd_saude?: boolean;
  
  // Construção-specific fields
  incorporacao_imobiliaria?: boolean;
  programa_mcmv?: boolean;
  folha_alta_construcao?: boolean;
  
  // Transporte-specific fields
  transporte_cargas?: boolean;
  transporte_passageiros?: boolean;
  operacao_interestadual?: boolean;
  investe_frota?: boolean;
  frete_exportacao?: boolean;
  
  // Alimentação-specific fields
  prepara_alimentos?: boolean;
  recebe_gorjetas?: boolean;
  usa_plataformas_delivery?: boolean;
  tem_bar?: boolean;
  
  // E-commerce-specific fields
  centro_distribuicao_incentivado?: boolean;
  centro_distribuicao_zfm?: boolean;
  vende_produtos_monofasicos?: boolean;
  
  // Educação-specific fields
  escola_regular?: boolean;
  cursos_livres?: boolean;
  fins_lucrativos?: boolean;
  investe_tecnologia_educacional?: boolean;
}

interface TaxOpportunity {
  id: string;
  code: string;
  name: string;
  name_simples: string;
  description?: string;
  description_ceo?: string;
  category?: string;
  subcategory?: string;
  tipo_tributo?: string;
  tributos_afetados?: string[];
  criterios: Record<string, unknown>;
  criterios_obrigatorios?: Record<string, unknown>;
  criterios_pontuacao?: Record<string, unknown>;
  economia_tipo?: string;
  economia_percentual_min?: number;
  economia_percentual_max?: number;
  economia_base?: string;
  economia_descricao_simples?: string;
  complexidade?: string;
  tempo_implementacao?: string;
  tempo_retorno?: string;
  risco_fiscal?: string;
  risco_descricao?: string;
  base_legal?: string;
  base_legal_resumo?: string;
  requer_contador?: boolean;
  requer_advogado?: boolean;
  requer_sistema?: boolean;
  requer_certificacao?: boolean;
}

// Labels for better reason messages
const FIELD_LABELS: Record<string, string> = {
  setor: 'Setor',
  segmento: 'Segmento',
  porte: 'Porte',
  regime_tributario: 'Regime tributário',
  atividade: 'Atividade',
  estado: 'Estado',
  uf_sede: 'UF sede',
  canal: 'Canal de venda',
  tipo_empresa: 'Tipo de empresa',
  programa: 'Programa',
  vende_produtos: 'Vende produtos',
  vende_servicos: 'Vende serviços',
  vende_combustiveis: 'Vende combustíveis',
  vende_bebidas: 'Vende bebidas',
  vende_cosmeticos: 'Vende cosméticos',
  vende_farmacos: 'Vende fármacos/medicamentos',
  vende_autopecas: 'Vende autopeças',
  vende_pneus: 'Vende pneus',
  vende_eletronicos: 'Vende eletrônicos',
  vende_automoveis: 'Vende automóveis',
  tem_atividades_mistas: 'Tem atividades mistas',
  tem_produtos_monofasicos: 'Tem produtos monofásicos',
  exporta_produtos: 'Exporta produtos',
  exporta_servicos: 'Exporta serviços',
  importa_produtos: 'Importa produtos',
  importa_insumos: 'Importa insumos',
  tem_atividade_pd: 'Tem atividade de P&D',
  investe_em_inovacao: 'Investe em inovação',
  tem_patentes: 'Tem patentes',
  tem_holding: 'Tem holding',
  tem_filiais: 'Tem filiais',
  tem_ecommerce: 'Tem e-commerce',
  tem_marketplace: 'Vende em marketplace',
  tem_loja_fisica: 'Tem loja física',
  zona_franca: 'Zona Franca',
  area_livre_comercio: 'Área de livre comércio',
  fator_r_acima_28: 'Folha > 28% do faturamento',
  lucro_real: 'Lucro Real',
  lucro_presumido: 'Lucro Presumido',
  simples_nacional: 'Simples Nacional',
  folha_alta: 'Folha de pagamento alta',
  operacao_interestadual: 'Opera entre estados',
  
  // Agro fields
  tem_area_preservacao: 'Tem área de preservação',
  comercializa_commodities: 'Comercializa commodities',
  compra_insumos: 'Compra insumos agrícolas',
  investe_maquinas: 'Investe em máquinas/tratores',
  tipo_cooperativa: 'É cooperativa',
  
  // Energia fields
  tem_geracao_solar: 'Tem geração solar',
  compra_equipamento_solar: 'Compra equipamento solar',
  importa_equipamento_solar: 'Importa equipamento solar',
  projeto_infraestrutura: 'Projeto de infraestrutura energética',
  
  // Saúde fields
  tem_internacao_ou_procedimento_complexo: 'Tem internação/procedimento complexo',
  comercializa_medicamentos: 'Comercializa medicamentos',
  compra_equipamentos_medicos: 'Compra equipamentos médicos',
  investe_pd_saude: 'Investe em P&D na saúde',
  
  // Construção fields
  incorporacao_imobiliaria: 'Incorporação imobiliária',
  programa_mcmv: 'Programa Minha Casa Minha Vida',
  folha_alta_construcao: 'Folha alta em construção',
  
  // Transporte fields
  transporte_cargas: 'Transporte de cargas',
  transporte_passageiros: 'Transporte de passageiros',
  investe_frota: 'Investe em frota',
  frete_exportacao: 'Frete de exportação',
  
  // Alimentação fields
  prepara_alimentos: 'Prepara alimentos',
  recebe_gorjetas: 'Recebe gorjetas',
  usa_plataformas_delivery: 'Usa plataformas de delivery',
  tem_bar: 'Tem bar/bebidas alcoólicas',
  
  // E-commerce fields
  centro_distribuicao_incentivado: 'CD em estado com incentivo',
  centro_distribuicao_zfm: 'CD na Zona Franca de Manaus',
  vende_produtos_monofasicos: 'Vende produtos monofásicos',
  
  // Educação fields
  escola_regular: 'Escola de educação básica/superior',
  cursos_livres: 'Cursos livres/treinamentos',
  fins_lucrativos: 'Instituição com fins lucrativos',
  investe_tecnologia_educacional: 'Investe em tecnologia educacional',
};

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field.replace(/_/g, ' ');
}

// Map profile fields to derived values for matching
function getDerivedValues(profile: CompanyProfile): Record<string, unknown> {
  const derived: Record<string, unknown> = { ...profile };
  
  // Calculate fator_r
  const folhaPercent = profile.folha_percentual_faturamento || 0;
  derived.fator_r_acima_28 = folhaPercent >= 28;
  derived.folha_alta = folhaPercent >= 25;
  
  // Regime shortcuts
  derived.lucro_real = profile.regime_tributario === 'lucro_real' || profile.regime_tributario === 'real';
  derived.lucro_presumido = profile.regime_tributario === 'lucro_presumido' || profile.regime_tributario === 'presumido';
  derived.simples_nacional = profile.regime_tributario === 'simples';
  
  // Derived activity flags - general
  derived.operacao_interestadual = profile.opera_outros_estados || profile.opera_todo_brasil || profile.operacao_interestadual;
  derived.centro_distribuicao_zfm = profile.zona_franca || profile.centro_distribuicao_zfm;
  derived.vende_produtos_monofasicos = profile.tem_produtos_monofasicos || 
    profile.vende_combustiveis || profile.vende_bebidas || 
    profile.vende_cosmeticos || profile.vende_farmacos ||
    profile.vende_autopecas || profile.vende_pneus ||
    profile.vende_produtos_monofasicos;
  
  // Sector-specific derived flags
  // Agro
  if (profile.setor === 'agro') {
    derived.compra_insumos = profile.compra_insumos;
    derived.investe_maquinas = profile.investe_maquinas;
    derived.tipo_cooperativa = profile.tipo_cooperativa;
    derived.comercializa_commodities = profile.comercializa_commodities;
  }
  
  // Energia
  if (profile.setor === 'energia') {
    derived.tem_geracao_solar = profile.tem_geracao_solar;
    derived.compra_equipamento_solar = profile.compra_equipamento_solar;
    derived.importa_equipamento_solar = profile.importa_equipamento_solar;
    derived.projeto_infraestrutura = profile.projeto_infraestrutura;
  }
  
  // Saúde
  if (profile.setor === 'saude') {
    derived.tem_internacao_ou_procedimento_complexo = profile.tem_internacao_ou_procedimento_complexo;
    derived.comercializa_medicamentos = profile.comercializa_medicamentos || profile.vende_farmacos;
    derived.compra_equipamentos_medicos = profile.compra_equipamentos_medicos;
    derived.investe_pd = profile.investe_pd_saude || profile.tem_atividade_pd;
  }
  
  // Construção
  if (profile.setor === 'construcao') {
    derived.incorporacao_imobiliaria = profile.incorporacao_imobiliaria;
    derived.programa_mcmv = profile.programa_mcmv;
    derived.folha_alta = profile.folha_alta_construcao || folhaPercent >= 25;
  }
  
  // Transporte
  if (profile.setor === 'transporte') {
    derived.transporte_cargas = profile.transporte_cargas;
    derived.transporte_passageiros = profile.transporte_passageiros;
    derived.investe_frota = profile.investe_frota;
    derived.frete_exportacao = profile.frete_exportacao;
  }
  
  // Alimentação
  if (profile.setor === 'alimentacao') {
    derived.prepara_alimentos = profile.prepara_alimentos !== false; // Default true for food sector
    derived.recebe_gorjetas = profile.recebe_gorjetas;
    derived.usa_plataformas_delivery = profile.usa_plataformas_delivery || profile.tem_ecommerce;
    derived.tem_bar = profile.tem_bar;
  }
  
  // E-commerce
  if (profile.setor === 'ecommerce' || profile.tem_ecommerce) {
    derived.tem_ecommerce = true;
    derived.centro_distribuicao_incentivado = profile.centro_distribuicao_incentivado;
  }
  
  // Educação
  if (profile.setor === 'educacao') {
    derived.escola_regular = profile.escola_regular;
    derived.cursos_livres = profile.cursos_livres;
    derived.fins_lucrativos = profile.fins_lucrativos !== false; // Default true
    derived.investe_tecnologia = profile.investe_tecnologia_educacional;
    // Non-profit education institutions may be tax-exempt
    derived.imunidade_educacional = profile.fins_lucrativos === false;
  }
  
  // Cross-sector derived values
  derived.investe_pd = profile.tem_atividade_pd || profile.investe_em_inovacao || profile.investe_pd_saude;
  derived.investe_tecnologia = profile.investe_tecnologia_educacional || profile.tem_atividade_pd;
  
  // Determine atividade based on setor and specific flags
  const atividadeMap: Record<string, string[]> = {
    'agro': ['producao_rural', 'pecuaria', 'agricultura'],
    'saude': ['clinica', 'hospital', 'laboratorio', 'farmacia'],
    'construcao': ['incorporacao_imobiliaria', 'construtora', 'empreiteira'],
    'transporte': ['transporte_cargas', 'transporte_passageiros', 'logistica'],
    'alimentacao': ['restaurante', 'bar', 'lanchonete', 'padaria'],
    'comercio': ['varejo', 'atacado', 'distribuidor'],
    'educacao': ['escola', 'faculdade', 'curso', 'treinamento'],
    'servicos': ['consultoria', 'tecnologia', 'software'],
    'industria': ['fabricacao', 'manufatura', 'transformacao'],
    'energia': ['geracao_solar', 'geracao_energia'],
    'ecommerce': ['loja_virtual', 'marketplace', 'varejo_online'],
  };
  
  const atividades = [...(atividadeMap[profile.setor || ''] || [])];
  
  // Add specific activities based on sector flags
  if (profile.incorporacao_imobiliaria) atividades.push('incorporacao_imobiliaria');
  if (profile.transporte_cargas) atividades.push('transporte_cargas');
  if (profile.transporte_passageiros) atividades.push('transporte_passageiros');
  if (profile.escola_regular) atividades.push('escola');
  if (profile.cursos_livres) atividades.push('cursos_livres');
  if (profile.tipo_cooperativa) atividades.push('cooperativa');
  
  derived.atividades = atividades;
  
  // Add canal
  if (profile.tem_ecommerce || profile.setor === 'ecommerce') {
    derived.canal = 'ecommerce';
  } else if (profile.tem_loja_fisica) {
    derived.canal = 'loja_fisica';
  } else if (profile.tem_marketplace) {
    derived.canal = 'marketplace';
  }
  
  // Estado from UF
  derived.estado = profile.uf_sede;
  derived.estados = profile.ufs_operacao || (profile.uf_sede ? [profile.uf_sede] : []);
  
  // Tipo empresa
  if (profile.tem_holding) {
    derived.tipo_empresa = 'holding';
  } else if (profile.tipo_societario === 'cooperativa' || profile.tipo_cooperativa) {
    derived.tipo_empresa = 'cooperativa';
  }
  
  // Setor aliases
  const setorAliases: Record<string, string[]> = {
    'agro': ['agro', 'agronegocio', 'agricultura', 'pecuaria'],
    'saude': ['saude', 'farmacia', 'hospital', 'clinica'],
    'alimentacao': ['alimentacao', 'restaurante', 'food_service'],
    'comercio': ['comercio', 'varejo', 'atacado'],
    'servicos': ['servicos', 'prestacao_servicos'],
    'industria': ['industria', 'fabricacao', 'manufatura'],
    'construcao': ['construcao', 'imobiliario', 'incorporacao'],
    'transporte': ['transporte', 'logistica', 'frete'],
    'educacao': ['educacao', 'ensino', 'treinamento'],
    'energia': ['energia', 'energia_solar', 'geracao'],
    'tecnologia': ['tecnologia', 'ti', 'software'],
    'ecommerce': ['ecommerce', 'comercio_eletronico', 'loja_virtual'],
  };
  derived.setores = setorAliases[profile.setor || ''] || [profile.setor];
  
  return derived;
}

function evaluateOpportunity(
  profile: CompanyProfile, 
  opportunity: TaxOpportunity
): { eligible: boolean; score: number; reasons: string[]; missing: string[] } {
  const criterios = opportunity.criterios || {};
  const criteriosObrigatorios = opportunity.criterios_obrigatorios || {};
  const criteriosPontuacao = opportunity.criterios_pontuacao || {};
  
  const reasons: string[] = [];
  const missing: string[] = [];
  let score = 0;
  let requiredMet = true;
  
  // Get derived values for matching
  const derived = getDerivedValues(profile);

  // Helper to get value from profile or derived
  const getValue = (field: string): unknown => {
    return derived[field] ?? profile[field as keyof CompanyProfile];
  };

  // Helper to check array inclusion
  const checkArrayInclusion = (criteriaValues: unknown[], profileValue: unknown): boolean => {
    if (Array.isArray(profileValue)) {
      // If profile value is array, check if any match
      return profileValue.some(pv => criteriaValues.includes(pv));
    }
    return criteriaValues.includes(profileValue);
  };

  // Evaluate a single criterion
  const evaluateCriterion = (key: string, value: unknown, isRequired: boolean, pointValue: number = 20): boolean => {
    // Handle _in suffix (array inclusion)
    if (key.endsWith('_in')) {
      const field = key.replace('_in', '');
      const profileValue = getValue(field);
      const arrayField = field + 's'; // Try plural form (setor -> setores)
      const profileArrayValue = getValue(arrayField);
      
      if (Array.isArray(value)) {
        // Check both singular and plural forms
        const matches = checkArrayInclusion(value, profileValue) || 
                       checkArrayInclusion(value, profileArrayValue);
        
        if (matches) {
          score += pointValue;
          reasons.push(`${getFieldLabel(field)} compatível`);
          return true;
        } else if (isRequired) {
          missing.push(`${getFieldLabel(field)} não está na lista elegível`);
          requiredMet = false;
        }
      }
      return false;
    }

    // Handle _min suffix (minimum value)
    if (key.endsWith('_min')) {
      const field = key.replace('_min', '');
      const profileValue = getValue(field) as number;
      if (profileValue !== undefined && profileValue >= (value as number)) {
        score += pointValue;
        reasons.push(`${getFieldLabel(field)} acima do mínimo`);
        return true;
      } else if (isRequired) {
        missing.push(`${getFieldLabel(field)} abaixo do mínimo`);
        requiredMet = false;
      }
      return false;
    }

    // Handle _max suffix (maximum value)
    if (key.endsWith('_max')) {
      const field = key.replace('_max', '');
      const profileValue = getValue(field) as number;
      if (profileValue !== undefined && profileValue <= (value as number)) {
        score += pointValue;
        reasons.push(`${getFieldLabel(field)} dentro do limite`);
        return true;
      } else if (isRequired) {
        missing.push(`${getFieldLabel(field)} acima do máximo`);
        requiredMet = false;
      }
      return false;
    }

    // Handle _ou suffix (OR condition with multiple fields)
    if (key.endsWith('_ou')) {
      const fields = key.replace('_ou', '').split('_');
      const anyMatch = fields.some(field => {
        const profileValue = getValue(field);
        return profileValue === true || profileValue === value;
      });
      
      if (anyMatch) {
        score += pointValue;
        reasons.push(`${fields.map(getFieldLabel).join(' ou ')}`);
        return true;
      } else if (isRequired) {
        missing.push(`Requer: ${fields.map(getFieldLabel).join(' ou ')}`);
        requiredMet = false;
      }
      return false;
    }

    // Handle setor_ou_atividade special case
    if (key === 'setor_ou_atividade') {
      const setorMatches = getValue('setor') === value || 
                          (Array.isArray(getValue('setores')) && (getValue('setores') as string[]).includes(value as string));
      const atividadeMatches = Array.isArray(getValue('atividades')) && 
                              (getValue('atividades') as string[]).includes(value as string);
      
      if (setorMatches || atividadeMatches) {
        score += pointValue;
        reasons.push(`Setor/atividade compatível`);
        return true;
      } else if (isRequired) {
        missing.push(`Setor ou atividade: ${value}`);
        requiredMet = false;
      }
      return false;
    }

    // Handle boolean match
    if (typeof value === 'boolean') {
      const profileValue = getValue(key);
      if (profileValue === value) {
        score += pointValue;
        if (value === true) {
          reasons.push(getFieldLabel(key));
        }
        return true;
      } else if (isRequired && value === true) {
        missing.push(`Requer: ${getFieldLabel(key)}`);
        requiredMet = false;
      }
      return false;
    }

    // Handle string/number direct match
    if (typeof value === 'string' || typeof value === 'number') {
      const profileValue = getValue(key);
      if (profileValue === value) {
        score += pointValue;
        reasons.push(`${getFieldLabel(key)}: ${value}`);
        return true;
      } else if (isRequired) {
        missing.push(`Requer ${getFieldLabel(key)}: ${value}`);
        requiredMet = false;
      }
      return false;
    }

    // Handle array value (profile value must be in array)
    if (Array.isArray(value)) {
      const profileValue = getValue(key);
      if (checkArrayInclusion(value, profileValue)) {
        score += pointValue;
        reasons.push(`${getFieldLabel(key)} compatível`);
        return true;
      } else if (isRequired) {
        missing.push(`${getFieldLabel(key)} não compatível`);
        requiredMet = false;
      }
      return false;
    }

    return false;
  };

  // First evaluate required criteria (criterios_obrigatorios)
  for (const [key, value] of Object.entries(criteriosObrigatorios)) {
    evaluateCriterion(key, value, true, 15);
  }

  // Then evaluate main criteria (all treated as somewhat required for basic eligibility)
  for (const [key, value] of Object.entries(criterios)) {
    // Skip special fields
    if (key === 'vigencia_apos' || key === 'vigencia_ate') continue;
    
    evaluateCriterion(key, value, true, 20);
  }

  // Finally evaluate scoring criteria (optional, just add points)
  for (const [key, value] of Object.entries(criteriosPontuacao)) {
    evaluateCriterion(key, value, false, 10);
  }

  // Check date validity
  const vigenciaApos = criterios.vigencia_apos as string | undefined;
  const vigenciaAte = criterios.vigencia_ate as string | undefined;
  const now = new Date();
  
  if (vigenciaApos && new Date(vigenciaApos) > now) {
    missing.push(`Vigente a partir de ${vigenciaApos}`);
    // Still eligible but note it's future
  }
  
  if (vigenciaAte && new Date(vigenciaAte) < now) {
    missing.push(`Vigência expirada em ${vigenciaAte}`);
    requiredMet = false;
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Require at least one reason to be eligible
  const eligible = requiredMet && reasons.length > 0 && score >= 15;

  return {
    eligible,
    score,
    reasons,
    missing
  };
}

function calculateEconomia(
  profile: CompanyProfile, 
  opportunity: TaxOpportunity
): { mensal_min: number; mensal_max: number; anual_min: number; anual_max: number } {
  const fatMensal = profile.faturamento_mensal_medio || 0;
  const fatAnual = profile.faturamento_anual || fatMensal * 12;

  if (!opportunity.economia_percentual_min) {
    return { mensal_min: 0, mensal_max: 0, anual_min: 0, anual_max: 0 };
  }

  // Determine base for calculation
  let base = fatMensal;
  const economiaBase = opportunity.economia_base || 'faturamento_total';
  const category = opportunity.category || '';

  // Estimate specific revenue based on profile and opportunity type
  if (economiaBase.includes('combustiveis') || category.includes('combustiveis')) {
    base = profile.vende_combustiveis ? fatMensal * 0.7 : 0;
  } else if (economiaBase.includes('bebidas') || category.includes('bebidas')) {
    base = profile.vende_bebidas ? fatMensal * 0.4 : 0;
  } else if (economiaBase.includes('cosmeticos') || category.includes('cosmeticos')) {
    base = profile.vende_cosmeticos ? fatMensal * 0.5 : 0;
  } else if (economiaBase.includes('farmacos') || economiaBase.includes('medicamentos')) {
    base = profile.vende_farmacos ? fatMensal * 0.6 : 0;
  } else if (economiaBase.includes('autopecas')) {
    base = profile.vende_autopecas ? fatMensal * 0.5 : 0;
  } else if (economiaBase.includes('pneus')) {
    base = profile.vende_pneus ? fatMensal * 0.3 : 0;
  } else if (economiaBase.includes('servicos') && profile.vende_servicos) {
    const percServicos = (profile.percentual_servicos || 50) / 100;
    base = fatMensal * percServicos;
  } else if (economiaBase.includes('produtos') && profile.vende_produtos) {
    const percProdutos = (profile.percentual_produtos || 50) / 100;
    base = fatMensal * percProdutos;
  } else if (economiaBase.includes('exportacao')) {
    const percExport = (profile.percentual_exportacao || 20) / 100;
    base = fatMensal * percExport;
  } else if (economiaBase.includes('importacao')) {
    const percImport = (profile.percentual_importacao || 10) / 100;
    base = fatMensal * percImport;
  } else if (economiaBase.includes('folha')) {
    base = profile.folha_mensal || (fatMensal * ((profile.folha_percentual_faturamento || 20) / 100));
  } else if (economiaBase.includes('das') || economiaBase.includes('simples')) {
    // DAS is roughly 6-15% of revenue for Simples
    base = fatMensal * 0.10;
  } else if (economiaBase.includes('irpj_csll') || economiaBase.includes('ir_csll')) {
    // IRPJ/CSLL is roughly 3-8% of revenue
    base = fatMensal * 0.05;
  } else if (economiaBase.includes('icms')) {
    // ICMS varies by state and product, estimate 12-18%
    base = fatMensal * 0.15;
  } else if (economiaBase.includes('pis_cofins')) {
    // PIS/COFINS is 3.65% (cumulativo) or 9.25% (não cumulativo)
    base = fatMensal * 0.06;
  } else if (economiaBase.includes('inss') || economiaBase.includes('previdencia')) {
    base = profile.folha_mensal || (fatMensal * 0.20);
  }

  // Apply sector-specific adjustments
  if (profile.setor === 'agro') {
    // Agro typically has lower margins
    base = base * 0.8;
  } else if (profile.setor === 'saude') {
    // Healthcare can have good margins on these savings
    base = base * 1.1;
  }

  const percMin = opportunity.economia_percentual_min / 100;
  const percMax = (opportunity.economia_percentual_max || opportunity.economia_percentual_min) / 100;

  const mensalMin = base * percMin;
  const mensalMax = base * percMax;

  return {
    mensal_min: Math.round(mensalMin),
    mensal_max: Math.round(mensalMax),
    anual_min: Math.round(mensalMin * 12),
    anual_max: Math.round(mensalMax * 12)
  };
}

function calculatePrioridade(
  opportunity: TaxOpportunity, 
  economia: { anual_max: number }
): number {
  let prioridade = 3;

  // Quick wins get priority
  const complexidade = opportunity.complexidade || '';
  if (complexidade === 'muito_baixa' || complexidade === 'baixa') {
    prioridade--;
  }

  // High impact gets priority
  if (economia.anual_max > 50000) {
    prioridade--;
  }

  // Low risk gets priority
  const risco = opportunity.risco_fiscal || '';
  if (risco === 'nenhum' || risco === 'muito_baixo') {
    prioridade--;
  }

  return Math.max(1, Math.min(3, prioridade));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // STEP 1: Validate authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        error: 'unauthorized',
        message: 'Token de autenticação obrigatório'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // STEP 2: Validate token and get authenticated user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'invalid_token',
        message: 'Token de autenticação inválido ou expirado'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // STEP 3: Use authenticated user ID (ignore body user_id for security)
    const user_id = user.id

    // 1. FETCH PROFILE
    const { data: profile, error: profileError } = await supabase
      .from('company_profile')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        error: 'complete_profile',
        message: 'Complete seu perfil para ver as oportunidades'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. FETCH ACTIVE OPPORTUNITIES
    const { data: opportunities, error: oppError } = await supabase
      .from('tax_opportunities')
      .select('*')
      .eq('is_active', true)

    if (oppError || !opportunities) {
      throw new Error('Failed to fetch opportunities')
    }

    console.log(`Evaluating ${opportunities.length} opportunities for user ${user_id}`)
    console.log(`Profile: setor=${profile.setor}, regime=${profile.regime_tributario}, faturamento=${profile.faturamento_mensal_medio}`)

    // 3. MATCH OPPORTUNITIES
    const matches = []

    for (const opp of opportunities) {
      const result = evaluateOpportunity(profile as CompanyProfile, opp as TaxOpportunity)
      
      if (result.eligible) {
        const economia = calculateEconomia(profile as CompanyProfile, opp as TaxOpportunity)
        const prioridade = calculatePrioridade(opp as TaxOpportunity, economia)
        
        console.log(`Match: ${opp.code} - score=${result.score}, economia=${economia.anual_max}`)
        
        matches.push({
          opportunity_id: opp.id,
          opportunity: opp,
          match_score: result.score,
          match_reasons: result.reasons,
          missing_criteria: result.missing,
          economia_mensal_min: economia.mensal_min,
          economia_mensal_max: economia.mensal_max,
          economia_anual_min: economia.anual_min,
          economia_anual_max: economia.anual_max,
          quick_win: opp.complexidade === 'muito_baixa' || opp.complexidade === 'baixa',
          alto_impacto: economia.anual_max > 50000,
          prioridade
        })
      }
    }

    // 4. SORT BY PRIORITY
    matches.sort((a, b) => {
      // Quick wins first
      if (a.quick_win && !b.quick_win) return -1
      if (!a.quick_win && b.quick_win) return 1
      // Then by economia
      return b.economia_anual_max - a.economia_anual_max
    })

    // 5. UPSERT COMPANY OPPORTUNITIES
    // First delete old matches that are still 'nova'
    await supabase
      .from('company_opportunities')
      .delete()
      .eq('user_id', user_id)
      .eq('status', 'nova')

    // Insert new matches
    if (matches.length > 0) {
      const toInsert = matches.map(m => ({
        user_id,
        opportunity_id: m.opportunity_id,
        match_score: m.match_score,
        match_reasons: m.match_reasons,
        missing_criteria: m.missing_criteria,
        economia_mensal_min: m.economia_mensal_min,
        economia_mensal_max: m.economia_mensal_max,
        economia_anual_min: m.economia_anual_min,
        economia_anual_max: m.economia_anual_max,
        quick_win: m.quick_win,
        alto_impacto: m.alto_impacto,
        prioridade: m.prioridade,
        status: 'nova'
      }))

      await supabase
        .from('company_opportunities')
        .upsert(toInsert, { onConflict: 'user_id,opportunity_id' })
    }

    // 6. CALCULATE SUMMARY
    const totalEconomiaMin = matches.reduce((sum, m) => sum + m.economia_anual_min, 0)
    const totalEconomiaMax = matches.reduce((sum, m) => sum + m.economia_anual_max, 0)
    const quickWins = matches.filter(m => m.quick_win).length
    const highImpact = matches.filter(m => m.alto_impacto).length

    // Group by category
    const byCategory: Record<string, { count: number; economia: number }> = {}
    for (const m of matches) {
      const cat = m.opportunity.category || 'outros'
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, economia: 0 }
      }
      byCategory[cat].count++
      byCategory[cat].economia += m.economia_anual_max
    }

    console.log(`Found ${matches.length} matches, economia=${totalEconomiaMin}-${totalEconomiaMax}`)

    return new Response(JSON.stringify({
      success: true,
      total_opportunities: matches.length,
      quick_wins: quickWins,
      high_impact: highImpact,
      economia_anual_min: totalEconomiaMin,
      economia_anual_max: totalEconomiaMax,
      by_category: byCategory,
      opportunities: matches.map(m => ({
        id: m.opportunity_id,
        code: m.opportunity.code,
        name: m.opportunity.name_simples,
        description: m.opportunity.description_ceo,
        category: m.opportunity.category,
        subcategory: m.opportunity.subcategory,
        match_score: m.match_score,
        match_reasons: m.match_reasons,
        missing_criteria: m.missing_criteria,
        economia_mensal_min: m.economia_mensal_min,
        economia_mensal_max: m.economia_mensal_max,
        economia_anual_min: m.economia_anual_min,
        economia_anual_max: m.economia_anual_max,
        complexidade: m.opportunity.complexidade,
        tempo_implementacao: m.opportunity.tempo_implementacao,
        tempo_retorno: m.opportunity.tempo_retorno,
        risco_fiscal: m.opportunity.risco_fiscal,
        risco_descricao: m.opportunity.risco_descricao,
        quick_win: m.quick_win,
        alto_impacto: m.alto_impacto,
        prioridade: m.prioridade,
        tributos_afetados: m.opportunity.tributos_afetados,
        base_legal: m.opportunity.base_legal,
        base_legal_resumo: m.opportunity.base_legal_resumo,
        requer_contador: m.opportunity.requer_contador,
        requer_advogado: m.opportunity.requer_advogado,
        futuro_reforma: m.opportunity.futuro_reforma || null,
        descricao_reforma: m.opportunity.descricao_reforma || null,
        status_lc_224_2025: m.opportunity.status_lc_224_2025 || null,
        descricao_lc_224_2025: m.opportunity.descricao_lc_224_2025 || null,
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Match opportunities error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ 
      error: 'internal_error',
      message: errorMessage 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
