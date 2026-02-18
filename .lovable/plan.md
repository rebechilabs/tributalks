
# Reorganizacao dos Modulos do Sidebar

## Resumo das Alteracoes

1. **Renomear modulos** no sidebar (ENTENDER MEU NEGOCIO -> ENTENDER, RECUPERAR CREDITOS -> RECUPERAR, PRECIFICACAO -> PRECIFICAR)
2. **Criar novo modulo PLANEJAR** entre RECUPERAR e PRECIFICAR
3. **Mover "Oportunidades"** de RECUPERAR para PLANEJAR e renomear para "Oportunidades Tributarias"
4. **Adicionar "Planejamento Tributario"** como placeholder "Em breve" dentro de PLANEJAR
5. **Remover "CONEXAO & COMUNICACAO"** do sidebar (as paginas continuam acessiveis via URL)
6. **Atualizar label "Comparativo de Regimes"** para "Comparativo de Regimes Tributarios"

## Detalhes Tecnicos

### 1. `src/data/menuConfig.ts` (arquivo principal)

**MENU_STARTER:**
- Renomear titulo 'ENTENDER MEU NEGOCIO' -> 'ENTENDER'
- Atualizar label 'Comparativo de Regimes' -> 'Comparativo de Regimes Tributarios'

**MENU_NAVIGATOR:**
- Renomear titulo 'ENTENDER MEU NEGOCIO' -> 'ENTENDER'
- Atualizar label 'Comparativo de Regimes' -> 'Comparativo de Regimes Tributarios'
- Renomear titulo 'RECUPERAR CREDITOS' -> 'RECUPERAR'
- Remover "Oportunidades Fiscais" do grupo RECUPERAR (manter apenas Radar)
- Adicionar novo grupo 'PLANEJAR' com moduleHref '/dashboard/planejar':
  - Oportunidades Tributarias (href: `/dashboard/planejar/oportunidades`, icon: Lightbulb, badge: '61+')
  - Planejamento Tributario (href: `/dashboard/planejar/planejamento`, icon: Route, badge: 'Em breve')
- Remover grupo 'CONEXAO & COMUNICACAO' inteiro

**MENU_PROFESSIONAL_V2:**
- Mesmas renomeacoes de ENTENDER, RECUPERAR
- Adicionar grupo PLANEJAR
- Renomear 'PRECIFICACAO' -> 'PRECIFICAR'
- Remover 'CONEXAO & COMUNICACAO'

### 2. `src/components/dashboard/Sidebar.tsx`

- Atualizar `GROUP_TITLE_TO_KEY`:
  - Adicionar 'ENTENDER': 'entender', 'RECUPERAR': 'recuperar', 'PRECIFICAR': 'precificacao', 'PLANEJAR': 'planejar'
  - Remover entradas antigas ('ENTENDER MEU NEGOCIO', 'RECUPERAR CREDITOS', 'PRECIFICACAO', 'CONEXAO & COMUNICACAO')

### 3. `src/components/dashboard/MobileNav.tsx`

- Mesma atualizacao do `GROUP_TITLE_TO_KEY`

### 4. `src/hooks/useRouteInfo.ts`

- Adicionar rota '/dashboard/planejar' (modulo PLANEJAR)
- Adicionar rota '/dashboard/planejar/oportunidades' (Oportunidades Tributarias)
- Adicionar rota '/dashboard/planejar/planejamento' (Planejamento Tributario)
- Atualizar labels de rotas existentes (Entender, Recuperar, Precificar)
- Atualizar `GROUP_PATHS` com grupo 'planejar'
- Atualizar redirect legado de `/dashboard/oportunidades` -> `/dashboard/planejar/oportunidades`

### 5. `src/App.tsx`

- Mover rota `/dashboard/recuperar/oportunidades` -> `/dashboard/planejar/oportunidades`
- Adicionar rota `/dashboard/planejar/planejamento` (placeholder)
- Adicionar rota `/dashboard/planejar` (pagina do modulo)
- Adicionar redirect legado `/dashboard/recuperar/oportunidades` -> `/dashboard/planejar/oportunidades`
- Atualizar redirect de `/dashboard/oportunidades` -> `/dashboard/planejar/oportunidades`

### 6. Criar `src/pages/dashboard/PlanejarPage.tsx` (novo)

- Pagina do modulo PLANEJAR com 2 cards:
  - Oportunidades Tributarias (link funcional)
  - Planejamento Tributario (placeholder "Em breve")

### 7. `src/pages/dashboard/RecuperarPage.tsx`

- Remover card "Oportunidades Fiscais" (movido para PLANEJAR)
- Atualizar titulo para "Recuperar"
- Manter apenas Radar de Creditos

### 8. `src/pages/dashboard/EntenderPage.tsx`

- Atualizar titulo "Entender Meu Negocio" -> "Entender"
- Atualizar label "Comparativo de Regimes Tributarios" no card

### 9. `src/pages/dashboard/PrecificacaoPage.tsx`

- Atualizar titulo "Precificacao" -> "Precificar"

### 10. Arquivos com referencias a "Oportunidades Fiscais" (renomear para "Oportunidades Tributarias")

- `src/hooks/useClaraContext.ts` (label da rota)
- `src/components/common/ClaraProactive.tsx` (titulo do insight)
- `src/components/common/ClaraContextualCard.tsx` (contexto da rota)
- `src/components/common/ClaraContextualSuggestion.tsx` (rota)
- `src/components/common/FloatingAssistant.tsx` (mapeamento de rota)

### 11. Outros arquivos com links para `/dashboard/recuperar/oportunidades` ou `/dashboard/oportunidades`

- `src/hooks/useDashboardData.ts` - atualizar link
- `src/hooks/useUserProgress.ts` - atualizar link
- `src/components/common/NextStepCta.tsx` - atualizar href
- `src/components/dashboard/NextStepRecommendation.tsx` - atualizar href
- `src/components/dashboard/ExpiringBenefitsAlert.tsx` - atualizar link
- `src/components/executive/ExecutiveProjects.tsx` - atualizar link
- `src/pages/PerfilEmpresa.tsx` - atualizar navigate
- `src/pages/Dashboard.tsx` - atualizar href

## O que NAO sera alterado

- Botoes da landing page (PricingSection, NewPricingSection)
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Valuation
- Estrutura de migrations
- Paginas de Oportunidades em si (apenas o path muda)
- Sidebar styling (icones dourados, fundo escuro, chevron)
