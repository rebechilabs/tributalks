
# Plano: Corrigir Acesso e Limitador de Simulações

## Parte 1: Dar Acesso Total ao Usuário (Imediato)

Atualizar o plano do usuário `raphael@rebechisilva.com.br` para **ENTERPRISE**, garantindo acesso ilimitado a todas as funcionalidades.

**Ação via SQL:**
```sql
UPDATE profiles 
SET plano = 'ENTERPRISE', 
    subscription_status = 'active'
WHERE email = 'raphael@rebechisilva.com.br';
```

---

## Parte 2: Corrigir o Bug do Limitador (Evitar que aconteça novamente)

O limitador de simulações não está funcionando por dois motivos:

### Problema A: Calculadora não verifica limites
A página `SplitPayment.tsx` salva simulações diretamente sem usar o componente `FeatureGateLimit`.

**Solução:** 
- Criar um hook `useSimulationLimit` que busca a contagem de simulações do banco
- Envolver o formulário da calculadora com `FeatureGateLimit` passando a contagem

### Problema B: Hook retorna sempre usage = 0
O `useFeatureAccess.ts` tem um placeholder que não busca dados reais do banco.

**Solução:**
- Modificar o hook para opcionalmente receber o `usageCount` como parâmetro
- Ou criar um hook separado `useUsageCount(featureKey)` que busca do Supabase

---

## Detalhes Técnicos

### Arquivos a modificar:

1. **src/hooks/useSimulationLimit.ts** (novo)
   - Hook que busca contagem de simulações do mês para uma calculadora específica
   - Query: `SELECT COUNT(*) FROM simulations WHERE user_id = X AND calculator_slug = Y AND created_at >= início_do_mês`

2. **src/pages/calculadora/SplitPayment.tsx**
   - Importar `FeatureGateLimit` e `useSimulationLimit`
   - Buscar contagem com: `const { count } = useSimulationLimit('split-payment')`
   - Envolver o conteúdo principal com: `<FeatureGateLimit feature="split_payment" usageCount={count}>`

3. **src/pages/calculadora/ScoreTributario.tsx** (aplicar mesmo padrão)
   - Verificar se também precisa do limitador

---

## Resumo das Ações

| Prioridade | Ação | Impacto |
|------------|------|---------|
| Alta | Atualizar plano do Raphael para ENTERPRISE | Acesso imediato |
| Alta | Criar hook `useSimulationLimit` | Base para limitador |
| Alta | Aplicar `FeatureGateLimit` nas calculadoras | Corrige bug |
| Média | Revisar outras calculadoras | Consistência |
