
# Plano: Sistema de Relatórios PDF Profissionais TribuTalks

## Visão Geral

Este plano implementa o sistema completo de relatórios PDF profissionais conforme especificação, utilizando a identidade visual TribuTalks com o logo Rebechi & Silva, cores douradas sobre fundo escuro, e estrutura de 8-15 páginas.

## Arquitetura Proposta

```text
src/
├── lib/
│   └── pdf/
│       ├── TribuTalksPdfTemplate.ts      # Template base reutilizável
│       ├── TribuTalksPdfColors.ts        # Paleta de cores (dourado/escuro)
│       ├── TribuTalksPdfStyles.ts        # Tipografia e layout
│       ├── CreditReportGenerator.ts      # Gerador de relatório de créditos
│       └── types.ts                      # Interfaces TypeScript
├── components/
│   └── pdf/
│       └── CreditReportDialog.tsx        # Modal de geração do relatório
└── hooks/
    └── useCreditReport.ts                # Hook para preparar dados do relatório
```

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/pdf/TribuTalksPdfColors.ts` | Paleta de cores do design system |
| `src/lib/pdf/TribuTalksPdfStyles.ts` | Tipografia Poppins/Inter, layouts |
| `src/lib/pdf/TribuTalksPdfTemplate.ts` | Funções base (header, footer, capa) |
| `src/lib/pdf/types.ts` | Interfaces RelatorioCreditos completas |
| `src/lib/pdf/CreditReportGenerator.ts` | Gerador principal (8-15 páginas) |
| `src/components/pdf/CreditReportDialog.tsx` | Modal de confirmação e geração |
| `src/hooks/useCreditReport.ts` | Hook para agregar dados de créditos + empresa |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/credits/CreditRadar.tsx` | Substituir CreditPdfReport pelo novo CreditReportDialog |
| `src/components/credits/CreditPdfReport.tsx` | Manter como fallback ou remover |

## Detalhamento Técnico

### 1. Paleta de Cores (TribuTalksPdfColors.ts)

```typescript
export const TRIBUTALKS_PDF_COLORS = {
  // Fundos
  bgPrimary: [10, 10, 10],        // #0A0A0A
  bgCard: [20, 20, 20],           // #141414
  bgElevated: [29, 28, 26],       // #1D1C1A
  bgGoldCard: [38, 32, 23],       // #262017
  
  // Dourados (accent)
  gold: [239, 162, 25],           // #EFA219
  goldText: [234, 159, 29],       // #EA9F1D
  goldButton: [245, 158, 11],     // #F59E0B
  
  // Status
  success: [34, 197, 94],         // #22C55E
  danger: [239, 68, 68],          // #EF4444
  
  // Textos
  textPrimary: [255, 255, 255],   // Branco
  textSecondary: [163, 163, 163], // #A3A3A3
  
  // Bordas
  border: [46, 46, 46],           // #2E2E2E
  borderTag: [68, 66, 61],        // #44423D
};
```

### 2. Estrutura do Relatório (8-15 páginas)

```text
┌─────────────────────────────────────────────────────────────┐
│ PÁGINA 1: CAPA                                              │
│ - Logo Rebechi & Silva (PNG do asset)                       │
│ - "TribuTalks — Inteligência Tributária"                    │
│ - Dados da empresa (CNPJ, Razão Social, Regime, Endereço)   │
│ - Data do relatório, Período, XMLs processados              │
│ - Número do relatório: TT-AAAA-XXXXX                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PÁGINA 2: SUMÁRIO EXECUTIVO                                 │
│ - Total Recuperável (R$ XXX.XXX,XX em destaque dourado)     │
│ - Economia Potencial Anual (range min-max)                  │
│ - Breakdown por confiança: Alta/Média/Baixa                 │
│ - Breakdown por tributo: PIS/COFINS, ICMS, ICMS-ST, IPI     │
│ - Estatísticas: XMLs analisados, créditos identificados     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PÁGINAS 3-6: DETALHAMENTO POR TRIBUTO                       │
│ Para cada tributo (PIS/COFINS, ICMS, etc.):                 │
│ - Base Legal (Lei, artigo, descrição)                       │
│ - Nível de Risco (badge colorido)                           │
│ - Tabela de notas fiscais:                                  │
│   - Chave de acesso (44 dígitos)                            │
│   - Número NF-e, CNPJ/Nome emitente                         │
│   - Data, Valor, NCM, CFOP, CST                             │
│   - Alíquota, Valor do crédito                              │
│ - Inconsistências encontradas                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PÁGINA 7: MAPA DE INCONSISTÊNCIAS                           │
│ - Total de inconsistências                                  │
│ - Tabela por tipo: CST incorreto, NCM divergente, etc.      │
│ - Impacto estimado por tipo                                 │
│ - Recomendações de correção                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PÁGINA 8: OPORTUNIDADES (Quick Wins)                        │
│ - Cards de oportunidades do company_opportunities           │
│ - Economia: R$ min — R$ max /ano                            │
│ - Risco, Base Legal, Elegibilidade                          │
│ - Implementação: Rápida/Média/Complexa                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PÁGINA 9: PRÓXIMOS PASSOS + DISCLAIMER                      │
│ - Lista de ações recomendadas (1-7)                         │
│ - Aviso legal completo                                      │
│ - Contatos: email, site, WhatsApp                           │
│ - Marca: TribuTalks + Rebechi & Silva                       │
└─────────────────────────────────────────────────────────────┘
```

### 3. Interfaces TypeScript (types.ts)

```typescript
export interface RelatorioCreditos {
  id: string;                          // TT-2026-00001
  dataGeracao: Date;
  periodoInicio: Date;
  periodoFim: Date;
  empresa: EmpresaDados;
  sumario: SumarioExecutivo;
  creditosPorTributo: TributoCreditoDetalhe[];
  inconsistencias: Inconsistencia[];
  oportunidades: Oportunidade[];
}

export interface EmpresaDados {
  razaoSocial: string;
  cnpj: string;
  cnae: string;
  cnaeDescricao: string;
  regime: 'simples' | 'presumido' | 'real';
  endereco: string;
  responsavel: string;
}

export interface TributoCreditoDetalhe {
  tributo: 'PIS' | 'COFINS' | 'PIS/COFINS' | 'ICMS' | 'ICMS-ST' | 'IPI';
  valorTotal: number;
  baseLegal: string;
  descricaoBaseLegal: string;
  risco: 'nenhum' | 'baixo' | 'medio' | 'alto';
  notas: NotaFiscalCredito[];
}

export interface NotaFiscalCredito {
  chaveAcesso: string;          // 44 dígitos
  numeroNfe: string;
  cnpjEmitente: string;
  nomeEmitente: string;
  dataEmissao: Date;
  valorNota: number;
  ncm: string;
  cfop: string;
  cst: string;
  aliquota: number;
  valorCredito: number;
  confianca: 'alta' | 'media' | 'baixa';
}
```

### 4. Hook useCreditReport

O hook irá:
1. Buscar `currentCompany` do CompanyContext
2. Buscar `identified_credits` com join em `credit_rules`
3. Buscar `xml_imports` para contagem
4. Buscar `company_opportunities` para Quick Wins
5. Calcular sumários e agrupar por tributo
6. Retornar objeto `RelatorioCreditos` pronto para geração

### 5. Geração do PDF com jsPDF

```typescript
// CreditReportGenerator.ts
export async function generateTribuTalksCreditReport(
  data: RelatorioCreditos,
  logoBase64: string
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Página 1: Capa
  drawCoverPage(doc, data, logoBase64);
  
  // Página 2: Sumário Executivo
  doc.addPage();
  drawExecutiveSummary(doc, data.sumario);
  
  // Páginas 3-6: Detalhamento por Tributo
  for (const tributo of data.creditosPorTributo) {
    doc.addPage();
    drawTributeDetail(doc, tributo);
  }
  
  // Página 7: Inconsistências
  doc.addPage();
  drawInconsistenciesMap(doc, data.inconsistencias);
  
  // Página 8: Oportunidades
  doc.addPage();
  drawOpportunities(doc, data.oportunidades);
  
  // Página 9: Próximos Passos + Disclaimer
  doc.addPage();
  drawNextStepsAndDisclaimer(doc);
  
  // Salvar
  doc.save(`TribuTalks_Creditos_${formatReportId(data.id)}.pdf`);
}
```

### 6. Integração com Logo

O logo `src/assets/logo-rebechi-silva.png` será:
1. Convertido para Base64 no momento da geração
2. Inserido em todas as páginas (header recorrente)
3. Dimensionado: 120px na capa, 80px nas internas

### 7. Número do Relatório

Formato: `TT-AAAA-XXXXX`
- TT = TribuTalks
- AAAA = Ano
- XXXXX = ID sequencial baseado em timestamp

```typescript
function generateReportId(): string {
  const year = new Date().getFullYear();
  const seq = Date.now().toString().slice(-5);
  return `TT-${year}-${seq}`;
}
```

## Fluxo de Uso

```text
1. Usuário acessa Radar de Créditos (/dashboard/recuperar/radar)
2. Clica em "Baixar Relatório PDF"
3. Modal CreditReportDialog abre:
   - Mostra preview com dados da empresa
   - Opção: Tema Escuro (digital) ou Claro (impressão)
   - Botão "Gerar Relatório"
4. useCreditReport busca todos os dados
5. CreditReportGenerator gera PDF de 8-15 páginas
6. Download automático do arquivo
```

## Checklist de Qualidade

- [ ] Logo TribuTalks (Rebechi & Silva) em todas as páginas
- [ ] Cores douradas sobre fundo escuro
- [ ] CNPJ formatado corretamente
- [ ] Valores em R$ X.XXX.XXX,XX
- [ ] Chaves de acesso completas (44 dígitos)
- [ ] Base legal para cada tributo
- [ ] Nível de risco com badges coloridos
- [ ] Paginação (Página X de XX)
- [ ] Disclaimer na última página
- [ ] Número do relatório único (TT-AAAA-XXXXX)

## Dependências

Nenhuma nova dependência necessária:
- `jspdf` já está instalado (v4.0.0)
- Logo já existe em `src/assets/logo-rebechi-silva.png`

## Estimativa

- Novos arquivos: 7
- Arquivos modificados: 2
- Complexidade: Média-Alta (geração de PDF multi-página)
