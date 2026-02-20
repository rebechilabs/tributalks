
# Adicionar CTA "Proximo Passo" ao final do DRE Dashboard

## Resumo

Adicionar o componente `NextStepCta` ja existente ao final do `DREDashboard`, sugerindo ao usuario ir para o Score Tributario apos concluir o DRE.

## O que sera feito

O componente `NextStepCta` ja existe em `src/components/common/NextStepCta.tsx` e ja tem a configuracao correta para o DRE:

- Titulo: "Descobrir oportunidades"
- Descricao: "Com base nos seus dados financeiros, identifique beneficios fiscais."
- CTA: "Ver Oportunidades"
- Destino: `/dashboard/planejar/oportunidades`

Porem, o pedido e para sugerir o **Score Tributario** apos o DRE. Portanto, alem de adicionar o componente, sera necessario ajustar o mapeamento `dre` no `NextStepCta` para apontar para o Score Tributario.

## Mudancas

### 1. `src/components/common/NextStepCta.tsx`
Atualizar o mapeamento do `dre` para:
- Titulo: "Calcular seu Score Tributario"
- Descricao: "Agora que voce tem seu DRE, descubra a nota da saude tributaria da sua empresa."
- CTA: "Ver Score Tributario"
- Href: `/dashboard/entender/score`
- Icone: `Trophy`

### 2. `src/components/dre/DREDashboard.tsx`
- Importar `NextStepCta`
- Adicionar `<NextStepCta currentTool="dre" hasData={!!dre} />` ao final do componente (antes do ultimo `</div>`, linha 511)

## O que NAO muda
- Nenhuma outra logica do DREDashboard
- Nenhum outro mapeamento do NextStepCta (score, xml, radar, rtc, opportunities)
