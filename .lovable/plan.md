
# Plano: Melhorar Navegação entre Páginas

## Visão Geral
Implementar um sistema de navegação mais intuitivo com 4 componentes principais:
1. **Breadcrumb automático** - Mostra onde você está na hierarquia
2. **Botão Voltar** - Retorna à página anterior
3. **Quick Nav** - Atalhos contextuais no header
4. **Página atual destacada** - Indicador visual claro na sidebar

---

## Alterações Propostas

### 1. Criar Hook `useRouteInfo` para Mapeamento de Rotas

**Novo arquivo:** `src/hooks/useRouteInfo.ts`

Cria um hook que fornece:
- Nome legível da página atual
- Caminho hierárquico (breadcrumb)
- Grupo/categoria da página
- Páginas relacionadas para navegação rápida

```text
Estrutura do mapa:
/dashboard → Dashboard (raiz)
/dashboard/score-tributario → Dashboard > Diagnóstico > Score Tributário
/calculadora/rtc → Dashboard > Simuladores > Calculadora RTC
```

---

### 2. Criar Componente `PageBreadcrumb`

**Novo arquivo:** `src/components/common/PageBreadcrumb.tsx`

Componente reutilizável que:
- Gera breadcrumb automaticamente baseado na rota
- Links clicáveis para navegação hierárquica
- Botão "Voltar" integrado (seta ←)
- Responsivo (colapsa em mobile)

**Exemplo visual:**
```text
[←] Dashboard > Simuladores > Split Payment
```

---

### 3. Atualizar `DashboardLayout` com Navegação Melhorada

**Arquivo:** `src/components/dashboard/DashboardLayout.tsx`

Alterações:
- Adicionar `PageBreadcrumb` abaixo do header
- Adicionar indicador visual da página atual (título com ícone)
- Incluir atalhos de navegação rápida (páginas relacionadas)

**Novo layout do header:**
```text
┌─────────────────────────────────────────────────────────────┐
│ [☰] [Logo]                    [🔔] [User ▼]                │
├─────────────────────────────────────────────────────────────┤
│ [←] Dashboard > Simuladores > Split Payment    [Shortcuts] │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Melhorar Destaque na Sidebar

**Arquivo:** `src/components/dashboard/Sidebar.tsx`

Alterações:
- Manter grupos colapsáveis abertos quando contêm a rota ativa
- Adicionar indicador "você está aqui" mais visível
- Scroll automático para o item ativo quando sidebar abre

---

### 5. Adicionar Quick Actions no Header

**Arquivo:** `src/components/dashboard/DashboardLayout.tsx`

Adicionar badges/botões de ação rápida:
- **⌘K** - Abre busca global (já existe)
- **Páginas frequentes** - Atalhos para Score, Dashboard, etc.

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useRouteInfo.ts` | Hook com mapa de rotas e informações hierárquicas |
| `src/components/common/PageBreadcrumb.tsx` | Componente de breadcrumb com botão voltar |

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/components/dashboard/DashboardLayout.tsx` | Integrar breadcrumb, quick nav |
| `src/components/dashboard/Sidebar.tsx` | Auto-expand grupos, melhor destaque |
| `src/components/dashboard/MobileNav.tsx` | Indicador de página atual |

---

## Detalhes Técnicos

### Hook `useRouteInfo`
```typescript
interface RouteInfo {
  path: string;
  label: string;
  group?: string;
  breadcrumb: { path: string; label: string }[];
  relatedPages?: { path: string; label: string; icon: string }[];
}

// Exemplo de uso:
const { breadcrumb, relatedPages, label } = useRouteInfo();
```

### Mapa de Rotas (hierarquia)
```text
Diagnóstico
  ├── Dashboard
  ├── Score Tributário
  └── NEXUS

Simuladores
  ├── Calculadora RTC
  ├── Calculadora NBS
  ├── Split Payment
  └── Comparativo de Regimes

PIT (Reforma)
  ├── Timeline 2026-2033
  ├── Notícias
  └── Checklist de Prontidão

Central Inteligente
  ├── Analisador de Documentos
  ├── Workflows
  └── Comunidade

Diagnóstico Avançado
  ├── Radar de Créditos
  ├── DRE Inteligente
  ├── Oportunidades Fiscais
  └── Margem Ativa
```

### Lógica do Botão Voltar
- Usa `navigate(-1)` do react-router
- Fallback para `/dashboard` se não houver histórico
- Não aparece na página Dashboard (raiz)

### Auto-Expand na Sidebar
Quando usuário está em `/calculadora/rtc`:
- O grupo "Simuladores" fica automaticamente expandido
- O item "Calculadora RTC" fica destacado com borda/fundo

---

## Resultado Esperado

**Antes:**
- Usuário não sabia onde estava na hierarquia
- Precisava usar o botão do navegador para voltar
- Sidebar não mostrava claramente a página atual

**Depois:**
- Breadcrumb mostra caminho completo clicável
- Botão voltar sempre visível (exceto no Dashboard)
- Grupos da sidebar expandem automaticamente
- Atalhos para páginas relacionadas
- ⌘K continua funcionando para busca global
