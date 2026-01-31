

# Plano: Rotação Diária das Pílulas da Reforma

## Problema Identificado

| Campo | Situação Atual |
|-------|----------------|
| Pílulas cadastradas | 5 (todas ativas) |
| `data_exibicao` | Todas com valor `null` |
| Comportamento | Sempre mostra a mesma pílula |

A lógica atual busca pílulas onde `data_exibicao = hoje` ou `data_exibicao = null`, mas como nenhuma tem data específica e o `limit(1)` sempre retorna a primeira da query, não há rotação.

## Solução Proposta: Rotação Automática por Dia

Usar o **dia do ano** para criar uma rotação automática entre as pílulas disponíveis, sem precisar agendar cada uma manualmente.

### Lógica de Rotação

```typescript
// Calcular dia do ano (1-365)
const dayOfYear = Math.floor(
  (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
);

// Índice baseado no dia, ciclando entre as pílulas disponíveis
const pilulas = [...]; // todas as pílulas ativas
const indice = dayOfYear % pilulas.length;
const pilulaDoDia = pilulas[indice];
```

### Prioridade de Exibição

1. **Primeiro**: Pílula com `data_exibicao = hoje` (agendamento manual)
2. **Segundo**: Rotação automática entre pílulas com `data_exibicao = null`

## Alterações Técnicas

### Arquivo: `src/pages/NoticiasReforma.tsx`

```typescript
// ANTES (linhas 160-181)
const today = new Date().toISOString().split('T')[0];
const { data: pilulas } = await supabase
  .from('pilulas_reforma')
  .select('*')
  .eq('ativo', true)
  .or(`data_exibicao.eq.${today},data_exibicao.is.null`)
  .limit(1);

// DEPOIS
const today = new Date().toISOString().split('T')[0];

// 1. Verificar se há pílula agendada para hoje
const { data: agendada } = await supabase
  .from('pilulas_reforma')
  .select('*')
  .eq('ativo', true)
  .eq('data_exibicao', today)
  .limit(1);

if (agendada && agendada.length > 0) {
  setPilulaDoDia(agendada[0]);
} else {
  // 2. Rotação automática entre pílulas sem data específica
  const { data: pilulas } = await supabase
    .from('pilulas_reforma')
    .select('*')
    .eq('ativo', true)
    .is('data_exibicao', null)
    .order('created_at', { ascending: true });

  if (pilulas && pilulas.length > 0) {
    // Calcular dia do ano para rotação
    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (Date.now() - startOfYear.getTime()) / 86400000
    );
    const indice = dayOfYear % pilulas.length;
    setPilulaDoDia(pilulas[indice]);
  }
}
```

## Resultado Esperado

| Dia do Ano | Pílula Exibida (5 cadastradas) |
|------------|-------------------------------|
| 1, 6, 11... | CBS substitui PIS/COFINS |
| 2, 7, 12... | Split Payment obrigatório |
| 3, 8, 13... | Crédito amplo e imediato |
| 4, 9, 14... | Transição até 2033 |
| 5, 10, 15... | Imposto Seletivo |

## Benefícios

- **Rotação automática**: Uma pílula diferente a cada dia
- **Agendamento opcional**: Admin pode forçar pílula específica em data específica
- **Zero configuração**: Funciona automaticamente com as pílulas existentes
- **Ciclo contínuo**: Quando acabar, volta do início

