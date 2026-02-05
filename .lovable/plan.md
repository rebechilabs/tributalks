

# Plano: Relatório Executivo Tributário V2

## Visão Geral

Criar um novo gerador de relatório PDF executivo seguindo a especificação detalhada fornecida. O relatório terá 7 seções obrigatórias com rastreabilidade total das informações, incluindo logo em todas as páginas e anexos com chaves de acesso de NF-e.

## Estrutura do Relatório (7 Seções)

```text
┌─────────────────────────────────────────────────┐
│  SEÇÃO 1: CAPA                                  │
│  - Logo TribuTalks (canto superior esquerdo)    │
│  - "RELATÓRIO DE CRÉDITOS TRIBUTÁRIOS"          │
│  - Dados da empresa (Razão Social, CNPJ, Regime)│
│  - Nº relatório, Data, Período, Docs processados│
└─────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  SEÇÃO 2: SUMÁRIO EXECUTIVO                     │
│  - Total de Créditos Identificados (destaque)   │
│  - Tabela: Tributo × Valor × Representatividade │
│  - Gráfico de barras (distribuição por tributo) │
│  - Resumo das 2-3 principais oportunidades      │
└─────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  SEÇÃO 3: METODOLOGIA APLICADA                  │
│  - Fontes de dados (SPED, XMLs, períodos)       │
│  - Processo de análise (4 etapas descritas)     │
└─────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  SEÇÃO 4: ANÁLISE DETALHADA DOS CRÉDITOS        │
│  - Subseção por tributo (PIS/COFINS, ICMS, etc.)│
│  - Tabela: Período, Base, Alíquota, Valor,      │
│            Fundamentação Legal, Documentos      │
└─────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  SEÇÃO 5: RECOMENDAÇÕES E PRÓXIMOS PASSOS       │
│  - 4 passos numerados (Validação, Localização,  │
│    Retificação, Pedido de Restituição)          │
└─────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  SEÇÃO 6: PREMISSAS, LIMITAÇÕES E AVISO LEGAL   │
│  - Caráter informativo                          │
│  - Condições para recuperação (4 itens)         │
└─────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  SEÇÃO 7: ANEXOS DE RASTREABILIDADE             │
│  - Anexo A: Tabela com TODAS as chaves NF-e     │
│  - Anexo B: Tabela com arquivos SPED analisados │
└─────────────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

### 1. Novo Arquivo: `src/lib/pdf/ExecutiveReportV2Generator.ts`
Gerador completo seguindo a especificação com:
- Logo Rebechi & Silva em todas as páginas (canto superior esquerdo)
- Paginação "Página X de Y" (todas exceto capa)
- 7 seções obrigatórias
- Gráfico de barras na seção 2 (usando jsPDF primitivos)
- Tabelas formatadas com grid completo
- Anexos com todas as chaves de acesso de 44 dígitos

### 2. Modificar: `src/lib/pdf/ExecutiveReportStyles.ts`
Adicionar constantes para o novo layout:
- Dimensões do logo
- Cores para gráfico de barras
- Espaçamento para tabelas com grid

### 3. Modificar: `src/components/pdf/CreditReportDialog.tsx`
Adicionar nova opção "Executivo V2" no seletor de formato:
- Manter "Executivo" (texto atual)
- Adicionar "Executivo Completo" (novo com tabelas e anexos)
- Carregar logo para o novo formato

### 4. Copiar Logo: `user-uploads://LOGO_RS-5.png` → `src/assets/logo-rs-pdf.png`
Usar o logo fornecido pelo usuário para o relatório

## Detalhes Técnicos

### Estrutura de Tabelas (Seção 4)
```text
┌──────────────┬─────────────┬──────────┬─────────────┬──────────────────┬────────────────────────┐
│ Período      │ Base Cálc.  │ Alíquota │ Valor Créd. │ Fundamentação    │ Documentos Origem      │
├──────────────┼─────────────┼──────────┼─────────────┼──────────────────┼────────────────────────┤
│ 01/2025      │ R$ 45.000   │ 1,65%    │ R$ 742,50   │ Lei 10.637/02    │ 3524xxxx...xxxx (44)   │
│ 02/2025      │ R$ 52.300   │ 1,65%    │ R$ 862,95   │ Lei 10.637/02    │ 3524xxxx...xxxx (44)   │
└──────────────┴─────────────┴──────────┴─────────────┴──────────────────┴────────────────────────┘
```

### Gráfico de Barras (Seção 2)
- Barras horizontais coloridas
- Cores diferenciadas por tributo
- Valores e percentuais ao lado de cada barra

### Anexo A - Formato
```text
┌────────────────────────────────────────────────┬───────────────┐
│ Chave de Acesso (44 dígitos)                   │ Valor Crédito │
├────────────────────────────────────────────────┼───────────────┤
│ 3524 0147 7061 4400 0121 5500 1000 0012 3410   │ R$ 1.234,56   │
│ 0000 1234                                      │               │
└────────────────────────────────────────────────┴───────────────┘
```

### Funções Auxiliares
- `drawLogoHeader()`: Logo + título em todas as páginas
- `drawPagination()`: "Página X de Y" no rodapé
- `drawCreditTable()`: Tabela com grid e cores alternadas
- `drawBarChart()`: Gráfico de barras horizontal
- `drawAnnexTable()`: Tabela de chaves de acesso

### Fluxo de Geração
1. Carregar logo como base64
2. Calcular número total de páginas (incluindo anexos)
3. Renderizar cada seção com quebras automáticas
4. Adicionar header/footer em cada página
5. Salvar como `TribuTalks_Executivo_TT-AAAA-XXXXX.pdf`

## Considerações de Design

- **Fundo**: Branco (ideal para impressão e leitura)
- **Texto**: Preto (#000000)
- **Destaque**: Dourado TribuTalks (#EFA219)
- **Cabeçalhos de tabela**: Fundo cinza claro (#F5F5F5)
- **Linhas alternadas**: Fundo muito leve (#FAFAFA)
- **Logo**: Máximo 40mm de largura no header

## Avisos Legais (Textos Obrigatórios)

### Seção 6 - Caráter Informativo
> "Os créditos identificados neste relatório são ESTIMATIVAS baseadas na análise automatizada dos documentos fiscais eletrônicos fornecidos. O conteúdo deste relatório tem natureza EXCLUSIVAMENTE EDUCATIVA E INFORMATIVA, não constituindo parecer jurídico ou consultoria fiscal."

### Seção 6 - Condições
> "A recuperação efetiva dos valores está sujeita a:
> - Validação por profissional contábil ou jurídico habilitado
> - Confirmação das bases legais aplicáveis ao caso concreto
> - Análise de eventuais particularidades da empresa
> - Verificação de prazos decadenciais e prescricionais"

