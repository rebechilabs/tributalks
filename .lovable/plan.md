
# Reorganizacao: Remover modulo "Conexao e Comunicacao" do sidebar

## Resumo

O modulo "CONEXAO E COMUNICACAO" ja foi removido dos menus em `menuConfig.ts`, mas ainda existem referencias orfas no sidebar e no tour guiado. Alem disso, o menu PROFESSIONAL esta sem o modulo PLANEJAR. Este plano limpa as referencias e adiciona PLANEJAR ao Professional.

## Mudancas

### 1. Adicionar modulo PLANEJAR ao MENU_PROFESSIONAL_V2

O menu Professional atual tem ENTENDER, PRECIFICAR, RECUPERAR, COMANDAR mas falta PLANEJAR. Sera adicionado entre RECUPERAR e COMANDAR para seguir a jornada logica do usuario.

Em `src/data/menuConfig.ts`, inserir apos o modulo RECUPERAR (linha ~246):

```
// Modulo PLANEJAR
{
  title: 'PLANEJAR',
  collapsible: true,
  moduleHref: '/dashboard/planejar',
  items: [
    { label: 'Oportunidades Tributarias', href: '/dashboard/planejar/oportunidades', icon: Lightbulb, badge: '61+' },
    { label: 'Planejamento Tributario', href: '/dashboard/planejar/planejamento', icon: Route, badge: 'Em breve' },
  ]
},
```

### 2. Limpar referencia orfao no Sidebar

Em `src/components/dashboard/Sidebar.tsx` (linhas 276-277), remover o comentario e o data-tour do 'conexao':

- Antes: `const tourAttribute = groupKey === 'conexao' ? { 'data-tour': 'conexao-group' } : {};`
- Depois: `const tourAttribute: Record<string, string> = {};`

### 3. Remover step do tour guiado

Em `src/components/onboarding/GuidedTour.tsx` (linhas 75-90), remover o step inteiro que referencia `[data-tour="conexao-group"]`.

### 4. Garantir "Integracoes" presente em todos os planos

Atualmente, "Integracoes" so aparece no MENU_PROFESSIONAL_V2. Adicionar ao MENU_STARTER e MENU_NAVIGATOR na secao de itens independentes (junto com Configuracoes), para que o item fique visivel em todos os planos conforme a estrutura final solicitada.

## Estrutura final do sidebar (Professional)

```text
Clara AI
Home
-----------
ENTENDER        (colapsavel)
  DRE Inteligente
  Score Tributario
  Comparativo de Regimes
PRECIFICAR      (colapsavel)
  Margem Ativa
  Split Payment
  PriceGuard
RECUPERAR       (colapsavel)
  Radar de Creditos
PLANEJAR        (colapsavel)    <-- NOVO
  Oportunidades Tributarias
  Planejamento Tributario
COMANDAR        (colapsavel)
  NEXUS
  Valuation
  Relatorios PDF
-----------
Indique e Ganhe
Integracoes
Configuracoes
```

## O que NAO muda

- Pagina /dashboard/conexao (ConexaoPage) -- continua existindo e acessivel via URL
- Rota no App.tsx -- mantida
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Paginas de Integracoes e Configuracoes

## Secao tecnica

### Arquivos editados
- `src/data/menuConfig.ts` -- Adicionar PLANEJAR ao MENU_PROFESSIONAL_V2; adicionar Integracoes ao MENU_STARTER e MENU_NAVIGATOR
- `src/components/dashboard/Sidebar.tsx` -- Remover referencia data-tour conexao-group (linhas 276-277)
- `src/components/onboarding/GuidedTour.tsx` -- Remover step do tour que referencia conexao-group (linhas 75-90)
