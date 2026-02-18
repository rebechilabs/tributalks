

# Substituir Todos os Emojis por Icones Lucide

## Resumo

Substituir todos os emojis usados no projeto por icones vetoriais do Lucide React, garantindo consistencia visual e melhor renderizacao entre dispositivos/navegadores. O projeto ja possui um `iconMap.ts` que sera expandido.

## Escopo do Impacto

Emojis encontrados em **55 arquivos** com **687 ocorrencias**. Organizados em 7 categorias de mudanca:

---

### 1. Mapa de Substituicao (Emoji para Lucide)

| Emoji | Uso | Icone Lucide |
|---|---|---|
| Target | Entender / Score | `Target` |
| DollarSign | Precificar / Margem | `DollarSign` |
| Search | Recuperar / Radar | `Search` |
| Lightbulb | Planejar / Dicas | `Lightbulb` |
| BarChart3 | Comandar / DRE | `BarChart3` |
| CircleDot (vermelho) | Alto impacto | `CircleAlert` |
| Circle (amarelo) | Medio impacto | `CircleMinus` |
| CircleCheck (verde) | Baixo impacto | `CircleCheck` |
| Star | Excelente (DRE) | `Star` |
| Heart | Saudavel (DRE) | `Heart` |
| AlertTriangle | Warning (DRE) | `AlertTriangle` |
| AlertOctagon | Critico (DRE) | `AlertOctagon` |
| Clock | Pendente (DRE) | `Clock` |
| Package | ICMS-ST (demo) | `Package` |
| Factory | IPI (demo) | `Factory` |
| Trophy | Score banner | `Trophy` |
| Scale | Comparativo | `Scale` |
| Rocket | Destaque texto | `Rocket` |
| CheckCircle | Checklist / incluso | `CheckCircle2` |
| Sliders | NEXUS | `Sliders` |
| Briefcase | DRE (command) | `Briefcase` |
| TrendingUp | Margem Ativa | `TrendingUp` |
| Link | ERP | `Link` |
| Newspaper | Noticias | `Newspaper` |
| Users | Comunidade | `Users` |
| Calculator | NBS | `Calculator` |
| FileText | Analisador | `FileText` |
| RefreshCw | Workflows | `RefreshCw` |
| CreditCard | Split Payment | `CreditCard` |
| Calendar | Timeline | `Calendar` |
| Home | Dashboard | `Home` |
| Bot | Clara AI | `Bot` |
| User | Perfil / Manual | `User` |
| Gift | Indicar | `Gift` |
| HelpCircle | Ajuda | `HelpCircle` |
| MapPin | Localizacao | `MapPin` |
| ClipboardList | Listas | `ClipboardList` |
| Pen | Notas | `Pen` |
| Dice | Aleatorio | `Dice5` |

---

### 2. Componentes com Logica de Emoji (mudanca estrutural)

#### `src/data/commandPaletteTools.ts`
- Mudar o campo `icon` de `string` (emoji) para `IconKey` (chave do iconMap)
- Cada tool recebe a chave Lucide correspondente (ex: `icon: 'search'` em vez de `icon: '🔍'`)

#### `src/components/CommandPalette.tsx`
- Remover a funcao `isEmoji()` e o branch condicional
- Todos os icones agora vem do `ICON_MAP` diretamente
- Simplifica a renderizacao: sempre usa `<IconComponent />`

#### `src/components/common/MotivationalBanner.tsx`
- Mudar prop `icon` de `string` (emoji) para `IconKey`
- Importar `ICON_MAP` e renderizar `<Icon />` em vez de `<span>{icon}</span>`
- Atualizar todas as 6 paginas que usam MotivationalBanner (DRE, Margem, Oportunidades, Score, Radar, Comparativo)

#### `src/components/common/ClaraAgentTag.tsx`
- Remover campo `emoji` do config
- Usar icone Lucide inline (BarChart3, Calculator, Search, Lightbulb, LayoutDashboard) em tamanho pequeno antes do label

#### `src/components/common/DataSourceBadge.tsx`
- Substituir `emoji` por icone Lucide (BarChart3 para DRE, User para manual, Link para ERP)

#### `src/components/home/LatestNewsSection.tsx`
- Substituir emojis de impacto (🔴🟡🟢) por icones coloridos do Lucide

#### `src/components/dre/DREDashboard.tsx`
- `getHealthEmoji()` vira `getHealthIcon()` retornando componentes Lucide com cor

#### `src/components/landing/demo/DemoStepRadar.tsx`
- Substituir emojis de creditos (📦💰🏭) por icones Lucide (Package, DollarSign, Factory)

#### `src/components/landing/demo/DemoStepClara.tsx`
- Substituir emojis inline (💰🔍) nos chips de sugestao por icones Lucide

#### `src/components/landing/ClaraSection.tsx`
- Remover campo `emoji` do array de agentes (ja usa icones Lucide, so limpar o campo nao usado)

### 3. Texto Inline com Emojis (substituicao em strings)

#### `src/components/common/FloatingAssistant.tsx`
- Strings longas de boas-vindas por plano contem emojis como marcadores (🎯💡📋🚀🎁✅⚠️ etc.)
- Substituir por marcadores de texto em Markdown (ex: `**>**` ou simplesmente remover, ja que o texto e renderizado com react-markdown)
- Alternativa: usar prefixos textuais como `[!]` para avisos, `[i]` para dicas

#### `src/pages/PerfilEmpresa.tsx`
- Emojis em labels e dicas (💡)
- Substituir por icone Lightbulb inline

#### `src/pages/Nexus.tsx`
- Emoji 🚀 no heading
- Substituir por icone Rocket inline

#### `src/pages/calculadora/SplitPayment.tsx`
- Emojis em cards (🔍📊💰)
- Substituir por icones Lucide nos cards

#### `src/lib/pdf/CreditReportGenerator.ts`
- Emoji ⚠️ em texto de PDF
- Substituir por texto "AVISO LEGAL" sem emoji (PDF nao renderiza emoji bem)

### 4. Regex de Limpeza

#### `src/hooks/useSpeechSynthesis.ts`
- Regex que remove emojis para sintese de voz: manter mas simplificar (remover emojis genericos com regex Unicode)

### 5. Expandir `src/lib/iconMap.ts`
- Adicionar icones faltantes: `Trophy, Rocket, Factory, Clock, Heart, MapPin, ClipboardList, Dice5, Sliders`

---

## O que NAO muda

- Logica de negocio, rotas, autenticacao
- Stripe, trial, precos
- Estrutura de componentes
- Estilos Tailwind existentes (apenas adaptacao para icones)

## Secao tecnica

### Arquivos editados (estimativa: ~25 arquivos)

**Infraestrutura:**
- `src/lib/iconMap.ts` - Expandir com ~10 novos icones

**Componentes com mudanca estrutural:**
- `src/data/commandPaletteTools.ts` - Mudar `icon: string` para `icon: IconKey`, 20+ tools
- `src/components/CommandPalette.tsx` - Remover `isEmoji()`, simplificar renderizacao
- `src/components/common/MotivationalBanner.tsx` - Prop `icon: string` vira `icon: IconKey`, renderizar Lucide
- `src/components/common/ClaraAgentTag.tsx` - Emoji para icone Lucide inline
- `src/components/common/DataSourceBadge.tsx` - Emoji para icone Lucide
- `src/components/home/LatestNewsSection.tsx` - Emojis de impacto para icones coloridos
- `src/components/dre/DREDashboard.tsx` - `getHealthEmoji` para `getHealthIcon` com componentes
- `src/components/landing/demo/DemoStepRadar.tsx` - Emojis para icones Lucide
- `src/components/landing/demo/DemoStepClara.tsx` - Emojis em chips para icones
- `src/components/landing/ClaraSection.tsx` - Limpar campo emoji nao usado

**Paginas com MotivationalBanner (atualizar prop icon):**
- `src/pages/DRE.tsx`
- `src/pages/dashboard/MargemAtiva.tsx`
- `src/pages/Oportunidades.tsx`
- `src/pages/ScoreTributario.tsx`
- `src/pages/AnaliseNotasFiscais.tsx`
- `src/pages/dashboard/ComparativoRegimesPage.tsx`

**Paginas com emojis inline:**
- `src/components/common/FloatingAssistant.tsx` - Emojis em strings Markdown
- `src/pages/PerfilEmpresa.tsx` - Emojis em labels
- `src/pages/Nexus.tsx` - Emoji em heading
- `src/pages/calculadora/SplitPayment.tsx` - Emojis em cards

**Utilitarios:**
- `src/hooks/useSpeechSynthesis.ts` - Simplificar regex
- `src/lib/pdf/CreditReportGenerator.ts` - Remover emoji de PDF

### Abordagem de implementacao

1. Expandir `iconMap.ts` com todos os icones necessarios
2. Atualizar `commandPaletteTools.ts` e `CommandPalette.tsx` juntos (dependencia)
3. Atualizar `MotivationalBanner.tsx` e todas as paginas que o usam
4. Atualizar componentes individuais (badges, tags, demo steps)
5. Limpar emojis inline em strings de texto
6. Atualizar regex de speech synthesis

