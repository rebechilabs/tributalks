
# Plano: Preencher DRE Automaticamente com Dados do Conta Azul

## Resumo

Você quer que os dados sincronizados do Conta Azul preencham automaticamente o formulário DRE Inteligente. Identifiquei que há dois problemas bloqueando a sincronização que precisam ser resolvidos primeiro, e depois implementaremos o preenchimento automático do DRE.

## Problemas Identificados na Sincronização

Analisando os logs de sincronização recentes, encontrei dois erros:

1. **NF-e**: A API do Conta Azul exige período máximo de 15 dias entre datas (`data_competencia_de` e `data_competencia_ate`)
   - Atualmente: 90 dias de busca (causa erro 400)
   - Solução: Fazer múltiplas requisições em janelas de 15 dias

2. **Financeiro → DRE**: Erro de constraint no upsert do `company_dre`
   - Causa: Falta de unique constraint na combinação `user_id, period_type, period_year, period_month`
   - Solução: Adicionar constraint no banco

## Etapas de Implementação

### Etapa 1: Corrigir Sincronização da API Conta Azul

**1.1 - Corrigir busca de NF-e (período de 15 dias)**

Modificar `syncNFe` no adapter ContaAzul para buscar em janelas de 15 dias:

- Dividir período de 90 dias em 6 requisições de 15 dias cada
- Acumular resultados de todas as janelas
- Respeitar rate limiting entre chamadas

**1.2 - Corrigir busca Financeira**

Verificar se o mesmo limite se aplica aos endpoints financeiros e ajustar se necessário.

### Etapa 2: Corrigir Constraint do Banco de Dados

Criar migration para adicionar unique constraint na tabela `company_dre`:

```sql
ALTER TABLE company_dre 
ADD CONSTRAINT company_dre_user_period_unique 
UNIQUE (user_id, period_type, period_year, period_month);
```

### Etapa 3: Melhorar Mapeamento Financeiro → DRE

Atualmente os dados financeiros são mapeados de forma genérica (60% custos, 20% salários, 20% outras). Melhorar para:

- Categorizar receitas: vendas produtos vs serviços (baseado em tipo de nota)
- Categorizar despesas: usar categorias do Conta Azul quando disponíveis
- Separar custos operacionais de custos de vendas

### Etapa 4: Implementar Auto-Preenchimento no DRE Wizard

**4.1 - Criar hook `useERPDREData`**

Hook que busca dados sincronizados do ERP para o período selecionado:

- Verifica se há conexão ERP ativa
- Busca último DRE criado via sync para o mês/ano selecionado
- Retorna dados formatados para o formulário

**4.2 - Modificar `DREWizard.tsx`**

Adicionar:
- Detecção de conexão ERP ativa
- Botão/banner para "Preencher com dados do Conta Azul"
- Preview dos valores antes de aplicar
- Mesclagem inteligente (mantém valores já editados manualmente)

**4.3 - UX do Auto-Preenchimento**

Quando o usuário acessa o DRE Wizard:

```text
┌──────────────────────────────────────────────────────────────┐
│  🔗 Conta Azul Conectado                                     │
│                                                              │
│  Encontramos dados financeiros do seu ERP para Jan/2026:     │
│  • Receitas: R$ 150.000                                     │
│  • Despesas: R$ 80.000                                      │
│                                                              │
│  [Preencher Automaticamente]    [Continuar Manualmente]      │
└──────────────────────────────────────────────────────────────┘
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/erp-sync/index.ts` | Corrigir janelas de 15 dias, melhorar categorização |
| `src/components/dre/DREWizard.tsx` | Adicionar detecção ERP e botão de auto-preenchimento |
| `src/hooks/useERPDREData.ts` | Novo hook para buscar dados ERP para DRE |
| Migration SQL | Adicionar unique constraint em company_dre |

## Detalhes Técnicos

### Lógica de Janelas de 15 Dias (NF-e)

```typescript
// Dividir 90 dias em janelas de 15 dias
const windows: Array<{start: string, end: string}> = [];
let currentStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
const finalEnd = new Date();

while (currentStart < finalEnd) {
  const windowEnd = new Date(Math.min(
    currentStart.getTime() + 15 * 24 * 60 * 60 * 1000,
    finalEnd.getTime()
  ));
  windows.push({
    start: currentStart.toISOString().split('T')[0],
    end: windowEnd.toISOString().split('T')[0]
  });
  currentStart = windowEnd;
}
```

### Mapeamento Categorias Conta Azul → DRE

| Conta Azul | Campo DRE |
|------------|-----------|
| `receita` / `contas_a_receber` | `vendas_produtos` ou `vendas_servicos` |
| `despesa` / Aluguel | `aluguel` |
| `despesa` / Folha | `salarios_encargos` |
| `despesa` / Marketing | `marketing` |
| `despesa` / Outras | `outras_despesas` |

## Resultado Esperado

1. ✅ Sincronização do Conta Azul funcionando sem erros
2. ✅ Dados financeiros salvos corretamente no `company_dre`
3. ✅ DRE Wizard detecta dados disponíveis do ERP
4. ✅ Usuário pode preencher automaticamente com 1 clique
5. ✅ Valores podem ser ajustados manualmente após auto-preenchimento

## Observações

- Os valores importados são estimativas baseadas nos lançamentos financeiros
- Recomendamos que o usuário revise os valores antes de calcular
- Dados como pró-labore e despesas específicas podem precisar de ajuste manual (ERP nem sempre categoriza)
