

# Tarefa 1: Card Resumo Executivo no Dashboard

## Objetivo
Criar um card compacto que responda às 3 perguntas do CEO/CFO:
1. **"Quanto posso economizar?"** → Caixa em Jogo
2. **"Qual meu risco?"** → Nível de Risco
3. **"Como estou?"** → Score Tributário

Este card funciona como um "semáforo executivo" que dá visibilidade imediata da situação tributária.

---

## Posicionamento no Dashboard

```text
┌─────────────────────────────────────────────────────────┐
│  Dashboard                                              │
├─────────────────────────────────────────────────────────┤
│  [Olá, João 👋]                                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Clara Card (existente)                          │   │
│  │  "Por onde eu começo?" + Quick Questions         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  🆕 RESUMO EXECUTIVO (novo componente)           │   │
│  │                                                  │   │
│  │  💰 Caixa em Jogo    ⚠️ Risco      📊 Score     │   │
│  │  R$ 15k - R$ 25k     🟡 Médio      B (720 pts)  │   │
│  │                                                  │   │
│  │  [Ver Painel Executivo →]                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [GPS da Reforma - Notícias | Timeline]                │
│  [Calculadoras | Diagnóstico | IA e Suporte]           │
└─────────────────────────────────────────────────────────┘
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/ExecutiveSummaryCard.tsx` | **CRIAR** - Novo componente |
| `src/pages/Dashboard.tsx` | **MODIFICAR** - Importar e posicionar o card |

---

## Design do Componente

### Estados do Card

1. **Com dados completos**: Mostra as 3 métricas + CTA
2. **Com dados parciais**: Mostra métricas disponíveis + links para completar
3. **Sem dados**: Mostra estado vazio com CTA para iniciar jornada

### Visual

- Borda colorida baseada no Score (verde/amarelo/vermelho)
- Layout horizontal em 3 colunas (desktop) / vertical (mobile)
- Ícones com cores semânticas (verde = bom, amarelo = atenção, vermelho = crítico)
- Botão "Ver Painel Executivo" visível apenas para planos Professional+

---

## Especificação Técnica

### Props do Componente

```typescript
interface ExecutiveSummaryCardProps {
  thermometerData: ThermometerData | null;
  loading?: boolean;
  userPlan: string;
}
```

### Dados Utilizados

Reutilizaremos o hook `useExecutiveData` que já existe e fornece:
- `scoreGrade` / `scoreTotal` → Nota do Score
- `caixaPotencialMin` / `caixaPotencialMax` → Economia potencial
- `riscoNivel` → Baixo/Médio/Alto

### Lógica de Cores

| Score | Cor da Borda | Semáforo |
|-------|--------------|----------|
| A+/A/B | Verde (emerald) | 🟢 |
| C | Amarelo | 🟡 |
| D/E | Vermelho | 🔴 |

### Acesso ao Painel Executivo

- Plano FREE/NAVIGATOR: Botão desabilitado com "Upgrade para Professional"
- Plano PROFESSIONAL+: Botão ativo "Ver Painel Executivo"

---

## Fluxo de Implementação

### Passo 1: Criar ExecutiveSummaryCard.tsx
- Componente com layout responsivo (grid 3 colunas)
- Integração com dados do `useExecutiveData`
- Estados de loading e vazio
- Cores dinâmicas baseadas no score

### Passo 2: Modificar Dashboard.tsx
- Importar o novo componente
- Adicionar chamada ao `useExecutiveData`
- Posicionar entre ClaraCard e GPS da Reforma
- Verificar permissão de plano para CTA

---

## Resultado Esperado

Após implementação:
- CEO/CFO verá imediatamente sua situação tributária
- 3 métricas-chave visíveis sem scroll
- Caminho claro para aprofundar no Painel Executivo
- Usuários sem dados receberão orientação para iniciar jornada

---

## Métricas de Sucesso

- Aumento de cliques no Painel Executivo
- Redução de tempo para primeira ação após login
- Aumento de upgrades FREE → PROFESSIONAL (exposição do valor)

