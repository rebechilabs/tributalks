

# Plano Atualizado: Jornada TribuTalks + Limites Refinados

## Alteracoes em Relacao ao Plano Anterior

### 1. Clara AI - Novos Limites por Plano

| Plano | Limite Diario | Compra de Creditos | Escopo de Respostas |
|-------|--------------|-------------------|---------------------|
| **STARTER** | 30 msg/dia | Sim (pacotes 10/20/30) | Apenas ferramentas do Starter |
| **NAVIGATOR** | 100 msg/dia | Sim (pacotes 10/20/30) | Ferramentas ate Navigator |
| **PROFESSIONAL** | Ilimitado | - | Todas as ferramentas |
| **ENTERPRISE** | Ilimitado | - | Todas + consultoria juridica |

**Escopo de Respostas da Clara por Plano:**
- **STARTER**: Score Tributario, Split Payment, Comparativo Regimes, Calculadora RTC, Timeline
- **NAVIGATOR**: + Calculadora NBS, Noticias, Analisador Docs, Workflows, Comunidade
- **PROFESSIONAL+**: + Analise Creditos, DRE, NEXUS, Oportunidades, Margem Ativa, ERPs

Quando usuario perguntar sobre ferramenta fora do plano, Clara responde:
> "Essa funcionalidade esta disponivel no plano [X]. Posso te ajudar a entender como ela funcionaria para sua empresa, mas para usar voce precisaria fazer upgrade."

### 2. Score Tributario - Ilimitado para Todos

```text
STARTER     → Ilimitado
NAVIGATOR   → Ilimitado  
PROFESSIONAL → Ilimitado
ENTERPRISE  → Ilimitado
```

O Score e a porta de entrada universal - todos podem recalcular quantas vezes quiserem.

### 3. NEXUS - Sem Dependencia de XMLs

O NEXUS sera desbloqueado com base em:
- **DRE Inteligente** (preenchido)
- **Score Tributario** (calculado)
- **Dados do Perfil** (faturamento, regime)

**Nao requer**: Importacao de XMLs, SPED ou DCTF

Isso simplifica a jornada: usuario preenche DRE → NEXUS ja mostra os 8 KPIs.

---

## Matriz de Funcionalidades Atualizada

```text
                           STARTER    NAVIGATOR   PROFESSIONAL   ENTERPRISE
---------------------------------------------------------------------------
JORNADA CORE
  Score Tributario           Ilim.      Ilim.       Ilim.         Ilim.
  Clara AI (msg/dia)         30         100         Ilim.         Ilim.
  Compra de Creditos Clara   ✓          ✓           -             -
  
ETAPA 2: SIMULAR
  Split Payment              Ilim.      Ilim.       Ilim.         Ilim.
  Comparativo Regimes        Ilim.      Ilim.       Ilim.         Ilim.
  Calculadora RTC            ✓          ✓           ✓             ✓
  Calculadora NBS            -          ✓           ✓             ✓

ETAPA 3: DIAGNOSTICAR
  DRE Inteligente            -          -           ✓             ✓
  Radar de Creditos          -          -           ✓             ✓
  Analise XMLs/SPED/DCTF     -          -           ✓             ✓
  Oportunidades Fiscais      -          -           ✓             ✓
  Suite Margem Ativa         -          -           ✓             ✓

ETAPA 4: COMANDAR
  NEXUS (8 KPIs)             -          -           ✓             ✓
  Painel Executivo           -          -           -             ✓
  Relatorios PDF Premium     -          ✓           ✓             ✓
  Conectar ERP               -          -           ✓             ✓

EXTRAS
  GPS da Reforma (Noticias)  -          ✓           ✓             ✓
  Timeline 2026-2033         ✓          ✓           ✓             ✓
  Comunidade Circle          -          ✓           ✓             ✓
  Workflows Guiados          -          ✓           ✓             ✓
  Analisador de Docs IA      -          ✓           ✓             ✓
  Consultoria Advogados      -          -           -             ✓
  White Label                -          -           -             ✓
```

---

## Arquivos a Modificar

### 1. useFeatureAccess.ts
- Adicionar plano STARTER
- Score ilimitado para todos
- Novos limites de Clara (30/100/ilimitado)

### 2. useUserCredits.ts
- Ajustar logica para STARTER e NAVIGATOR poderem comprar creditos
- Manter pacotes existentes (10/20/30 creditos)

### 3. clara-assistant Edge Function
- Adicionar logica de escopo por plano
- Verificar se pergunta e sobre ferramenta acessivel
- Resposta educada quando fora do escopo

### 4. useNexusData.ts
- Remover dependencia de XMLs
- Basear apenas em DRE + Score + Perfil

### 5. PricingSection.tsx
- Atualizar matriz com novos limites
- Destacar "Score Ilimitado" em todos os planos
- Mostrar "30 msg/dia" e "100 msg/dia" para Clara

### 6. Sidebar.tsx + MobileNav.tsx
- NEXUS visivel para PROFESSIONAL+ (sem gating de XML)
- Score sem cadeado (todos tem acesso)

---

## Logica da Clara por Escopo

### Implementacao no clara-assistant

```typescript
const PLAN_SCOPE = {
  STARTER: [
    'score_tributario', 'split_payment', 'comparativo_regimes', 
    'calculadora_rtc', 'timeline_reforma'
  ],
  NAVIGATOR: [
    ...STARTER_SCOPE,
    'calculadora_nbs', 'noticias', 'analisador_docs', 
    'workflows', 'comunidade', 'relatorios_pdf'
  ],
  PROFESSIONAL: [
    ...NAVIGATOR_SCOPE,
    'dre_inteligente', 'radar_creditos', 'analise_xmls',
    'oportunidades', 'margem_ativa', 'nexus', 'erp'
  ],
  ENTERPRISE: [...PROFESSIONAL_SCOPE, 'consultoria_juridica', 'white_label']
};

// Detectar topico da pergunta e verificar se esta no escopo
function isTopicInScope(topic: string, userPlan: string): boolean {
  return PLAN_SCOPE[userPlan].includes(topic);
}
```

### Resposta Fora do Escopo

```text
"Entendo sua duvida sobre [DRE Inteligente/Radar de Creditos/etc]. 
Essa e uma ferramenta poderosa disponivel no plano Professional.

Posso te explicar como ela funciona e como ajudaria sua empresa, 
mas para utiliza-la voce precisaria fazer upgrade.

Quer saber mais sobre o que o plano Professional oferece?"
```

---

## Ordem de Implementacao

### Fase 1: Ajustes de Acesso
1. Atualizar `useFeatureAccess.ts` com STARTER + Score ilimitado
2. Atualizar `useUserCredits.ts` para novos limites Clara
3. Atualizar `useNexusData.ts` sem dependencia de XMLs

### Fase 2: Clara com Escopo
4. Modificar `clara-assistant` para verificar escopo por plano
5. Adicionar detector de topico na mensagem
6. Implementar resposta educada para fora do escopo

### Fase 3: Landing Page
7. Atualizar `PricingSection.tsx` com nova matriz
8. Destacar "Score Ilimitado" e limites de Clara

### Fase 4: Navegacao
9. Atualizar `Sidebar.tsx` e `MobileNav.tsx`
10. Remover gating de XML para NEXUS

---

## Resumo das Mudancas vs Plano Anterior

| Item | Plano Anterior | Plano Atualizado |
|------|---------------|------------------|
| Clara STARTER | 5 msg/dia | 30 msg/dia |
| Clara NAVIGATOR | 30 msg/dia | 100 msg/dia |
| Score STARTER | 1x | Ilimitado |
| Score NAVIGATOR | Ilimitado | Ilimitado |
| NEXUS dependencia | DRE + XMLs | Apenas DRE + Score |
| Escopo Clara | Igual para todos | Limitado por plano |

