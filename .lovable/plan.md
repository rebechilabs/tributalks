

# Simplificar Menu PLANEJAR no Sidebar

## O que muda

Dentro da secao PLANEJAR do menu lateral, remover o item "Oportunidades Tributarias" e manter apenas um item: **Planejamento Tributario**, apontando para `/dashboard/planejar`. A lista completa de oportunidades continua acessivel pelo botao "Ver todas" dentro do fluxo.

## Alteracao

**Arquivo**: `src/data/menuConfig.ts`

Existem duas definicoes do modulo PLANEJAR (uma para cada plano). Em ambas, substituir os 2 items atuais:

```text
Antes:
- Oportunidades Tributarias → /dashboard/planejar/oportunidades
- Planejamento Tributario → /dashboard/planejar/planejamento

Depois:
- Planejamento Tributario → /dashboard/planejar
```

Isso afeta as linhas ~162-165 e ~252-256.

Nenhum outro arquivo precisa mudar. A rota `/dashboard/planejar/oportunidades` continua existindo — apenas nao aparece mais no sidebar.

