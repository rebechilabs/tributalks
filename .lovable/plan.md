

# Plano: Exibir Dia, Horário e Fonte nas Notícias

## Objetivo
Adicionar informações completas de **dia**, **horário** e **fonte** diretamente nos cards de notícias, facilitando a identificação da origem e atualidade de cada notícia.

## Situação Atual
- **No card da lista**: Mostra apenas horário relativo ("Há 2h", "Agora") sem fonte
- **No modal expandido**: Já mostra fonte e data completa, mas o usuário precisa clicar para ver

## Mudanças Propostas

### 1. Atualizar Card de Notícia na Lista
Adicionar a **fonte** e melhorar o formato de **data/hora** no card para mostrar:
- Nome da fonte (ex: "Migalhas", "Receita Federal")
- Link para a fonte original
- Data formatada com dia/mês e horário (ex: "29/01 às 11:00")

**De:**
```
⏰ Há 2h
```

**Para:**
```
📰 Migalhas  •  29/01 às 11:00  🔗
```

### 2. Aplicar Timezone de Brasília
Utilizar as funções de `dateUtils.ts` já existentes para garantir que todos os horários sejam exibidos no fuso de Brasília (GMT-3), conforme padrão do sistema.

### 3. Layout Proposto

```
┌─────────────────────────────────────────────────────┐
│ [Alta relevância]                 📰 Migalhas 🔗    │
│                                   29/01 às 11:00    │
│ Título da Notícia                                   │
│ Resumo executivo da notícia...                      │
│ 💼 Serviços, Comércio                               │
└─────────────────────────────────────────────────────┘
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/NoticiasReforma.tsx` | Atualizar função `formatDate()` para usar Brasília e adicionar exibição da fonte no card |

## Detalhes Técnicos

### Atualização da função formatDate
```typescript
// Usar dateUtils.ts para timezone Brasília
import { formatBrasilia, formatDistanceBrasilia } from "@/lib/dateUtils";

const formatDate = (dateString: string) => {
  return formatBrasilia(dateString, "dd/MM 'às' HH:mm");
};
```

### Novo layout do card (linhas 545-570)
- Mover o relógio para baixo da fonte
- Adicionar nome da fonte com ícone
- Adicionar link externo se disponível

## Resultado Esperado
O usuário poderá ver imediatamente:
- Qual veículo publicou a notícia
- Quando foi publicada (dia e horário em Brasília)
- Link direto para a fonte original

