
# Fase 1: Nova Estrutura de Sidebar + Rotas + Home Inteligente

## Visão Geral

Esta fase reestrutura a navegação do plano Professional de uma organização por ferramentas para uma organização por **objetivos de negócio** (ENTENDER, RECUPERAR, PRECIFICAR, COMANDAR), incluindo uma Home Inteligente que guia o usuário baseado no seu progresso.

---

## Arquitetura Proposta

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        DashboardLayout                               │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                       │
│   Sidebar    │              Page Content                            │
│   (Módulos)  │                                                       │
│              │   ┌─────────────────────────────────────┐            │
│   ○ HOME     │   │         PageBreadcrumb              │            │
│              │   │  Home > Entender > Score            │            │
│   ENTENDER   │   └─────────────────────────────────────┘            │
│   ├ DRE      │                                                       │
│   ├ Score    │   ┌─────────────────────────────────────┐            │
│   └ Comparat │   │                                     │            │
│              │   │         HomePage / ToolPage          │            │
│   RECUPERAR  │   │                                     │            │
│   ├ Radar    │   └─────────────────────────────────────┘            │
│   └ Oportun. │                                                       │
│              │                                                       │
│   PRECIFICAR │                                                       │
│   ├ Margem   │                                                       │
│   ├ Split    │                                                       │
│   └ PriceGua │                                                       │
│              │                                                       │
│   COMANDAR   │                                                       │
│   ├ NEXUS    │                                                       │
│   └ Relatór. │                                                       │
│              │                                                       │
│   ─────────  │                                                       │
│   Newsletter │                                                       │
│   Comunidade │                                                       │
│   Integraç.  │                                                       │
│   Config.    │                                                       │
│              │                                                       │
│   [Clara AI] │                                                       │
│              │                                                       │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

## Detalhamento Técnico

### 1. Novos Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/dashboard/HomePage.tsx` | Home Inteligente com estados contextuais |
| `src/pages/dashboard/EntenderPage.tsx` | Página do módulo com cards das ferramentas |
| `src/pages/dashboard/RecuperarPage.tsx` | Página do módulo RECUPERAR |
| `src/pages/dashboard/PrecificacaoPage.tsx` | Página do módulo PRECIFICACAO |
| `src/pages/dashboard/ComandarPage.tsx` | Página do módulo COMANDAR |
| `src/components/home/HomeStateCards.tsx` | Cards de estado (NO_DRE, NO_SCORE, etc) |
| `src/components/home/HomeQuickStats.tsx` | KPIs resumidos para usuário completo |
| `src/components/home/ModuleToolCard.tsx` | Card reutilizável para ferramentas |
| `src/hooks/useHomeState.ts` | Hook para detectar estado do usuário |

### 2. Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/data/menuConfig.ts` | Nova estrutura MENU_PROFESSIONAL_V2 por módulos |
| `src/components/dashboard/Sidebar.tsx` | Renderizar nova estrutura com módulos clicáveis |
| `src/hooks/useRouteInfo.ts` | Adicionar novas rotas e breadcrumbs |
| `src/App.tsx` | Registrar novas rotas |
| `src/components/common/PageBreadcrumb.tsx` | Atualizar labels dos módulos |

### 3. Nova Estrutura de Rotas

```text
/dashboard              → Redirect para /dashboard/home
/dashboard/home         → HomePage.tsx (Home Inteligente)

/dashboard/entender                 → EntenderPage.tsx (cards do módulo)
/dashboard/entender/dre             → DRE.tsx (existente)
/dashboard/entender/score           → ScoreTributario.tsx (existente)
/dashboard/entender/comparativo     → ComparativoRegimes.tsx (existente)

/dashboard/recuperar                → RecuperarPage.tsx (cards do módulo)
/dashboard/recuperar/radar          → AnaliseNotasFiscais.tsx (existente)
/dashboard/recuperar/oportunidades  → Oportunidades.tsx (existente)

/dashboard/precificacao             → PrecificacaoPage.tsx (cards do módulo)
/dashboard/precificacao/margem      → MargemAtiva.tsx (existente)
/dashboard/precificacao/split       → SplitPayment.tsx (existente)
/dashboard/precificacao/priceguard  → (nova funcionalidade - placeholder)

/dashboard/comandar                 → ComandarPage.tsx (cards do módulo)
/dashboard/comandar/nexus           → Nexus.tsx (existente)
/dashboard/comandar/relatorios      → (nova funcionalidade - placeholder)
```

### 4. Lógica da Home Inteligente

O hook `useHomeState` detectará o estado do usuário:

```typescript
type HomeState = 'NO_DRE' | 'NO_SCORE' | 'NO_CREDITS' | 'COMPLETE';

// Prioridade de detecção:
// 1. Se não tem DRE → 'NO_DRE'
// 2. Se não tem Score → 'NO_SCORE'
// 3. Se não tem XMLs/Créditos → 'NO_CREDITS'
// 4. Caso contrário → 'COMPLETE'
```

Cada estado renderiza um layout diferente com CTAs específicos.

### 5. Nova Estrutura do menuConfig.ts

```typescript
// Novo menu para Professional com módulos
export const MENU_PROFESSIONAL_V2: MenuElement[] = [
  // Clara AI no topo
  { title: '', items: [CLARA_AI_ITEM] },
  
  // HOME
  { title: '', items: [{ label: 'Home', href: '/dashboard/home', icon: Home }] },
  
  // Módulo ENTENDER
  {
    title: 'ENTENDER MEU NEGÓCIO',
    collapsible: true,
    moduleHref: '/dashboard/entender', // Novo: link do título
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/entender/dre', icon: BarChart3 },
      { label: 'Score Tributário', href: '/dashboard/entender/score', icon: Trophy },
      { label: 'Comparativo de Regimes', href: '/dashboard/entender/comparativo', icon: Scale },
    ]
  },
  
  // Módulo RECUPERAR
  {
    title: 'RECUPERAR CRÉDITOS',
    collapsible: true,
    moduleHref: '/dashboard/recuperar',
    items: [
      { label: 'Radar de Créditos', href: '/dashboard/recuperar/radar', icon: FileText },
      { label: 'Oportunidades Fiscais', href: '/dashboard/recuperar/oportunidades', icon: Lightbulb, badge: '61+' },
    ]
  },
  
  // Módulo PRECIFICAÇÃO
  {
    title: 'PRECIFICAÇÃO',
    collapsible: true,
    moduleHref: '/dashboard/precificacao',
    items: [
      { label: 'Margem Ativa', href: '/dashboard/precificacao/margem', icon: Target },
      { label: 'Split Payment', href: '/dashboard/precificacao/split', icon: Wallet },
      { label: 'PriceGuard', href: '/dashboard/precificacao/priceguard', icon: Shield },
    ]
  },
  
  // Módulo COMANDAR
  {
    title: 'COMANDAR',
    collapsible: true,
    moduleHref: '/dashboard/comandar',
    items: [
      { label: 'NEXUS', href: '/dashboard/comandar/nexus', icon: LayoutDashboard, featured: true },
      { label: 'Relatórios PDF', href: '/dashboard/comandar/relatorios', icon: FileText },
    ]
  },
  
  { type: 'divider' },
  
  // Seções secundárias
  {
    title: '',
    items: [
      { label: 'Newsletter', href: '/newsletter', icon: Newspaper, description: 'Toda terça às 07h07' },
      { label: 'Comunidade', href: '/comunidade', icon: Users, description: 'Conexões, negócios, biblioteca' },
      { label: 'Integrações', href: '/dashboard/integracoes', icon: Plug },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ]
  },
];
```

### 6. Páginas de Módulo (Template)

Cada página de módulo seguirá o mesmo layout:

```text
┌─────────────────────────────────────────────────────────────┐
│  [TÍTULO DO MÓDULO]                                         │
│  Descrição curta do objetivo do módulo                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │     1       │  │     2       │  │     3       │          │
│  │ [Ferramenta]│  │ [Ferramenta]│  │ [Ferramenta]│          │
│  │             │  │             │  │             │          │
│  │ Descrição   │  │ Descrição   │  │ Descrição   │          │
│  │             │  │             │  │             │          │
│  │ [Status]    │  │ [Status]    │  │ [Status]    │          │
│  │  [Acessar]  │  │  [Acessar]  │  │  [Acessar]  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Status indicators:
  ✓ Verde = ferramenta utilizada/dados preenchidos
  ○ Cinza = ferramenta ainda não utilizada
  ! Amarelo = requer atenção (dados desatualizados)
```

### 7. Compatibilidade com Rotas Antigas

Criar redirects para manter URLs antigas funcionando:

| Rota Antiga | Rota Nova |
|-------------|-----------|
| `/dashboard/dre` | `/dashboard/entender/dre` |
| `/dashboard/score-tributario` | `/dashboard/entender/score` |
| `/calculadora/comparativo-regimes` | `/dashboard/entender/comparativo` |
| `/dashboard/analise-notas` | `/dashboard/recuperar/radar` |
| `/dashboard/oportunidades` | `/dashboard/recuperar/oportunidades` |
| `/dashboard/margem-ativa` | `/dashboard/precificacao/margem` |
| `/calculadora/split-payment` | `/dashboard/precificacao/split` |
| `/dashboard/nexus` | `/dashboard/comandar/nexus` |

### 8. Breadcrumb Atualizado

Estrutura hierárquica para breadcrumbs:

```text
Home > ENTENDER MEU NEGÓCIO > Score Tributário
Home > RECUPERAR CRÉDITOS > Radar de Créditos
Home > PRECIFICAÇÃO > Split Payment
Home > COMANDAR > NEXUS
```

---

## Ordem de Implementação

1. **Criar hook `useHomeState`** - detecta estado do usuário
2. **Atualizar `menuConfig.ts`** - nova estrutura de módulos
3. **Atualizar `useRouteInfo.ts`** - novas rotas e breadcrumbs
4. **Criar `HomePage.tsx`** - Home Inteligente com estados
5. **Criar componentes reutilizáveis** - HomeStateCards, ModuleToolCard
6. **Criar páginas de módulo** - Entender, Recuperar, Precificacao, Comandar
7. **Atualizar `Sidebar.tsx`** - renderizar módulos clicáveis
8. **Atualizar `App.tsx`** - registrar novas rotas com redirects
9. **Testar navegação** - verificar breadcrumbs e estados

---

## Considerações de UX

- **Transição suave**: usuários existentes não perdem acesso às ferramentas
- **Redirects automáticos**: URLs antigas continuam funcionando
- **Clara AI sempre visível**: mantida no sidebar e acessível via ⌘K
- **Indicadores visuais claros**: módulo ativo destacado, ferramenta ativa com barra lateral
- **Mobile-first**: sidebar transforma em menu hambúrguer
- **Estado persistente**: módulos expandidos/colapsados salvos em localStorage

---

## Arquivos Finais

```text
src/
├── hooks/
│   └── useHomeState.ts (novo)
├── pages/
│   └── dashboard/
│       ├── HomePage.tsx (novo)
│       ├── EntenderPage.tsx (novo)
│       ├── RecuperarPage.tsx (novo)
│       ├── PrecificacaoPage.tsx (novo)
│       └── ComandarPage.tsx (novo)
├── components/
│   └── home/
│       ├── HomeStateCards.tsx (novo)
│       ├── HomeQuickStats.tsx (novo)
│       └── ModuleToolCard.tsx (novo)
├── data/
│   └── menuConfig.ts (modificado)
├── components/
│   └── dashboard/
│       └── Sidebar.tsx (modificado)
└── App.tsx (modificado)
```
