

# Plano: Adicionar Faixas de Faturamento Menores

## Contexto

Atualmente, as faixas de faturamento mensal no perfil começam em **R$1M/mês**, excluindo empresas com faturamento menor.

**Faixas atuais:**
- R$1M - R$2,5M/mês
- R$2,5M - R$5M/mês
- R$5M - R$10M/mês
- R$10M - R$25M/mês
- R$25M - R$50M/mês
- Acima de R$50M/mês

## Alteração Proposta

**Arquivo:** `src/pages/Perfil.tsx`

Adicionar 2 novas faixas no início da lista:

```typescript
const FAIXAS_FATURAMENTO = [
  { value: '200000', label: 'R$200K - R$500K/mês' },   // NOVA
  { value: '500000', label: 'R$500K - R$1M/mês' },     // NOVA
  { value: '1000000', label: 'R$1M - R$2,5M/mês' },
  { value: '2500000', label: 'R$2,5M - R$5M/mês' },
  { value: '5000000', label: 'R$5M - R$10M/mês' },
  { value: '10000000', label: 'R$10M - R$25M/mês' },
  { value: '25000000', label: 'R$25M - R$50M/mês' },
  { value: '50000000', label: 'Acima de R$50M/mês' },
];
```

## Resultado Esperado

- Empresas com faturamento entre R$200K e R$1M poderão selecionar sua faixa correta
- Seleções existentes de usuários continuam funcionando normalmente
- O dropdown mostrará 8 opções em vez de 6

