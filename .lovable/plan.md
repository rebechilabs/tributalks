
# Plano: Atualizar Relatório Executivo V2 para Padrão Nestlé

## Análise do Estado Atual vs. Modelo de Referência

O sistema já possui um gerador robusto (`ExecutiveReportV2Generator.ts`) com as 7 seções obrigatórias, mas precisa de ajustes para ficar idêntico ao modelo Nestlé.

### Diferenças Identificadas

| Aspecto | Modelo Nestlé (Referência) | Implementação Atual |
|---------|---------------------------|---------------------|
| Logo | "Rebechi & Silva Advogados Associados" | `logo-rs-pdf.png` (imagem) |
| Cores de título | Azul escuro `#003366` e dourado `#DAA520` | Preto e cinzas |
| Cabeçalho tabelas | Cinza claro `#F5F5F5` | `rgb(240,240,240)` ✓ similar |
| Seção 1 (Sumário) | Numerada como "1. SUMÁRIO EXECUTIVO" | "2. SUMÁRIO EXECUTIVO" |
| Tabela de PIS/COFINS | Colunas: Período, Base Cálculo, Alíquota, Crédito, Fundamento | Estrutura similar ✓ |
| Anexo A | Chaves de 44 dígitos completas + Valor NF-e + Crédito Total | Chave truncada em alguns casos |
| Contato no final | Email, WhatsApp, Site | Apenas branding simples |
| Fonte chaves NF-e | Courier (monospace) | Helvetica monospace ✓ |

## Alterações Técnicas

### 1. Atualizar Estilos (`ExecutiveReportStyles.ts`)
- Adicionar cores padrão Nestlé:
  - Azul escuro: `#003366` (rgb: 0, 51, 102)
  - Dourado: `#DAA520` (rgb: 218, 165, 32)
  - Verde total: `#006633` (rgb: 0, 102, 51)
- Ajustar tipografia para títulos

### 2. Atualizar Gerador V2 (`ExecutiveReportV2Generator.ts`)

**Seção 1 - Capa:**
- Ajustar layout para posicionar empresa mais centralizada
- Adicionar "Sumário Executivo" como subtítulo

**Seção 2 - Sumário Executivo (renumerar para 1):**
- Aplicar cor verde `#006633` no total de créditos
- Adicionar parágrafo introdutório descritivo
- Incluir "Economia potencial anual estimada" com range
- Ajustar tabela de distribuição para exibir `R$` formatado

**Seção 3 - Metodologia (renumerar para 2):**
- Expandir descrição das 5 etapas conforme modelo
- Incluir referência às Leis 10.637/02 e 10.833/03

**Seção 4 - Análise Detalhada (renumerar para 3):**
- Ajustar tabelas de créditos por período mensal
- Garantir linha de TOTAL em cada tabela com destaque

**Seção 5 - Recomendações (renumerar para 4):**
- Expandir para 5 passos com descrições mais detalhadas
- Incluir "Documentação e arquivamento" como passo 5

**Seção 6 - Aviso Legal (renumerar para 5):**
- Manter estrutura atual (já está completa)

**Seção 7 - Anexos (renumerar para 6):**
- Garantir chaves de 44 dígitos COMPLETAS (não truncar)
- Adicionar coluna "Valor NF-e" além de "Crédito Total"
- Incluir nota de rodapé sobre Portal NF-e
- Adicionar "ANEXO B - RASTREABILIDADE DE SPED" (se houver dados SPED)

**Nova Seção - Contato (adicionar ao final):**
- Email: suporte@tributalks.com.br
- WhatsApp: +55 11 91452-3971
- Site: tributalks.com.br
- Timestamp de geração

### 3. Atualizar Tipos (`types.ts`)
- Adicionar `valorNota` na interface `NotaFiscalCredito` (já existe ✓)
- Garantir que período de apuração seja extraído corretamente

### 4. Ajustar Hook (`useCreditReport.ts`)
- Agrupar créditos por período mensal (MM/YYYY) para cada tributo
- Calcular base de cálculo por período

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/pdf/ExecutiveReportStyles.ts` | Adicionar cores Nestlé |
| `src/lib/pdf/ExecutiveReportV2Generator.ts` | Atualizar todas as 7 seções + adicionar Contato |
| `src/lib/pdf/types.ts` | Adicionar interface para períodos agrupados (se necessário) |
| `src/hooks/useCreditReport.ts` | Agrupar créditos por período mensal |

## Resultado Esperado

O relatório PDF gerado será visualmente idêntico ao modelo Nestlé (TT-2026-00142), com:

1. **Capa profissional** com dados da empresa e período
2. **Sumário Executivo** com total em destaque (cor verde) e tabela de distribuição
3. **Metodologia** com 5 etapas detalhadas
4. **Análise por Tributo** com tabelas mensais e fundamentação legal
5. **Recomendações** com 5 passos claros
6. **Aviso Legal** completo
7. **Anexo A** com TODAS as chaves de 44 dígitos, valores e créditos
8. **Seção de Contato** com informações da TribuTalks

Total de páginas: 7+ (dependendo da quantidade de notas)

## Observação sobre Logo

O sistema já utiliza `logo-rs-pdf.png`. Se desejarem atualizar para "Rebechi & Silva Advogados Associados" como texto (igual ao modelo), isso pode ser feito ajustando o fallback de texto no header.
