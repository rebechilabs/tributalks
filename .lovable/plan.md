
# Dados Compartilhados Entre Ferramentas por CNPJ

## Problema

Hoje cada ferramenta busca dados de forma isolada. O usuario preenche faturamento, folha de pagamento e regime na DRE, mas precisa digitar tudo novamente no Comparativo de Regimes e no Radar de Creditos.

## Solucao

Usar a tabela `company_profile` (que ja possui campos como `faturamento_anual`, `folha_mensal`, `regime_tributario`, `cnae_principal`) como hub central de dados compartilhados. Quando a DRE for salva, os dados-chave serao gravados automaticamente no perfil da empresa. Todas as ferramentas consultam o perfil primeiro para pre-preencher campos.

## Mudancas necessarias

### 1. Adicionar colunas ao `company_profile` (migracao SQL)

Adicionar campos derivados da DRE que ainda nao existem:

- `receita_liquida_mensal` (numeric) — calculado pela DRE
- `margem_bruta_percentual` (numeric) — calculado pela DRE
- `compras_insumos_mensal` (numeric) — custo_mercadorias + custo_materiais da DRE
- `prolabore_mensal` (numeric) — pro-labore dos socios
- `dados_financeiros_origem` (text) — 'dre' | 'manual' | 'erp'
- `dados_financeiros_atualizados_em` (timestamptz) — quando foi atualizado

### 2. Atualizar Edge Function `process-dre/index.ts`

Apos salvar a DRE (linha ~222), adicionar bloco que atualiza o `company_profile` do usuario:

```
// Apos savedDre
await supabaseAdmin.from('company_profile').update({
  faturamento_anual: dre.receita_bruta * 12,
  faturamento_mensal_medio: dre.receita_bruta,
  folha_mensal: (inputs.salarios_encargos || 0) + (inputs.prolabore || 0),
  regime_tributario: inputs.regime_tributario,
  receita_liquida_mensal: dre.receita_liquida,
  margem_bruta_percentual: dre.margem_bruta,
  compras_insumos_mensal: (inputs.custo_mercadorias || 0) + (inputs.custo_materiais || 0),
  prolabore_mensal: inputs.prolabore || 0,
  dados_financeiros_origem: 'dre',
  dados_financeiros_atualizados_em: new Date().toISOString(),
}).eq('user_id', userId)
```

Se o usuario tiver multiplas empresas, usara `.limit(1)` na empresa ativa (ou primeira).

### 3. Criar hook `useSharedCompanyData`

Novo arquivo: `src/hooks/useSharedCompanyData.ts`

Hook que retorna dados financeiros da empresa ativa a partir do `CompanyContext`:

```typescript
interface SharedCompanyData {
  regime_tributario: string | null;
  faturamento_anual: number | null;
  folha_anual: number | null;        // folha_mensal * 12
  cnae_principal: string | null;
  setor: string | null;
  receita_liquida_mensal: number | null;
  margem_bruta_percentual: number | null;
  compras_insumos_anual: number | null; // compras_insumos_mensal * 12
  origem: string | null;              // 'dre' | 'manual' | 'erp'
  atualizado_em: string | null;
}
```

O hook buscara diretamente do `company_profile` via query (expandindo os campos ja carregados no CompanyContext).

### 4. Atualizar `CompanyContext.tsx`

Expandir a query SELECT para incluir os novos campos: `receita_liquida_mensal`, `margem_bruta_percentual`, `compras_insumos_mensal`, `prolabore_mensal`, `dados_financeiros_origem`, `dados_financeiros_atualizados_em`.

Atualizar a interface `Company` com esses campos opcionais.

### 5. Atualizar `ComparativoRegimesWizard.tsx`

Substituir a query direta ao `company_dre` pelo hook `useSharedCompanyData`:

- `faturamento_anual` pre-preenchido do perfil (se existir)
- `folha_pagamento` pre-preenchido do perfil
- `compras_insumos` pre-preenchido do perfil
- `cnae_principal` pre-preenchido do perfil

Adicionar badge visual nos campos pre-preenchidos:

```
<Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
  icone 📊 Importado da DRE
</Badge>
```

Campos continuam editaveis — apenas indicam a origem.

### 6. Atualizar `RegimeSelector.tsx` (Radar de Creditos)

Simplificar: usar `useSharedCompanyData` em vez de duas queries separadas (company_profile + company_dre). Mostrar badge "Do cadastro" ou "Importado da DRE" quando auto-detectado.

### 7. Componente visual `DataSourceBadge`

Novo componente reutilizavel: `src/components/common/DataSourceBadge.tsx`

Exibe badges como:
- "📊 Importado da DRE" (origem = 'dre')
- "👤 Do cadastro" (origem = 'manual')
- "🔗 Do ERP" (origem = 'erp')

Estilo: badge dourado/amarelo, pequeno, ao lado do label do campo.

## Fluxo de dados

```text
DRE Wizard (usuario preenche) 
  --> process-dre Edge Function (salva DRE + atualiza company_profile)
    --> company_profile (hub central)
      --> Comparativo de Regimes (le faturamento, folha, CNAE)
      --> Radar de Creditos (le regime tributario)
      --> Score Tributario (le regime, setor)
      --> Margem Ativa (le receita liquida, margem bruta)
```

## O que NAO muda

- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Tabelas existentes (apenas colunas novas adicionadas)
- Dados ja digitados pelo usuario (pre-preenchimento so ocorre em campos vazios)
- Backend de analise do Radar de Creditos

## Secao tecnica: Ordem de execucao

1. Migracao SQL: adicionar 6 colunas ao company_profile
2. Atualizar Edge Function process-dre para gravar dados compartilhados
3. Criar componente DataSourceBadge
4. Criar hook useSharedCompanyData
5. Atualizar CompanyContext (interface + query)
6. Atualizar ComparativoRegimesWizard (usar hook + badges)
7. Atualizar RegimeSelector (usar hook + badges)

Total: 1 migracao, 1 edge function editada, 2 novos arquivos, 4 arquivos editados
