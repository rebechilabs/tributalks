
# Plano: Relatório Executivo TribuTalks - Formato Profissional com Rastreabilidade Total

## Resumo

Criar um novo sistema de geração de PDF seguindo as especificações detalhadas do prompt: relatório limpo, sem gráficos, hierarquia tipográfica clara, e **rastreabilidade completa** de cada crédito até sua origem documental (NF-e, SPED, DCTF).

---

## Análise do Sistema Atual

O sistema existente possui:
- `CreditReportGenerator.ts` - Gerador atual com tema escuro/claro, barras visuais
- `TribuTalksPdfTemplate.ts` - Templates com cards coloridos e badges
- `TribuTalksPdfStyles.ts` - Constantes de layout (A4, margens corretas)
- `TribuTalksPdfColors.ts` - Paleta de cores (ouro, fundo escuro)
- `useCreditReport.ts` - Hook que agrega dados de `identified_credits`

**Problema:** O formato atual usa gráficos, barras visuais, badges coloridos - não é o formato executivo limpo solicitado.

---

## Novo Design: Formato Executivo Profissional

### Princípios
1. **Zero gráficos** - apenas texto estruturado e separadores
2. **Hierarquia tipográfica** - H1/H2/H3 claros, valores em negrito
3. **Rastreabilidade total** - chave de acesso 44 dígitos, referência SPED, ação recomendada
4. **Formato ASCII** - boxes com caracteres `─`, `│`, `┌`, `└`, `├`, `┤`
5. **Margens A4** - 25mm topo/base, 20mm laterais

---

## Estrutura do Relatório (8-15 páginas)

### Página 1 - Capa
```text
─────────────────────────────────────────────────────────────────

                TribuTalks — Inteligência Tributária

─────────────────────────────────────────────────────────────────

                RELATÓRIO DE CRÉDITOS TRIBUTÁRIOS
                       Sumário Executivo

EMPRESA:        [Razão Social]
CNPJ:           [XX.XXX.XXX/XXXX-XX]
REGIME:         [Lucro Real / Presumido / Simples]

Relatório nº:           TT-2026-XXXXX
Data de emissão:        [DD/MM/AAAA]
Período analisado:      [MM/AAAA] a [MM/AAAA]
Documentos processados: [X.XXX] XMLs de NF-e

                                                    Página 1 de X
```

### Página 2 - Sumário Executivo
- Total recuperável em destaque (**negrito**)
- Distribuição por tributo (lista com valores)
- Economia potencial anual (min-max)
- Resumo das 3 principais oportunidades

### Páginas 3+ - Detalhamento dos Créditos (RASTREABILIDADE TOTAL)

Para cada crédito, box estruturado:
```text
┌─────────────────────────────────────────────────────────────────┐
│ CRÉDITO #1                                                      │
├─────────────────────────────────────────────────────────────────┤
│ Valor do crédito:     **R$ X.XXX,XX**                          │
│ Tipo:                 PIS/COFINS Monofásico                     │
│ Confiança:            Alta                                      │
├─────────────────────────────────────────────────────────────────┤
│ ORIGEM DOCUMENTAL:                                              │
│                                                                 │
│ NF-e nº:              000.123.456                               │
│ Chave de acesso:      35260112345678000199550010001234561234567890│
│ Emitente:             Fornecedor ABC Ltda                       │
│ CNPJ emitente:        12.345.678/0001-99                        │
│ Data de emissão:      15/03/2025                                │
│ Valor da nota:        R$ 12.500,00                              │
│                                                                 │
│ Item:                 Produto XYZ                               │
│ NCM:                  3303.00.20                                │
│ CFOP:                 1.102                                     │
│ CST PIS:              04 (tributação monofásica)                │
│ Alíquota:             0,00%                                     │
│                                                                 │
│ REFERÊNCIA SPED:                                                │
│ EFD Contribuições:    Período MM/AAAA                           │
│ Registro:             C170 (itens do documento)                 │
├─────────────────────────────────────────────────────────────────┤
│ AÇÃO RECOMENDADA:                                               │
│ Retificar EFD Contribuições de MM/AAAA. Gerar PER/DCOMP.       │
└─────────────────────────────────────────────────────────────────┘
```

### Página Final - Próximos Passos + Aviso Legal
- Lista numerada de 5 passos para recuperação
- Disclaimer legal obrigatório (natureza educativa)
- Contatos TribuTalks

---

## Arquivos a Criar/Modificar

### 1. CRIAR: `src/lib/pdf/ExecutiveReportGenerator.ts`
Novo gerador de PDF seguindo o formato executivo:
- Função `generateExecutiveCreditReport()`
- Layout apenas texto, sem gráficos
- Boxes ASCII simulados com linhas jsPDF
- Fonte monoespaçada para chaves de acesso
- Paginação automática

### 2. CRIAR: `src/lib/pdf/ExecutiveReportStyles.ts`
Constantes específicas para o formato executivo:
- Tipografia: Helvetica Regular/Bold (não Poppins - jsPDF limitação)
- Cores: apenas preto (#000), cinza (#666), negrito para destaques
- Margens: 25mm topo/base, 20mm laterais
- Espaçamentos entre seções

### 3. MODIFICAR: `src/lib/pdf/types.ts`
Expandir interface `NotaFiscalCredito` para incluir:
- `cstDeclarado` / `cstCorreto` (para mostrar correção)
- `aliquotaCobrada` / `aliquotaDevida`
- `valorPago` / `valorDevido` / `diferenca`
- `spedTipo` / `spedPeriodo` / `spedRegistro`
- `acaoRecomendada`

### 4. MODIFICAR: `src/hooks/useCreditReport.ts`
Enriquecer dados para rastreabilidade:
- Inferir período SPED baseado na data da NF-e
- Mapear tipo de registro SPED baseado no tributo
- Gerar ação recomendada automática por tipo de crédito

### 5. MODIFICAR: `src/components/pdf/CreditReportDialog.tsx`
Adicionar opção para escolher formato:
- "Executivo (texto)" - novo formato limpo
- "Visual (gráficos)" - formato atual

---

## Interface TypeScript Expandida

```typescript
interface CreditoRastreavel {
  id: string;
  valor: number;
  tipo: string;
  tributo: 'PIS' | 'COFINS' | 'PIS/COFINS' | 'ICMS' | 'ICMS-ST' | 'IPI';
  confianca: 'alta' | 'media' | 'baixa';
  baseLegal: string;
  
  // Documento fiscal
  documentoFiscal: {
    numeroNfe: string;
    chaveAcesso: string;           // 44 dígitos
    cnpjEmitente: string;
    razaoSocialEmitente: string;
    ufEmitente?: string;
    dataEmissao: Date;
    valorNota: number;
  };
  
  // Detalhes do item
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
  
  // Referência SPED
  sped: {
    tipo: 'EFD Contribuições' | 'EFD ICMS/IPI';
    periodo: string;              // MM/AAAA
    registro: string;             // C100, C170, C190, etc.
    bloco: string;
  };
  
  // Ação recomendada
  acaoRecomendada: string;
}
```

---

## Detalhes Técnicos

### Tipografia (jsPDF)
- **Títulos H1:** Helvetica Bold, 16pt
- **Subtítulos H2:** Helvetica Bold, 14pt
- **Corpo:** Helvetica Regular, 10pt
- **Valores destaque:** Helvetica Bold, 10-11pt
- **Chaves de acesso:** Courier (monoespaçada), 8pt

### Cores (Preto e branco para impressão)
- Texto principal: RGB(0,0,0)
- Texto secundário: RGB(102,102,102) = #666
- Linhas/bordas: RGB(46,46,46) = #2E2E2E
- Background: RGB(255,255,255) branco

### Boxes ASCII
jsPDF não suporta caracteres Unicode box-drawing diretamente.
Solução: desenhar retângulos com `doc.rect()` e linhas com `doc.line()`.

### Paginação
- Cada crédito ocupa ~50-60mm de altura
- Verificar `needsNewPage()` antes de renderizar cada crédito
- Footer com "Página X de Y" em todas as páginas

---

## Mapeamento SPED Automático

| Tributo | Tipo SPED | Registros |
|---------|-----------|-----------|
| PIS/COFINS | EFD Contribuições | C170 (itens), M100/M500 (apuração) |
| ICMS | EFD ICMS/IPI | C100 (doc), C170 (itens), C190 (total) |
| ICMS-ST | EFD ICMS/IPI | C100, C113 (ST) |
| IPI | EFD ICMS/IPI | C100, C170, E520 |

---

## Ações Recomendadas por Tipo

| Tipo de Crédito | Ação Automática |
|-----------------|-----------------|
| PIS/COFINS Monofásico | Retificar EFD Contribuições do período. Corrigir CST de XX para 04. Transmitir PER/DCOMP. |
| ICMS não aproveitado | Retificar EFD ICMS/IPI. Incluir registro C190 com apropriação do crédito. |
| ICMS-ST indevido | Solicitar restituição via e-CAC ou sistema estadual. |
| CST incorreto | Revisar classificação fiscal. Corrigir CSTs nas próximas operações. |

---

## Resultado Esperado

PDF de 8-15 páginas contendo:
1. **Capa** - Dados da empresa, número do relatório
2. **Sumário Executivo** - Total + breakdown (texto apenas)
3. **Detalhamento PIS/COFINS** - Cada crédito com rastreabilidade
4. **Detalhamento ICMS** - Cada crédito com rastreabilidade
5. **Detalhamento ICMS-ST** - Se houver
6. **Detalhamento IPI** - Se houver
7. **Próximos Passos** - 5 itens numerados
8. **Aviso Legal** - Disclaimer completo

Formato ideal para:
- CEO ler em 5 minutos e entender oportunidades
- Contador usar como guia para executar retificações
- Advogado tributarista validar bases legais
