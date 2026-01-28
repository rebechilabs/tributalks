

# Plano: Atualização do Catálogo de Oportunidades Tributárias (2026)

## Contexto

O usuário forneceu um documento atualizado de janeiro/2026 com mudanças significativas no cenário tributário brasileiro, especialmente em relação à LC 224/2025 e à implementação futura da Reforma Tributária (CBS/IBS). Este plano visa atualizar o sistema para refletir essas mudanças.

---

## Resumo das Alterações

### Novas Informações a Serem Armazenadas

O documento traz **dois novos eixos de informação** que não existem na estrutura atual:

1. **Status 2026 (LC 224/2025)**
   - Indica se o benefício foi afetado pelo corte de 10%
   - Status: `PROTEGIDO`, `AFETADO`, `CRÍTICO`, ou sem mudança

2. **Futuro com a Reforma (Pós-2027)**
   - O que acontecerá quando CBS/IBS entrarem em vigor
   - Status: `MANTIDO`, `EXTINTO`, `SUBSTITUÍDO`, `EM_ADAPTACAO`

---

## Escopo Técnico

### 1. Alteração no Schema da Tabela `tax_opportunities`

Adicionar 4 novas colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `status_lc_224_2025` | `text` | Status em relação à LC 224/2025: `protegido`, `afetado`, `critico`, `neutro` |
| `descricao_lc_224_2025` | `text` | Descrição do impacto em 2026 |
| `futuro_reforma` | `text` | Status pós-reforma: `mantido`, `extinto`, `substituido`, `em_adaptacao` |
| `descricao_reforma` | `text` | Explicação do que acontece com a Reforma |

### 2. Atualização dos Registros Existentes

Atualizar as oportunidades existentes com as novas informações do documento:

**Incentivos a P&D:**
- `INCENT_001` (Lei do Bem): `protegido` / `mantido`
- `INCENT_002` (Lei de Informática): `afetado` / `extinto`
- `INCENT_003` (SUDENE/SUDAM): `parcialmente_protegido` / `mantido`

**Créditos e Exportação:**
- `EXPORT_002` (Créditos PIS/COFINS): `neutro` / `substituido`
- `EXPORT_003` (REINTEGRA): `neutro` / `extinto`

**Monofásicos (8 registros):** `critico` / `extinto`

**Regimes Especiais (por tipo):**
- Lucro Presumido: `critico` / marcar como `inviavel_futuro`
- Simples Nacional: `protegido` / `em_adaptacao`
- ISS Fixo (Advogados): marcar como `extinto` gradualmente até 2033

**Setoriais:**
- RET Construção: `neutro` / `em_adaptacao`
- Equiparação Hospitalar: `neutro` / `mantido`
- Drawback/RECOF: `neutro` / `em_adaptacao`

### 3. Inserir Novas Oportunidades

Criar registros para oportunidades mencionadas no documento mas ausentes no banco:

| Código | Nome | Categoria |
|--------|------|-----------|
| `INCENT_004` | MOVER / Rota 2030 | incentivo |
| `EXPORT_004` | Drawback | credito |
| `EXPORT_005` | RECOF | credito |
| `REGIME_019` | ISS Fixo Sociedade de Advogados | regime_especial |
| `SOLAR_006` | Isenção PIS/COFINS Equipamentos Solares | isencao |

### 4. Atualização da Interface `OpportunityDetailCard`

Adicionar exibição visual do status futuro:

- Badge com ícone de status: ✅ Mantido | 🔴 Extinto | ⚠️ Em Adaptação
- Tooltip ou expandable com explicação

### 5. Atualização do PDF de Oportunidades

Incluir nova seção "Tabela Resumo: Futuro das Oportunidades" conforme o documento original.

### 6. Atualização do Modal de Detalhes

Adicionar seção com:
- **Atualização 2026:** O que mudou com a LC 224/2025
- **Futuro Pós-2027:** O que acontece com a Reforma Tributária

---

## Sequência de Implementação

```text
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: SCHEMA                                                  │
│  Adicionar 4 novas colunas na tabela tax_opportunities          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 2: DADOS                                                   │
│  a) Atualizar oportunidades existentes com status 2026/reforma  │
│  b) Inserir novas oportunidades (MOVER, Drawback, ISS Fixo)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 3: INTERFACE                                               │
│  a) Atualizar OpportunityDetailCard com badges de status        │
│  b) Atualizar OpportunityDetailModal com seções LC/Reforma      │
│  c) Atualizar tipos TypeScript para incluir novos campos        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 4: DOCUMENTAÇÃO                                            │
│  Atualizar OpportunitiesDocPdf com tabela-resumo do futuro      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detalhes Técnicos

### SQL de Migração (Schema)

```sql
ALTER TABLE tax_opportunities 
ADD COLUMN IF NOT EXISTS status_lc_224_2025 text DEFAULT 'neutro',
ADD COLUMN IF NOT EXISTS descricao_lc_224_2025 text,
ADD COLUMN IF NOT EXISTS futuro_reforma text DEFAULT 'em_analise',
ADD COLUMN IF NOT EXISTS descricao_reforma text;

COMMENT ON COLUMN tax_opportunities.status_lc_224_2025 IS 
  'Status após LC 224/2025: protegido, afetado, critico, neutro';
COMMENT ON COLUMN tax_opportunities.futuro_reforma IS 
  'Status pós-reforma: mantido, extinto, substituido, em_adaptacao';
```

### Atualizações de Dados Principais

**Lei do Bem (INCENT_001):**
```sql
UPDATE tax_opportunities SET
  status_lc_224_2025 = 'protegido',
  descricao_lc_224_2025 = 'A Lei do Bem não foi afetada pelo corte de 10% da LC 224/2025.',
  futuro_reforma = 'mantido',
  descricao_reforma = 'Por ser benefício de IRPJ/CSLL, não é afetada pela CBS/IBS.'
WHERE code = 'INCENT_001';
```

**Lei de Informática (INCENT_002):**
```sql
UPDATE tax_opportunities SET
  status_lc_224_2025 = 'afetado',
  descricao_lc_224_2025 = 'Pode sofrer corte adicional de 10% no IPI.',
  futuro_reforma = 'extinto',
  descricao_reforma = 'O IPI será extinto com a Reforma. A Lei de Informática deixará de existir.'
WHERE code = 'INCENT_002';
```

**Monofásicos (8 registros):**
```sql
UPDATE tax_opportunities SET
  status_lc_224_2025 = 'critico',
  descricao_lc_224_2025 = 'Oportunidade urgente: recuperação de valores dos últimos 5 anos.',
  futuro_reforma = 'extinto',
  descricao_reforma = 'O regime monofásico será extinto com a CBS. Janela de recuperação se fechando.'
WHERE category = 'monofasico';
```

### Novos Componentes React

**Badge de Status Reforma:**
```tsx
const REFORMA_STATUS = {
  mantido: { icon: '✅', label: 'Mantido', color: 'text-green-600' },
  extinto: { icon: '🔴', label: 'Extinto Gradualmente', color: 'text-red-500' },
  substituido: { icon: '🔄', label: 'Substituído', color: 'text-yellow-600' },
  em_adaptacao: { icon: '⚠️', label: 'Em Adaptação', color: 'text-orange-500' }
};
```

---

## Arquivos a Serem Modificados

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| `supabase/migrations/` | Nova migration para schema |
| `src/components/opportunities/OpportunityDetailCard.tsx` | Adicionar badge de status reforma |
| `src/components/opportunities/OpportunityDetailModal.tsx` | Adicionar seções LC 224 e Reforma |
| `src/pages/Oportunidades.tsx` | Atualizar interface para novos campos |
| `src/components/docs/OpportunitiesDocPdf.tsx` | Adicionar tabela-resumo do futuro |
| `supabase/functions/match-opportunities/index.ts` | Retornar novos campos no response |

---

## Resultado Esperado

Após a implementação:

1. **Usuários verão** indicadores visuais claros sobre o futuro de cada oportunidade
2. **O PDF** incluirá a tabela-resumo do documento original
3. **O sistema** estará atualizado para janeiro/2026 com as mudanças da LC 224/2025
4. **O matching** continuará funcionando normalmente, agora com informações de transição
5. **Clara AI** poderá referenciar o status de cada oportunidade em suas respostas

