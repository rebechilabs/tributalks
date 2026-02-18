
# Correcao dos Calculos da DRE Inteligente

## Diagnostico (confirmado via logs e codigo)

### Problema 3 - "Erro ao processar DRE" (CONFIRMADO nos logs)
O erro real e:
```
duplicate key value violates unique constraint "company_dre_user_period_unique"
```
Quando o usuario ja tem uma DRE salva para o mesmo periodo (ex: Fev/2026), a edge function tenta fazer INSERT e falha. O UPDATE so e usado quando `dre_id` e passado, mas o frontend nunca passa `dre_id`.

### Problema 1 e 2 - Resumo mostrando R$ 0,00
O componente `VoiceCurrencyInput` usa `useState` com inicializador que so roda uma vez. Quando o componente recebe um novo `value` do pai (ex: apos aplicar dados do ERP, ou apos reset), o `localValue` interno nao atualiza. Alem disso, se o componente for remontado por qualquer razao, o estado local reseta para vazio mesmo que o `formData` pai tenha valores.

Adicionaremos um `useEffect` para sincronizar o valor do pai com o estado local quando o valor muda externamente.

### Problema adicional - Metodo `getClaims` potencialmente instavel
A edge function usa `supabaseUser.auth.getClaims(token)` que nao e um metodo padrao do Supabase JS v2. Trocaremos por `supabaseUser.auth.getUser()` que e o metodo confiavel.

---

## Plano de Correcao

### 1. Edge Function `process-dre/index.ts`

**a) Trocar INSERT por UPSERT**
Na secao de salvamento (linhas 202-223), quando nao ha `dre_id`, usar `upsert` com `onConflict` na constraint `company_dre_user_period_unique` em vez de `insert`. Isso resolve o erro de chave duplicada.

**b) Trocar `getClaims` por `getUser`**
Linha 89: substituir `supabaseUser.auth.getClaims(token)` por `supabaseUser.auth.getUser()` e extrair o `userId` de `data.user.id`.

### 2. Componente `VoiceCurrencyInput.tsx`

Adicionar um `useEffect` que sincroniza o `localValue` quando o `value` prop muda externamente (e o campo nao esta focado). Isso garante que:
- Valores aplicados do ERP aparecem corretamente
- Reset do formulario limpa os campos visuais
- O resumo reflete os valores corretos

### 3. Reimplantar a edge function

Apos as alteracoes, reimplantar `process-dre`.

---

## Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `supabase/functions/process-dre/index.ts` | UPSERT + fix auth |
| `src/components/dre/VoiceCurrencyInput.tsx` | Sync de valor externo via useEffect |

## O que NAO sera alterado
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Nenhum outro modulo
