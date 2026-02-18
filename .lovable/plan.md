
# Mostrar Fonte, Horário e Data nas Notícias

## Resumo

Atualizar o widget de notícias na Home para exibir a **fonte** (ex: "Receita Federal", "Valor Econômico") e o **horário** junto com a data de publicação. Os dados já estão disponíveis no hook `useLatestNews` — basta ajustar a exibição.

## Mudança

### Arquivo: `src/components/home/LatestNewsSection.tsx`

Na linha 71-73, onde atualmente mostra apenas a data:

```
17 Fev 2026
```

Passar a mostrar data com horário e fonte:

```
17 Fev 2026 às 14:30 · Receita Federal
```

Detalhes:
- Alterar o formato de `"dd MMM yyyy"` para `"dd MMM yyyy 'às' HH:mm"`
- Adicionar o nome da fonte (`item.fonte`) separado por um ponto mediano (`·`)
- Manter tudo na mesma linha, com estilo `text-xs text-muted-foreground`
- Se `fonte_url` existir, a fonte será um link clicável (abre em nova aba)

## O que NÃO muda

- Hook `useLatestNews.ts` (já busca `fonte` e `fonte_url`)
- Layout geral do widget
- Tags, impacto, rodapé
- Página completa de notícias (`NoticiasReforma.tsx`)

## Seção técnica

### Arquivo editado
- `src/components/home/LatestNewsSection.tsx` — linha 71-73: expandir exibição de data para incluir horário e fonte
