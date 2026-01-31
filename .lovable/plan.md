

# Plano: Substituir Emojis por Ícones Lucide

## Resumo

Trocar todos os emojis usados no projeto por ícones SVG do Lucide React para manter consistência visual e melhorar a escalabilidade (ícones são configuráveis em tamanho/cor).

---

## Arquivos a Modificar

### 1. Landing Page (Alta Prioridade)

| Arquivo | Emojis Atuais | Ícones Lucide |
|---------|---------------|---------------|
| `JourneysSection.tsx` | 🎯 📊 🎛️ ⭐ 💡 | `Target`, `BarChart3`, `Gauge`, `Star`, `Lightbulb` |
| `HeroSection.tsx` | ⭐ 4.8/5 | `Star` (já usa parcialmente) |

### 2. Command Palette (Alta Prioridade)

| Arquivo | Emojis Atuais | Ícones Lucide |
|---------|---------------|---------------|
| `commandPaletteTools.ts` | 🎛️ 🔍 💼 📈 🔗 📊 📰 👥 ✅ 🧮 📄 🔄 🎯 💳 ⚖️ 📅 🏠 🤖 👤 🎁 ❓ | `Gauge`, `Search`, `Briefcase`, `TrendingUp`, `Link`, `BarChart3`, `Newspaper`, `Users`, `CheckSquare`, `Calculator`, `FileText`, `RefreshCw`, `Target`, `CreditCard`, `Scale`, `Calendar`, `Home`, `Bot`, `User`, `Gift`, `HelpCircle` |
| `CommandPalette.tsx` | Renderiza `tool.icon` como string | Renderiza como componente React |

### 3. Achievements (Média Prioridade)

| Arquivo | Emojis Atuais | Ícones Lucide |
|---------|---------------|---------------|
| `useAchievements.ts` | 🎯 ⭐ 📈 📄 📚 💰 💎 ✅ 🏅 👥 🔥 🌟 📊 🔍 | `Target`, `Star`, `TrendingUp`, `FileText`, `Library`, `DollarSign`, `Gem`, `CheckSquare`, `Medal`, `Users`, `Flame`, `Sparkles`, `BarChart3`, `Search` |
| `AchievementBadge.tsx` | Renderiza emoji como texto | Renderiza ícone como SVG |

### 4. DRE Wizard (Média Prioridade)

| Arquivo | Emojis Atuais | Ícones Lucide |
|---------|---------------|---------------|
| `DREWizard.tsx` | 🛒 📦 💼 🏦 🏛️ | `ShoppingCart`, `Package`, `Briefcase`, `Landmark`, `Building2` (já importa os ícones, só precisa remover `emoji`) |

### 5. Opportunity Detail Card (Baixa Prioridade)

| Arquivo | Emojis Atuais | Ícones Lucide |
|---------|---------------|---------------|
| `OpportunityDetailCard.tsx` | ✅ 🔴 🔄 ⚠️ 🔍 🛡️ 🚨 ➖ | `CheckCircle2`, `XCircle`, `RefreshCw`, `AlertTriangle`, `Search`, `Shield`, `AlertOctagon`, `Minus` |

### 6. Floating Assistant (Baixa Prioridade)

| Arquivo | Mudança |
|---------|---------|
| `FloatingAssistant.tsx` | Os emojis estão dentro de strings de texto (mensagens). Manter como texto é aceitável aqui, pois são mensagens dinâmicas de chat. **Opcional: deixar como está.** |

---

## Estratégia de Implementação

### Passo 1: Criar mapa de ícones centralizado

```typescript
// src/lib/iconMap.ts
import { Target, BarChart3, Gauge, ... } from "lucide-react";

export const ICON_MAP = {
  target: Target,
  barChart: BarChart3,
  gauge: Gauge,
  // ...
} as const;
```

### Passo 2: Atualizar `commandPaletteTools.ts`

Mudar o tipo de `icon: string` para `icon: keyof typeof ICON_MAP` e renderizar dinamicamente:

```typescript
// Antes
{ id: 'nexus', icon: '🎛️', ... }

// Depois  
{ id: 'nexus', icon: 'gauge', ... }
```

### Passo 3: Atualizar `CommandPalette.tsx`

```tsx
// Antes
<span className="text-xl">{tool.icon}</span>

// Depois
const IconComponent = ICON_MAP[tool.icon];
<IconComponent className="w-5 h-5 text-primary" />
```

### Passo 4: Atualizar `JourneysSection.tsx`

```tsx
// Antes
<div className="text-4xl mb-4">{journey.emoji}</div>

// Depois
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
  <journey.icon className="w-6 h-6 text-primary" />
</div>
```

### Passo 5: Atualizar `useAchievements.ts`

Mudar de emoji string para componente de ícone:

```typescript
// Antes
first_score: { icon: "🎯", ... }

// Depois
first_score: { icon: Target, ... }
```

### Passo 6: Atualizar `AchievementBadge.tsx`

Renderizar o ícone como componente React em vez de texto.

### Passo 7: Limpar `DREWizard.tsx`

Remover propriedade `emoji` dos steps (já usa `icon` corretamente).

### Passo 8: Atualizar `OpportunityDetailCard.tsx`

Substituir mapeamento de status com ícones Lucide.

---

## Detalhes Técnicos

### Mapeamento Completo de Emojis → Ícones

| Emoji | Nome Semântico | Ícone Lucide |
|-------|----------------|--------------|
| 🎯 | Target/Goal | `Target` |
| 📊 | Chart/Analytics | `BarChart3` |
| 🎛️ | Dashboard/Control | `Gauge` |
| ⭐ | Star/Featured | `Star` |
| 💡 | Idea/Tip | `Lightbulb` |
| 🔍 | Search | `Search` |
| 💼 | Business/Briefcase | `Briefcase` |
| 📈 | Trending Up | `TrendingUp` |
| 🔗 | Link/Connect | `Link` |
| 📰 | News | `Newspaper` |
| 👥 | Users/Team | `Users` |
| ✅ | Check/Done | `CheckSquare` ou `CheckCircle2` |
| 🧮 | Calculator | `Calculator` |
| 📄 | Document | `FileText` |
| 🔄 | Refresh/Sync | `RefreshCw` |
| 💳 | Credit Card | `CreditCard` |
| ⚖️ | Scale/Compare | `Scale` |
| 📅 | Calendar | `Calendar` |
| 🏠 | Home | `Home` |
| 🤖 | Robot/AI | `Bot` |
| 👤 | User/Profile | `User` |
| 🎁 | Gift/Reward | `Gift` |
| ❓ | Help/Question | `HelpCircle` |
| 💰 | Money/Credits | `DollarSign` |
| 💎 | Premium/Gem | `Gem` |
| 🏅 | Medal/Award | `Medal` |
| 🔥 | Fire/Streak | `Flame` |
| 🌟 | Sparkle | `Sparkles` |
| 📚 | Library/Books | `Library` |
| 🔴 | Error/Critical | `XCircle` |
| ⚠️ | Warning | `AlertTriangle` |
| 🛡️ | Shield/Protected | `Shield` |
| 🚨 | Alert/Urgent | `AlertOctagon` |
| ➖ | Neutral | `Minus` |
| 🛒 | Shopping | `ShoppingCart` |
| 📦 | Package | `Package` |
| 🏦 | Bank | `Landmark` |
| 🏛️ | Building/Gov | `Building2` |

---

## Ordem de Execução

1. **Criar `src/lib/iconMap.ts`** — Centraliza todos os ícones
2. **Atualizar `commandPaletteTools.ts`** — Maior impacto visual (Command Palette)
3. **Atualizar `CommandPalette.tsx`** — Renderização dos ícones
4. **Atualizar `JourneysSection.tsx`** — Landing page (visibilidade alta)
5. **Atualizar `HeroSection.tsx`** — Trocar ⭐ restante
6. **Atualizar `useAchievements.ts`** — Sistema de conquistas
7. **Atualizar `AchievementBadge.tsx`** — Renderização dos badges
8. **Atualizar `DREWizard.tsx`** — Remover emojis duplicados
9. **Atualizar `OpportunityDetailCard.tsx`** — Status de oportunidades

---

## Resultado Esperado

- Consistência visual em toda a aplicação
- Ícones escaláveis e configuráveis (tamanho, cor, stroke)
- Melhor acessibilidade (SVGs com aria-labels)
- Código mais manutenível (ícones centralizados)
- Aparência mais profissional/empresarial

---

## Estimativa de Tempo

~2-3 horas de implementação

