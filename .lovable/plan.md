
# Adicionar "Indique e Ganhe" no Sidebar e na Home

## Resumo

Tornar o "Indique e Ganhe" acessivel diretamente pelo sidebar (em todos os planos) e como acao sugerida na Home do dashboard, sem depender do modulo Conexao.

## Mudancas

### 1. Sidebar - Adicionar item em `src/data/menuConfig.ts`

Adicionar "Indique e Ganhe" como item standalone (sem grupo) antes de "Configuracoes" em todos os 3 menus:

- **MENU_STARTER** (linha ~99-104): Adicionar item `{ label: 'Indique e Ganhe', href: '/indicar', icon: Gift, badge: 'Até 20%', badgeVariant: 'success', description: 'Ganhe desconto indicando' }` antes de Configuracoes
- **MENU_NAVIGATOR** (linha ~184-191): Mesmo item antes de Configuracoes
- **MENU_PROFESSIONAL_V2** (linha ~256-264): Mesmo item antes de Configuracoes/Integracoes

O item ficara visivel em todos os planos, sem precisar expandir nenhum modulo. O icone Gift (ja importado) com badge verde "Ate 20%" cria destaque visual.

### 2. Home - Adicionar CTA na `CompleteCard` em `src/components/home/HomeStateCards.tsx`

Na secao "Acoes sugeridas" da CompleteCard (linha ~413-438), adicionar um terceiro link apos o Split Payment:

```
<Link to="/indicar" ...>
  <Gift className="w-5 h-5 text-green-500" />
  <div>
    <p>Indique e ganhe ate 20% de desconto</p>
    <p>Convide empresarios para a plataforma</p>
  </div>
  <ArrowRight />
</Link>
```

Gift ja esta importado no arquivo.

### 3. Home - Adicionar CTA tambem nos estados intermediarios

Na `NoDRECard` e `NoScoreCard`, nao adicionar (usuario ainda esta no onboarding). Na `NoCreditsCard` (linha ~298), adicionar um card simples abaixo do resumo com link para /indicar.

## Secao tecnica

### Arquivos editados
- `src/data/menuConfig.ts` — Adicionar item Gift em MENU_STARTER, MENU_NAVIGATOR, MENU_PROFESSIONAL_V2
- `src/components/home/HomeStateCards.tsx` — Adicionar link para /indicar nas acoes sugeridas da CompleteCard e NoCreditsCard

### O que NAO muda
- Pagina /indicar (ja existe e funciona)
- Modulo Conexao (continua tendo o card de Indique e Ganhe)
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
