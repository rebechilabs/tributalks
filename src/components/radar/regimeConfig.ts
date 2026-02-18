import { Building, TrendingUp, Target } from 'lucide-react';

export type RegimeType = 'simples' | 'presumido' | 'real';

export type DocStatus = 'pending' | 'uploaded' | 'recommended';

export interface DocumentConfig {
  id: string;
  label: string;
  description: string;
  required: boolean;
  /** Which uploader component to use */
  uploaderType: 'xml' | 'sped' | 'dctf' | 'pgdas';
  /** Accepted file types */
  accept?: string;
}

export interface RegimeConfig {
  id: RegimeType;
  label: string;
  description: string;
  icon: typeof Building;
  documents: DocumentConfig[];
  helperText: string;
  analysisChecklist: string[];
}

export const REGIME_CONFIGS: Record<RegimeType, RegimeConfig> = {
  simples: {
    id: 'simples',
    label: 'Simples Nacional',
    description: 'Regime unificado com DAS mensal',
    icon: Building,
    documents: [
      {
        id: 'xml-nfe',
        label: 'XMLs de NF-e',
        description: 'Notas Fiscais Eletrônicas de entrada e saída',
        required: true,
        uploaderType: 'xml',
        accept: '.xml,.zip',
      },
      {
        id: 'das',
        label: 'DAS',
        description: 'Documento de Arrecadação do Simples Nacional',
        required: false,
        uploaderType: 'pgdas',
        accept: '.pdf,.txt',
      },
      {
        id: 'pgdas-d',
        label: 'PGDAS-D',
        description: 'Programa Gerador do Documento de Arrecadação',
        required: false,
        uploaderType: 'pgdas',
        accept: '.pdf,.txt',
      },
    ],
    helperText:
      'Atenção: No Simples Nacional os créditos tributários são limitados. Nossa análise focará em: detecção de bitributação (mesmo produto taxado duas vezes), pagamentos de DAS a maior, erros de classificação CFOP que geram ICMS indevido, e cálculos incorretos de DIFAL em operações interestaduais.',
    analysisChecklist: [
      'Bitributação (mesmo produto taxado em duas etapas)',
      'DAS pago a maior por flutuação de receita',
      'Classificação CFOP incorreta',
      'Cálculo de DIFAL em operações interestaduais',
    ],
  },
  presumido: {
    id: 'presumido',
    label: 'Lucro Presumido',
    description: 'Tributação sobre receita presumida',
    icon: TrendingUp,
    documents: [
      {
        id: 'xml-nfe',
        label: 'XMLs de NF-e',
        description: 'Notas Fiscais Eletrônicas de entrada e saída',
        required: true,
        uploaderType: 'xml',
        accept: '.xml,.zip',
      },
      {
        id: 'sped-efd-icms',
        label: 'SPED EFD-ICMS/IPI',
        description: 'Escrituração Fiscal Digital',
        required: true,
        uploaderType: 'sped',
      },
      {
        id: 'dctf',
        label: 'DCTF',
        description: 'Declaração de Débitos e Créditos Tributários Federais',
        required: false,
        uploaderType: 'dctf',
      },
    ],
    helperText:
      'Analisaremos: créditos de ICMS sobre insumos e ativo imobilizado, créditos de IPI sobre matéria-prima, pagamentos a maior de IRPJ/CSLL nas estimativas trimestrais, retenções de IRRF não recuperadas, e erros de DIFAL em vendas interestaduais. Nota: PIS/COFINS opera no regime cumulativo, sem direito a créditos.',
    analysisChecklist: [
      'Créditos de ICMS sobre insumos e ativo imobilizado',
      'Créditos de IPI sobre matéria-prima',
      'IRPJ/CSLL estimados vs. apurados (pagamento a maior)',
      'Retenções de IRRF não compensadas',
      'Erros de alíquota e DIFAL',
    ],
  },
  real: {
    id: 'real',
    label: 'Lucro Real',
    description: 'Tributação sobre lucro efetivo — maior potencial de créditos',
    icon: Target,
    documents: [
      {
        id: 'xml-nfe',
        label: 'XMLs de NF-e',
        description: 'Notas Fiscais Eletrônicas de entrada e saída',
        required: true,
        uploaderType: 'xml',
        accept: '.xml,.zip',
      },
      {
        id: 'sped-efd-icms',
        label: 'SPED EFD-ICMS/IPI',
        description: 'Escrituração Fiscal Digital',
        required: true,
        uploaderType: 'sped',
      },
      {
        id: 'sped-efd-contrib',
        label: 'SPED EFD-Contribuições',
        description: 'PIS/COFINS',
        required: true,
        uploaderType: 'sped',
      },
      {
        id: 'sped-ecd',
        label: 'SPED ECD',
        description: 'Escrituração Contábil Digital',
        required: false,
        uploaderType: 'sped',
      },
      {
        id: 'sped-ecf',
        label: 'SPED ECF',
        description: 'Escrituração Contábil Fiscal',
        required: false,
        uploaderType: 'sped',
      },
      {
        id: 'dctf',
        label: 'DCTF',
        description: 'Declaração de Débitos e Créditos Tributários Federais',
        required: false,
        uploaderType: 'dctf',
      },
    ],
    helperText:
      'Análise completa com maior potencial de recuperação: créditos de ICMS integral sobre insumos, energia e transporte; créditos de PIS (1,65%) e COFINS (7,6%) no regime não-cumulativo; créditos de IPI; pagamentos a maior de IRPJ/CSLL; retenções de IRRF; créditos acumulados próximos da prescrição de 5 anos; e otimização para a transição CBS/IBS 2027.',
    analysisChecklist: [
      'Créditos de PIS/COFINS não-cumulativo não aproveitados',
      'Créditos de ICMS sobre insumos, energia e transporte',
      'Créditos de IPI sobre matéria-prima',
      'IRPJ/CSLL estimados vs. apurados',
      'Retenções de IRRF não compensadas',
      'Créditos acumulados próximos da prescrição (5 anos)',
      'Pagamentos em duplicidade',
      'Simulação de impacto CBS/IBS 2027',
    ],
  },
};
