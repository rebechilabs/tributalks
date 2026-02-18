

# Reorganizar Tabela de Planos com Nova Estrutura de Modulos

## Resumo

Reescrever completamente o componente `NewPricingSection.tsx` para substituir os 3 cards com listas de features por uma **tabela de comparacao detalhada** agrupada por modulo (Entender, Precificar, Recuperar, Planejar, Comandar, Clara AI, Empresa, Extras), com versao responsiva em cards empilhados no mobile.

## Mudancas

### Arquivo: `src/components/landing/NewPricingSection.tsx`

**Estrutura atual**: 3 cards lado a lado, cada um com lista de checks generica.

**Nova estrutura**: Tabela comparativa com linhas agrupadas por modulo.

#### Header da tabela (sticky)
- 3 colunas de planos com nome, subtitulo, preco e botao CTA
- Subtitulos atualizados:
  - STARTER: "Entenda sua situacao tributaria"
  - NAVIGATOR: "Precifique certo e recupere creditos" + badge "RECOMENDADO"
  - PROFESSIONAL: "Planejamento estrategico com IA ilimitada"
- Navigator recebe borda dourada e badge "Recomendado" (em vez de Professional como "MAIS POPULAR")

#### Grupos de linhas (cada grupo com header de secao)
Cada header de modulo tera fundo `bg-white/5`, icone do Lucide correspondente e nome do modulo em dourado.

| Modulo | Icone Lucide | Features |
|---|---|---|
| ENTENDER | BarChart3 | DRE Inteligente, Score Tributario, Comparativo de Regimes |
| PRECIFICAR | Calculator | Margem Ativa |
| RECUPERAR | FileSearch | Radar de Creditos |
| PLANEJAR | Target | Oportunidades Tributarias, Planejamento Tributario |
| COMANDAR | LayoutDashboard | Painel Executivo, Relatorios PDF |
| CLARA AI | Sparkles | Mensagens/dia, Agentes disponiveis |
| EMPRESA | Building2 | CNPJs, Conexao ERP |
| EXTRAS | Gift | Noticias da Reforma, Comunidade, Analisador de Docs |

Cada celula mostra:
- Checkmark dourado para incluso
- Traco cinza para nao incluso
- Texto especifico para itens como mensagens/dia ou agentes

#### Versao mobile
- Em telas < md, renderizar como 3 cards empilhados (Navigator primeiro por ser recomendado)
- Cada card lista todas as features agrupadas por modulo com check/traco

#### Rodape
- Texto: "Todos os planos incluem 7 dias gratis. Cancele quando quiser."
- Card Enterprise mantido abaixo, sem alteracoes

## O que NAO muda

- Precos (R$ 297, R$ 697, R$ 1.997 e anuais)
- Links de checkout Stripe (CONFIG.PAYMENT_LINKS)
- Toggle mensal/anual
- Card Enterprise e EnterpriseModal
- Logica de trial de 7 dias
- Secao header (titulo e subtitulo da secao)

## Secao tecnica

### Arquivo editado
- `src/components/landing/NewPricingSection.tsx` - Reescrita completa: substituir grid de cards por tabela comparativa agrupada por modulo com dados estruturados, renderizacao condicional desktop (tabela) vs mobile (cards), headers de grupo com icones, e Navigator como plano recomendado

### Dados estruturados
Os dados da tabela serao definidos como array de grupos:
```typescript
const featureGroups = [
  {
    name: "ENTENDER",
    icon: BarChart3,
    features: [
      { name: "DRE Inteligente", starter: true, navigator: true, professional: true },
      { name: "Score Tributario", starter: true, navigator: true, professional: true },
      { name: "Comparativo de Regimes", starter: true, navigator: true, professional: true },
    ]
  },
  // ... demais grupos
];
```

### Responsividade
- Desktop (md+): tabela HTML com `<table>` usando componentes do shadcn/ui (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- Mobile (<md): cards empilhados com `div` e listas, Navigator aparece primeiro com destaque visual

