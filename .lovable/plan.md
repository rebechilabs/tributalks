

## Plano: Adicionar Explicações Didáticas na Home Inteligente

### Resumo
Enriquecer a página Home com explicações contextuais sobre o módulo atual e cada passo da jornada, tornando a experiência mais educativa e guiada para o usuário.

---

### Estrutura Proposta

Para cada estado da Home, adicionar:
1. **Cabeçalho do Módulo** - Explicação sobre em qual módulo o usuário está e o objetivo
2. **Descrição do Passo Atual** - O que a ferramenta faz e por que é importante
3. **Descrições dos Próximos Passos** - Breve explicação de cada etapa futura

---

### Mudanças no Componente

**Arquivo:** `src/components/home/HomeStateCards.tsx`

#### Estado: NO_DRE (Primeiro Acesso)

**Antes:**
```
Bem-vindo ao TribuTalks!
Para começar, precisamos entender seu negócio.

PASSO 1: Preencha seu DRE
O DRE é a base para todas as análises. Leva apenas 3 minutos.
```

**Depois:**
```
📊 Módulo: Entender Meu Negócio
Aqui você terá a oportunidade de entender a saúde tributária 
da sua empresa através de diagnósticos inteligentes.

PASSO 1: Preencha seu DRE
A Demonstração do Resultado do Exercício apresentará como resultado 
final o lucro líquido ou prejuízo líquido do período da sua empresa.

Próximos passos:
✓ Score Tributário - Um panorama da situação tributária atual da empresa (0-1000 pontos)
✓ Radar de Créditos - Identifica valores pagos indevidamente que podem ser recuperados
✓ Oportunidades - Benefícios fiscais aplicáveis ao seu perfil de negócio
```

---

#### Estado: NO_SCORE (DRE Preenchido)

**Cabeçalho atualizado:**
```
📊 Módulo: Entender Meu Negócio
Seu DRE está preenchido! Agora vamos descobrir sua nota tributária.

PRÓXIMO PASSO: Calcule seu Score Tributário
O Score Tributário apresenta um panorama completo da situação tributária 
atual da sua empresa em uma escala de 0 a 1000 pontos, indicando riscos 
e oportunidades de melhoria.
```

---

#### Estado: NO_CREDITS (Score Calculado)

**Cabeçalho atualizado:**
```
💰 Módulo: Recuperar Meu Dinheiro
Hora de identificar valores que sua empresa pode ter pago a mais em tributos.

PRÓXIMO PASSO: Identifique Créditos Tributários
O Radar de Créditos analisa seus XMLs de notas fiscais para encontrar 
tributos pagos indevidamente nos últimos 5 anos que podem ser recuperados.
```

---

#### Estado: COMPLETE (Tudo Preenchido)

**Cabeçalho atualizado:**
```
🎯 Visão Geral do Seu Negócio
Parabéns! Você completou a jornada inicial. Aqui está um resumo 
da saúde tributária da sua empresa.
```

---

### Textos Definitivos para Cada Ferramenta

| Ferramenta | Descrição Didática |
|------------|-------------------|
| **DRE** | "A Demonstração do Resultado do Exercício apresenta como resultado final o lucro líquido ou prejuízo líquido do período." |
| **Score Tributário** | "Um panorama da situação tributária atual da empresa em uma escala de 0 a 1000 pontos." |
| **Radar de Créditos** | "Identifica tributos pagos indevidamente nos últimos 5 anos que podem ser recuperados." |
| **Oportunidades** | "Benefícios fiscais e incentivos aplicáveis ao perfil do seu negócio." |

---

### Layout Visual Proposto

```
┌──────────────────────────────────────────────────────────────┐
│  📊 MÓDULO: ENTENDER MEU NEGÓCIO                             │
│  Aqui você terá a oportunidade de entender a saúde           │
│  tributária da sua empresa através de diagnósticos.          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Icon] PASSO 1: Preencha seu DRE                           │
│  A Demonstração do Resultado do Exercício apresenta          │
│  como resultado final o lucro líquido ou prejuízo            │
│  líquido do período da sua empresa.                          │
│                                                              │
│  [Conectar ERP]        [Preencher Manualmente]               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Próximos passos após o DRE:                                 │
│                                                              │
│  2. Score Tributário                                         │
│     Um panorama da situação tributária atual (0-1000)        │
│                                                              │
│  3. Radar de Créditos                                        │
│     Identifica valores pagos a mais que podem ser recuperados│
│                                                              │
│  4. Oportunidades                                            │
│     Benefícios fiscais aplicáveis ao seu negócio             │
└──────────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/home/HomeStateCards.tsx` | Atualizar todos os 4 estados (NoDRECard, NoScoreCard, NoCreditsCard, CompleteCard) com explicações didáticas |

---

### Benefícios

1. **Educação** - Usuário entende o propósito de cada ferramenta
2. **Orientação** - Fica claro em qual módulo está e o que virá a seguir
3. **Confiança** - Usuário sabe exatamente o que vai acontecer em cada passo
4. **Engajamento** - Descrições contextuais aumentam a motivação para continuar

