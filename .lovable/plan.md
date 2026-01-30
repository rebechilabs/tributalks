
# Plano de Implementação: Melhorias Estratégicas TribuTalks

## Visão Geral

Análise completa das 10 melhorias propostas com priorização baseada em impacto x esforço. O plano organiza a implementação em 3 ondas progressivas.

---

## Estado Atual Identificado

| Funcionalidade | Status Atual | Lacunas |
|----------------|--------------|---------|
| **Dashboard** | Lista ferramentas por categoria | Sem progresso, sem resumo de dados, sem próximos passos |
| **Notificações** | Sistema in-app funcional com Realtime | Sem triggers automáticos, sem resumo semanal |
| **Score Tributário** | Cálculo único, histórico existe | Sem benchmark, sem integração com DRE/Radar |
| **Workflows** | Progresso salva no banco | Sem "Continuar" no Dashboard, sem notificação |
| **Gamificação** | Não existe | Nenhum badge/conquista implementado |
| **Resumo Executivo** | ExecutiveSummaryCard funcional | Falta botão PDF 1-clique |
| **Clara Contextual** | Apenas floating button | Sem sugestões por página, sem atalho teclado |
| **Alertas de Prazo** | check-expiring-benefits existe | Sem filtro por setor/regime no Dashboard |
| **Conexão Ferramentas** | Isoladas | Sem "próximo passo" contextual |
| **Onboarding** | 6 etapas funcionais | Sem tour guiado, sem missão inicial |

---

## Matriz de Priorização

| Melhoria | Esforço | Impacto | Prioridade |
|----------|---------|---------|------------|
| 1. Dashboard Centrado em Progresso | M | Alto | 1 |
| 6. Resumo Executivo (CEO View) | P | Alto | 2 |
| 8. Alertas de Prazo Inteligentes | P | Alto | 3 |
| 4. Workflows com Progresso Salvo | P | Médio | 4 |
| 9. Conectar Ferramentas Entre Si | P | Médio | 5 |
| 7. Clara como Copiloto Ativo | M | Alto | 6 |
| 3. Score como Hub Central | M | Alto | 7 |
| 2. Notificações Proativas | M | Alto | 8 |
| 10. Onboarding Guiado | P | Alto | 9 |
| 5. Gamificação Leve | M | Médio | 10 |

---

## Onda 1: Quick Wins (Esforço P, Impacto Alto)

### 1.1 Dashboard Centrado em Progresso

**Objetivo**: Transformar o Dashboard de lista de ferramentas para hub de progresso.

**Componentes a Criar**:

```text
src/components/dashboard/
├── ProgressSummary.tsx      # "Seu Progresso Tributário" 
├── DataSummaryCards.tsx     # Score, créditos, última simulação
├── NextStepRecommendation.tsx # "Próximo passo recomendado"
├── LastActivityCard.tsx     # "Sua última atividade"
└── AchievementBadges.tsx    # Badges básicos (fase inicial)
```

**Mudanças no Dashboard.tsx**:
- Adicionar seção "Seu Progresso Tributário" no topo (após ClaraCard)
- Barra de progresso calculando % da jornada completa
- Grid 2x2 com: Score atual, Créditos encontrados, Última simulação, Workflows completos
- Substituir primeiro grupo de ferramentas por "Próximo Passo Recomendado" (lógica baseada no que falta)
- Adicionar "Sua última atividade" com timestamp + link direto

**Lógica de Progresso**:
```text
Jornada = Score + XMLs + DRE + Oportunidades + 1 Workflow
Peso: 20% cada = 100% quando todos completos
```

**Banco de Dados**: Usar dados existentes (tax_score, xml_imports, company_dre, company_opportunities, workflow_progress).

---

### 1.2 Resumo Executivo (CEO View) - Aprimorar

**O que já existe**: ExecutiveSummaryCard mostra Caixa em Jogo, Risco, Score.

**Melhorias a Implementar**:
- Adicionar semáforo visual grande (verde/amarelo/vermelho) baseado em riscoNivel
- Incluir "3 ações recomendadas" com links diretos (usar score_actions existente)
- Botão "Gerar PDF" 1-clique que chama edge function generate-executive-report

**Mudanças**:
```text
ExecutiveSummaryCard.tsx:
├── Adicionar ícone semáforo (ShieldCheck/Alert/X) maior
├── Seção "3 Ações Recomendadas" com links
└── Botão "Baixar PDF Executivo"
```

---

### 1.3 Alertas de Prazo Inteligentes no Dashboard

**O que já existe**: 
- Tabela `prazos_reforma` com prazos por regime/setor
- Edge function `check-expiring-benefits` processa oportunidades

**Melhorias**:
- Criar componente `NextRelevantDeadline.tsx` no Dashboard
- Filtrar por regime do usuário (profile.regime) e setor (company_profile.setor)
- Mostrar apenas o próximo prazo relevante com contagem regressiva
- Incluir botão "Adicionar ao Calendário" (gerar link Google Calendar)

**Componente**:
```text
src/components/dashboard/NextRelevantDeadline.tsx
├── Query prazos_reforma filtrado por regime/setor
├── Contagem regressiva em dias
├── Impacto estimado (texto descritivo)
└── Botão "Adicionar ao Calendário" (URL Google Calendar)
```

---

### 1.4 Workflows - "Continuar de Onde Parou"

**O que já existe**: 
- `workflow_progress` tabela com current_step_index, completed_steps, completed_at
- Hook `useWorkflowProgress` totalmente funcional

**Melhorias**:
- Criar `InProgressWorkflows.tsx` para o Dashboard
- Query workflows incompletos (completed_at IS NULL)
- Card com "Continuar workflow X - Step Y de Z"
- Link direto para WorkflowsGuiados com workflow selecionado

**Componente**:
```text
src/components/dashboard/InProgressWorkflows.tsx
├── Query workflow_progress WHERE completed_at IS NULL
├── Mapear workflow_id para dados do workflow (título, steps)
├── Mostrar progresso visual (checkmarks)
└── Botão "Continuar"
```

---

### 1.5 Conectar Ferramentas - "Próximo Passo Sugerido"

**Implementar CTAs contextuais ao final de cada ferramenta**:

| Ferramenta | Próximo Passo Sugerido |
|------------|------------------------|
| Score Tributário | "Ver impacto da Reforma → RTC" |
| Importar XMLs | "Ver créditos identificados → Radar" |
| Calculadora RTC | "Simular impacto no lucro → DRE" |
| DRE | "Descobrir oportunidades → Matching" |
| Radar de Créditos | "Ver impacto no resultado → DRE" |

**Componente Reutilizável**:
```text
src/components/common/NextStepCta.tsx
├── Props: currentTool, hasData
├── Lógica de mapeamento ferramenta → próximo
└── Card com descrição + botão "Continuar"
```

---

## Onda 2: Engajamento (Esforço M, Impacto Alto)

### 2.1 Clara como Copiloto Ativo

**Melhorias**:

1. **Sugestões Contextuais por Página**:
   - Criar `ClaraContextualSuggestion.tsx`
   - Mapear rotas para sugestões específicas
   - Exemplo: No Score: "Quer que eu explique o que significa essa nota?"

2. **"Clara te recomenda" no Dashboard**:
   - Usar dados do perfil (company_profile) para personalizar
   - Mostrar 1-2 sugestões baseadas no que falta (sem score → calcular score)

3. **Atalho de Teclado**:
   - Adicionar listener global para Cmd+K / Ctrl+K
   - Dispatch evento openClaraFreeChat

4. **Comando /resumo**:
   - No FloatingAssistant, interceptar mensagens começando com /
   - /resumo → chamar generate-executive-report e retornar texto

**Arquivos a Modificar**:
```text
src/components/common/FloatingAssistant.tsx
├── Adicionar keyboard listener (Cmd+K)
├── Interceptar /comandos no input
└── Adicionar função handleCommand()

src/components/common/ClaraContextualSuggestion.tsx (novo)
├── Props: currentRoute
├── Mapeamento rota → sugestão
└── Botão que abre Clara com pergunta
```

---

### 2.2 Score Tributário como Hub Central

**Melhorias**:

1. **Score Mensal com Histórico**:
   - ScoreHistoryChart já existe e funciona
   - Adicionar gráfico de tendência 3-6 meses no card principal
   - Mostrar "Evolução: +X pts desde [mês]"

2. **Benchmark do Setor**:
   - Criar tabela `sector_score_benchmarks` ou usar `sector_benchmarks` existente
   - Adicionar campo avg_score_by_sector
   - Mostrar "Você está melhor que X% das empresas do seu porte"

3. **Alertas Automáticos**:
   - Trigger quando score muda significativamente (>10 pts)
   - Criar notificação: "Seu score mudou de X para Y"

4. **Integração DRE/Radar**:
   - Pré-preencher perguntas do Score com dados de DRE (faturamento)
   - Pré-preencher com dados de Radar (créditos não aproveitados)

**Banco de Dados**:
```sql
-- Adicionar benchmark de score por setor
ALTER TABLE sector_benchmarks ADD COLUMN avg_score INTEGER DEFAULT 65;
ALTER TABLE sector_benchmarks ADD COLUMN percentile_data JSONB DEFAULT '{}';
```

---

### 2.3 Notificações Proativas

**Edge Functions a Criar/Modificar**:

1. **check-score-recalculation** (novo):
   - Query tax_score WHERE updated_at < NOW() - 30 days
   - Criar notificação: "Seu Score foi calculado há 30 dias"

2. **check-platform-inactivity** (novo):
   - Query profiles WHERE updated_at < NOW() - 7 days
   - Criar notificação: "Você não acessou a plataforma em 7 dias"

3. **check-sector-news** (modificar fetch-news):
   - Após processar notícia, verificar setores_afetados
   - Notificar usuários com company_profile.setor matching

4. **send-weekly-digest** (novo, cron semanal):
   - Compilar: novos prazos, novas notícias, score, créditos
   - Enviar por email (opt-in via profiles.notif_novidades)

**Cron Jobs**:
```sql
-- Score recalculation reminder (diário)
SELECT cron.schedule('check-score-30d', '0 9 * * *', ...);

-- Weekly digest (segunda-feira 9h)
SELECT cron.schedule('weekly-digest', '0 9 * * 1', ...);

-- Inactivity check (diário)
SELECT cron.schedule('check-inactivity', '0 10 * * *', ...);
```

**Badge de Novidades no Menu**:
- Adicionar `hasUpdates` flag no Sidebar
- Query notificações não lidas por categoria
- Mostrar ponto vermelho em itens com atualizações

---

## Onda 3: Diferenciação (Esforço M, Impacto Médio/Alto)

### 3.1 Onboarding Guiado Pós-Cadastro

**Melhorias**:

1. **Tour Guiado de 60 segundos**:
   - Usar biblioteca como `react-joyride` ou componente custom
   - 5 steps: Clara, Score, GPS Reforma, Calculadoras, Perfil

2. **"Sua Primeira Missão"**:
   - Baseado no regime:
     - Simples Nacional → Score + Split Payment
     - Lucro Presumido → Score + Comparativo
     - Lucro Real → XMLs + Radar de Créditos

3. **Checklist de Primeiros Passos**:
   - Persistir em localStorage (ou nova tabela user_onboarding_checklist)
   - Mostrar por 7 dias após cadastro
   - Items: Calcular Score, Primeira Simulação, Explorar Timeline

4. **Email D+1**:
   - Edge function disparada 24h após signup
   - Template com resumo do que fazer

**Componentes**:
```text
src/components/onboarding/
├── GuidedTour.tsx          # Tour interativo
├── FirstMission.tsx        # Missão baseada no regime
├── OnboardingChecklist.tsx # Checklist de 7 dias
└── OnboardingTooltip.tsx   # Tooltips destacados
```

---

### 3.2 Gamificação Leve

**Sistema de Conquistas**:

1. **Tabela user_achievements**:
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_code TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_code)
);
```

2. **Conquistas Iniciais**:
| Código | Nome | Condição |
|--------|------|----------|
| first_score | Primeiro Score | Calcular score pela 1ª vez |
| score_a_plus | Score A+ | Atingir nota A+ |
| score_improved | Score Melhorou | Score subir 10+ pts |
| xml_100 | 100 XMLs | Importar 100 notas |
| xml_1000 | 1000 XMLs | Importar 1000 notas |
| credits_10k | R$10k em Créditos | Identificar R$10k+ em créditos |
| workflow_complete | Workflow Completo | Completar 1 workflow |
| workflow_all | Todos os Workflows | Completar 4 workflows |
| referral_3 | Indicou 3 Amigos | 3 indicações bem-sucedidas |
| streak_5 | 5 Dias Seguidos | Acessar 5 dias consecutivos |

3. **Trigger de Verificação**:
- Edge function `check-achievements` chamada após ações-chave
- Verificar condições e inserir conquistas
- Criar notificação celebratória

4. **UI**:
```text
src/components/achievements/
├── AchievementBadge.tsx    # Badge individual
├── AchievementList.tsx     # Lista no perfil
├── AchievementToast.tsx    # Toast de conquista
└── AchievementProgress.tsx # Progresso até próxima
```

5. **Streak de Uso**:
- Adicionar campo `last_access_date` e `current_streak` em profiles
- Atualizar no login
- Mostrar no Dashboard: "🔥 5 dias seguidos!"

---

## Resumo de Entregas por Onda

### Onda 1 (2-3 sprints)
- [ ] ProgressSummary.tsx + DataSummaryCards.tsx
- [ ] NextStepRecommendation.tsx + LastActivityCard.tsx
- [ ] Aprimorar ExecutiveSummaryCard (semáforo + ações + PDF)
- [ ] NextRelevantDeadline.tsx com calendário
- [ ] InProgressWorkflows.tsx ("Continuar de onde parou")
- [ ] NextStepCta.tsx (conectar ferramentas)

### Onda 2 (3-4 sprints)
- [ ] ClaraContextualSuggestion.tsx
- [ ] Atalho Cmd+K para Clara
- [ ] Comando /resumo
- [ ] Benchmark de Score por setor
- [ ] Edge functions de notificação proativa (4 funções)
- [ ] Badge de novidades no menu

### Onda 3 (2-3 sprints)
- [ ] Sistema de conquistas (tabela + edge function + UI)
- [ ] Tour guiado pós-onboarding
- [ ] Primeira missão por regime
- [ ] Checklist de primeiros passos
- [ ] Streak de uso

---

## Detalhes Técnicos

### Novas Tabelas Necessárias
```sql
-- Conquistas do usuário
CREATE TABLE user_achievements (...);

-- Onboarding checklist (opcional - pode ser localStorage)
CREATE TABLE user_onboarding_progress (...);

-- Streak tracking (pode ser campo em profiles)
ALTER TABLE profiles ADD COLUMN last_access_date DATE;
ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
```

### Novas Edge Functions
1. `check-score-recalculation` - Lembrete de recálculo
2. `check-platform-inactivity` - Alerta de inatividade
3. `send-weekly-digest` - Resumo semanal por email
4. `check-achievements` - Verificar e conceder conquistas
5. `send-onboarding-d1-email` - Email D+1

### Arquivos a Criar
```text
src/components/dashboard/
├── ProgressSummary.tsx
├── DataSummaryCards.tsx
├── NextStepRecommendation.tsx
├── LastActivityCard.tsx
├── InProgressWorkflows.tsx
├── NextRelevantDeadline.tsx

src/components/common/
├── NextStepCta.tsx
├── ClaraContextualSuggestion.tsx

src/components/achievements/
├── AchievementBadge.tsx
├── AchievementList.tsx
├── AchievementToast.tsx

src/components/onboarding/
├── GuidedTour.tsx
├── FirstMission.tsx
├── OnboardingChecklist.tsx
```

---

## Ordem de Implementação Sugerida

1. **ProgressSummary + DataSummaryCards** - Maior impacto visual
2. **NextRelevantDeadline** - Quick win, alta urgência percebida
3. **InProgressWorkflows** - Retém usuários que começaram
4. **ExecutiveSummaryCard melhorado** - Valor para C-level
5. **NextStepCta** - Conecta a jornada
6. **Clara contextual + atalho** - Diferencial de UX
7. **Notificações proativas** - Engajamento recorrente
8. **Score como hub** - Profundidade na ferramenta-chave
9. **Onboarding guiado** - Melhora conversão inicial
10. **Gamificação** - Retenção de longo prazo
