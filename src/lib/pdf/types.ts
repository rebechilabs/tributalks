/**
 * TribuTalks PDF Report Types
 * TypeScript interfaces for credit reports
 */

// Main report structure
export interface RelatorioCreditos {
  id: string;                          // TT-2026-00001 format
  dataGeracao: Date;
  periodoInicio: Date;
  periodoFim: Date;
  empresa: EmpresaDados;
  sumario: SumarioExecutivo;
  creditosPorTributo: TributoCreditoDetalhe[];
  inconsistencias: Inconsistencia[];
  oportunidades: Oportunidade[];
  estatisticas: Estatisticas;
}

// Company data
export interface EmpresaDados {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  cnae?: string;
  cnaeDescricao?: string;
  regime: 'simples' | 'presumido' | 'real';
  endereco?: string;
  municipio?: string;
  uf?: string;
  responsavel?: string;
  email?: string;
}

// Executive summary
export interface SumarioExecutivo {
  totalRecuperavel: number;
  economiaAnualMin: number;
  economiaAnualMax: number;
  pisCofins: number;
  icms: number;
  icmsSt: number;
  ipi: number;
  altaConfianca: number;
  mediaConfianca: number;
  baixaConfianca: number;
  totalCreditos: number;
}

// Tax breakdown details
export interface TributoCreditoDetalhe {
  tributo: TipoTributo;
  valorTotal: number;
  baseLegal: string;
  descricaoBaseLegal: string;
  artigo?: string;
  risco: NivelRisco;
  notas: NotaFiscalCredito[];
  regras: RegraCredito[];
}

export type TipoTributo = 'PIS' | 'COFINS' | 'PIS/COFINS' | 'ICMS' | 'ICMS-ST' | 'IPI' | 'Outros';

export type NivelRisco = 'nenhum' | 'baixo' | 'medio' | 'alto';

export type NivelConfianca = 'alta' | 'media' | 'baixa';

// Credit rule details
export interface RegraCredito {
  codigo: string;
  nome: string;
  tributo: string;
  baseLegal: string;
  descricao: string;
  confianca: NivelConfianca;
  totalIdentificado: number;
  quantidadeNotas: number;
}

// Invoice credit details
export interface NotaFiscalCredito {
  chaveAcesso: string;          // 44 digits
  numeroNfe: string;
  cnpjEmitente: string;
  nomeEmitente: string;
  dataEmissao: Date | string;
  valorNota: number;
  valorCredito: number;
  ncm: string;
  cfop: string;
  cst: string;
  aliquota?: number;
  confianca: NivelConfianca;
  regraAplicada?: string;
  baseLegal?: string;
}

// Inconsistency details
export interface Inconsistencia {
  tipo: TipoInconsistencia;
  descricao: string;
  impacto: number;
  quantidadeNotas: number;
  recomendacao: string;
  exemplos?: NotaFiscalCredito[];
}

export type TipoInconsistencia = 
  | 'cst_incorreto'
  | 'ncm_divergente'
  | 'aliquota_indevida'
  | 'base_calculo_incorreta'
  | 'cfop_incompativel'
  | 'credito_nao_aproveitado'
  | 'tributacao_monofasica'
  | 'outro';

// Opportunity details
export interface Oportunidade {
  id: string;
  titulo: string;
  descricao: string;
  economiaMin: number;
  economiaMax: number;
  risco: NivelRisco;
  complexidade: 'rapida' | 'media' | 'complexa';
  baseLegal?: string;
  elegibilidade: string[];
  quickWin: boolean;
}

// Statistics
export interface Estatisticas {
  totalXmlsAnalisados: number;
  totalCreditosIdentificados: number;
  periodoCobertura: string;
  dataUltimaAnalise: Date;
  regrasAplicadas: number;
  fornecedoresAnalisados: number;
}

// Report generation options
export interface ReportOptions {
  tema: 'escuro' | 'claro';
  formato: 'visual' | 'executivo';
  incluirDetalhes: boolean;
  incluirInconsistencias: boolean;
  incluirOportunidades: boolean;
  maxNotasPorTributo: number;
}

// Default options
export const DEFAULT_REPORT_OPTIONS: ReportOptions = {
  tema: 'escuro',
  formato: 'visual',
  incluirDetalhes: true,
  incluirInconsistencias: true,
  incluirOportunidades: true,
  maxNotasPorTributo: 20,
};

// Extended invoice credit with full traceability (for Executive Report)
export interface CreditoRastreavel {
  id: string;
  valor: number;
  tipo: string;
  tributo: TipoTributo;
  confianca: NivelConfianca;
  baseLegal: string;
  
  // Fiscal document
  documentoFiscal: {
    numeroNfe: string;
    chaveAcesso: string;           // 44 digits
    cnpjEmitente: string;
    razaoSocialEmitente: string;
    ufEmitente?: string;
    dataEmissao: Date | string;
    valorNota: number;
  };
  
  // Item details
  item: {
    descricao: string;
    ncm: string;
    cfop: string;
    cstDeclarado: string;
    cstCorreto: string;
    aliquotaCobrada: number;
    aliquotaDevida: number;
    baseCalculo: number;
    valorPago: number;
    valorDevido: number;
    diferenca: number;
  };
  
  // SPED reference
  sped: {
    tipo: 'EFD Contribuições' | 'EFD ICMS/IPI';
    periodo: string;              // MM/AAAA
    registro: string;             // C100, C170, C190, etc.
    bloco: string;
  };
  
  // Recommended action
  acaoRecomendada: string;
}

// Helper to generate report ID
export function generateReportId(): string {
  const year = new Date().getFullYear();
  const seq = Date.now().toString().slice(-5);
  return `TT-${year}-${seq}`;
}

// Helper to format report ID for display
export function formatReportId(id: string): string {
  return id.replace(/^TT-/, '');
}
