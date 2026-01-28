
# Plano: Importador de XMLs para Lotes Históricos (5 Anos)

## Resumo Executivo

Aprimorar o importador de XMLs existente para suportar upload em massa de arquivos históricos (5 anos de notas fiscais), com processamento em lotes, barra de progresso detalhada em tempo real, estimativa de tempo restante, e resumo completo da importação incluindo estatísticas por período, tipo de documento, fornecedores e análise de créditos identificados.

---

## 1. Limitações Atuais Identificadas

| Limitação | Impacto |
|-----------|---------|
| Limite de 100 arquivos por vez | Insuficiente para 5 anos de histórico |
| Processamento sequencial | Timeout em lotes grandes |
| Progresso geral apenas | Usuário não sabe qual arquivo está processando |
| Sem estimativa de tempo | Incerteza sobre duração |
| Resumo básico | Só mostra total/erros, sem análise de período |
| Sem suporte a ZIP | Usuário precisa extrair manualmente |

---

## 2. Melhorias Propostas

### 2.1 Capacidade Ampliada

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    ANTES          →          DEPOIS                  │
├─────────────────────────────────────────────────────────────────────┤
│  100 arquivos/vez              →    1.000 arquivos/vez              │
│  Apenas .xml                   →    .xml + .zip (extração auto)     │
│  Barra única                   →    Progresso por fase              │
│  Sem tempo estimado            →    ETA calculado dinamicamente     │
│  Lista simples de arquivos     →    Agrupamento por ano/período     │
│  Resumo: X processados         →    Resumo completo com insights    │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Processamento em Lotes (Chunked)

```text
┌────────────────────────────────────────────────────────────────────┐
│                      FLUXO DE PROCESSAMENTO                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Arquivos      Lotes de 20       Edge Function       Resultado    │
│   Selecionados  ───────────►    process-xml-batch   ───────────►   │
│   (500 XMLs)    25 chamadas      (paralelas 5x)       Consolidado  │
│                                                                     │
│   FASE 1: Upload Storage (25%)                                      │
│   FASE 2: Processamento (60%)                                       │
│   FASE 3: Análise de Créditos (15%)                                │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Nova Interface do Importador

### 3.1 Barra de Progresso Aprimorada

**Elementos visuais:**
- Indicador de fase atual (Upload / Processamento / Análise)
- Barra de progresso principal com porcentagem
- Contador de arquivos: "Processando 127/500"
- Tempo estimado restante: "~3 min restantes"
- Arquivo atual sendo processado
- Velocidade média: "~8 arquivos/seg"

### 3.2 Agrupamento por Período

**Antes do processamento:**
```text
┌──────────────────────────────────────────────────────────┐
│  📁 Arquivos por Ano                                      │
├──────────────────────────────────────────────────────────┤
│  ▸ 2024 (142 arquivos)         ████████████░░░ 28%       │
│  ▸ 2023 (156 arquivos)         ██████████████░ 31%       │
│  ▸ 2022 (98 arquivos)          ███████░░░░░░░░ 20%       │
│  ▸ 2021 (67 arquivos)          ████░░░░░░░░░░░ 13%       │
│  ▸ 2020 (37 arquivos)          ██░░░░░░░░░░░░░  8%       │
│                                                          │
│  Total: 500 arquivos • ~12 MB                            │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Resumo Detalhado Pós-Importação

**Componente de Resumo (novo):**

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    RESUMO DA IMPORTAÇÃO                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✅ 487 processados    ❌ 13 com erro    ⏱️ 4min 23s                │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📊 ESTATÍSTICAS POR PERÍODO                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Ano   │ Notas │ Valor Total  │ Tributos Atuais │ Com Reforma  │ │
│  ├────────┼───────┼──────────────┼─────────────────┼──────────────┤ │
│  │  2024  │  142  │ R$ 2.3M      │ R$ 310K         │ R$ 285K ↓    │ │
│  │  2023  │  156  │ R$ 2.8M      │ R$ 378K         │ R$ 352K ↓    │ │
│  │  2022  │   98  │ R$ 1.9M      │ R$ 256K         │ R$ 271K ↑    │ │
│  │  2021  │   67  │ R$ 1.2M      │ R$ 162K         │ R$ 158K ↓    │ │
│  │  2020  │   37  │ R$ 0.8M      │ R$ 108K         │ R$ 112K ↑    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  💰 CRÉDITOS IDENTIFICADOS                                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  PIS/COFINS sobre frete        R$ 45.200    Alta confiança     │ │
│  │  ICMS energia industrial       R$ 28.900    Média confiança    │ │
│  │  IPI ativo imobilizado         R$ 12.500    Alta confiança     │ │
│  │                                ─────────                        │ │
│  │  TOTAL POTENCIAL              R$ 86.600                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  📈 TOP 5 FORNECEDORES                                               │
│  1. Distribuidora ABC Ltda (87 notas - R$ 1.2M)                     │
│  2. Indústria XYZ S/A (56 notas - R$ 890K)                          │
│  3. Transportes Rápido (43 notas - R$ 320K)                         │
│  ...                                                                 │
│                                                                      │
│  ❌ ERROS ENCONTRADOS                                                │
│  • 5 arquivos com estrutura XML inválida                            │
│  • 3 arquivos com chave NFe duplicada                               │
│  • 5 arquivos sem dados de emitente                                 │
│                                                                      │
│  [ Ver Detalhes ]  [ Baixar Relatório PDF ]  [ Ir para Resultados ] │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Arquitetura Técnica

### 4.1 Processamento em Chunks

```typescript
// Estratégia de processamento
const CHUNK_SIZE = 20;        // Arquivos por lote
const PARALLEL_CHUNKS = 5;    // Lotes simultâneos
const MAX_FILES = 1000;       // Limite total

// Fases do processamento
enum ProcessingPhase {
  PREPARING = 'preparing',     // Validação e agrupamento
  UPLOADING = 'uploading',     // Upload para Storage
  PROCESSING = 'processing',   // Parsing e cálculo
  ANALYZING = 'analyzing',     // Análise de créditos
  COMPLETE = 'complete'
}
```

### 4.2 Interface de Estado do Progresso

```typescript
interface ImportProgress {
  phase: ProcessingPhase;
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  errorCount: number;
  currentFile?: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
  bytesUploaded: number;
  totalBytes: number;
}

interface ImportSummary {
  // Estatísticas gerais
  totalProcessed: number;
  totalErrors: number;
  processingTimeMs: number;
  
  // Por período
  byYear: {
    year: number;
    count: number;
    totalValue: number;
    currentTaxes: number;
    reformTaxes: number;
  }[];
  
  // Por tipo de documento
  byType: {
    type: 'NFe' | 'NFSe' | 'CTe';
    count: number;
    totalValue: number;
  }[];
  
  // Top fornecedores
  topSuppliers: {
    name: string;
    cnpj: string;
    notesCount: number;
    totalValue: number;
  }[];
  
  // Créditos identificados
  creditsFound: {
    category: string;
    potential: number;
    confidence: 'high' | 'medium' | 'low';
  }[];
  
  // Erros detalhados
  errors: {
    fileName: string;
    errorType: string;
    message: string;
  }[];
}
```

---

## 5. Componentes a Criar/Modificar

### 5.1 Novos Componentes

| Componente | Descrição |
|------------|-----------|
| `ImportProgressBar.tsx` | Barra de progresso com fases e ETA |
| `ImportSummaryCard.tsx` | Card de resumo pós-importação |
| `ImportFilesByYear.tsx` | Agrupamento visual por ano |
| `ImportErrorsList.tsx` | Lista detalhada de erros |

### 5.2 Modificações

| Arquivo | Mudanças |
|---------|----------|
| `ImportarXML.tsx` | Novo limite 1000, chunks, estados de fase |
| `process-xml-batch/index.ts` | Retornar metadados para resumo |

---

## 6. Fluxo de Usuário Atualizado

```text
1. UPLOAD
   └─► Usuário arrasta pasta com XMLs históricos
   └─► Sistema detecta arquivos .xml e .zip
   └─► Mostra preview agrupado por ano
   
2. VALIDAÇÃO
   └─► Verifica duplicatas (chaves NFe já processadas)
   └─► Mostra total de arquivos novos vs existentes
   └─► Usuário confirma para iniciar
   
3. PROCESSAMENTO
   └─► Fase 1: Upload para Storage (barra 0-25%)
   └─► Fase 2: Processamento em lotes (barra 25-85%)
       └─► Mostra arquivo atual
       └─► Atualiza contador e ETA
   └─► Fase 3: Análise de créditos (barra 85-100%)
   
4. RESUMO
   └─► Exibe dashboard completo
   └─► Estatísticas por ano
   └─► Créditos identificados
   └─► Lista de erros (se houver)
   └─► Botões: Ver Resultados / Baixar PDF
```

---

## 7. Estimativas de Tempo

| Lote | Arquivos | Tempo Estimado |
|------|----------|----------------|
| Pequeno | 100 | ~30 segundos |
| Médio | 250 | ~1 minuto |
| Grande | 500 | ~2-3 minutos |
| Muito Grande | 1000 | ~5-6 minutos |

---

## 8. Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/xml/ImportProgressBar.tsx` | CRIAR | Componente de progresso com fases |
| `src/components/xml/ImportSummaryCard.tsx` | CRIAR | Resumo detalhado pós-importação |
| `src/components/xml/ImportFilesByYear.tsx` | CRIAR | Agrupamento de arquivos por ano |
| `src/components/xml/ImportErrorsList.tsx` | CRIAR | Lista de erros com detalhes |
| `src/pages/ImportarXML.tsx` | MODIFICAR | Integrar novos componentes e lógica de chunks |
| `supabase/functions/process-xml-batch/index.ts` | MODIFICAR | Adicionar metadados ao retorno |

---

## 9. Seção Técnica

### Algoritmo de Processamento em Chunks

```typescript
async function processInChunks(files: FileItem[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < files.length; i += chunkSize) {
    chunks.push(files.slice(i, i + chunkSize));
  }
  
  let processed = 0;
  const startTime = Date.now();
  
  // Processar 5 chunks em paralelo
  for (let i = 0; i < chunks.length; i += 5) {
    const parallelChunks = chunks.slice(i, i + 5);
    
    await Promise.all(
      parallelChunks.map(async (chunk) => {
        // Upload e processar chunk
        const importIds = await uploadChunk(chunk);
        await processChunk(importIds);
        
        processed += chunk.length;
        updateProgress({
          processedFiles: processed,
          estimatedTimeRemaining: calculateETA(startTime, processed, files.length)
        });
      })
    );
  }
}

function calculateETA(startTime: number, processed: number, total: number): number {
  const elapsed = Date.now() - startTime;
  const rate = processed / elapsed; // arquivos por ms
  const remaining = total - processed;
  return remaining / rate; // ms restantes
}
```

### Estrutura de Retorno da Edge Function

```typescript
// Resposta atual expandida
{
  success: true,
  processed: 20,
  errors: 2,
  results: [...],
  errorDetails: [...],
  
  // NOVOS CAMPOS
  metadata: {
    processingTimeMs: 1234,
    byYear: {
      "2024": { count: 8, totalValue: 125000, taxes: 12500 },
      "2023": { count: 12, totalValue: 180000, taxes: 18000 }
    },
    byType: {
      "NFe": { count: 18, totalValue: 280000 },
      "CTe": { count: 2, totalValue: 25000 }
    },
    suppliers: [
      { cnpj: "12345678000190", name: "Empresa ABC", count: 5, total: 50000 }
    ]
  },
  creditAnalysis: {
    creditsFound: 12,
    totalPotential: 45200,
    byCategory: [
      { category: "PIS/COFINS", potential: 28000, count: 8 },
      { category: "ICMS", potential: 17200, count: 4 }
    ]
  }
}
```

### Cálculo de Agrupamento por Ano

```typescript
function groupFilesByYear(files: FileItem[]): Map<number, FileItem[]> {
  const groups = new Map<number, FileItem[]>();
  
  for (const file of files) {
    // Tentar extrair ano do nome do arquivo ou metadata
    const yearMatch = file.file.name.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    
    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year)!.push(file);
  }
  
  return groups;
}
```

