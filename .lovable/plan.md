

# Plano: Clara com Visibilidade Total da Plataforma

## Diagnóstico Atual

Hoje, a Clara AI recebe contexto **muito limitado** sobre o usuário:
- Apenas o nome e plano do usuário (`profiles.nome`, `profiles.plano`)
- Verificação binária se tem DRE ou XMLs (`hasUserData`)
- A rota/ferramenta atual (`toolSlug`)

A Clara **não sabe**:
- Score tributário do usuário (nota, dimensões, riscos)
- Dados financeiros do DRE (receita, margem, EBITDA)
- Créditos fiscais identificados
- Oportunidades mapeadas
- Progresso nos workflows
- Última atividade e engajamento
- Notificações pendentes
- Conexões de ERP ativas
- Perfil da empresa (setor, regime, CNPJ)

## Solução Proposta

Criar um **"Contexto Rico"** que é carregado dinamicamente na edge function `clara-assistant` e injetado no prompt, permitindo que Clara:

1. **Conheça o estado atual do usuário** em tempo real
2. **Faça recomendações personalizadas** baseadas em dados reais
3. **Antecipe necessidades** e ofereça ajuda proativa
4. **Conduza conversas contextuais** referenciando métricas específicas

---

## Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                    CLARA CONTEXT BUILDER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FloatingAssistant.tsx                                          │
│         │                                                       │
│         ▼                                                       │
│  clara-assistant Edge Function                                  │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               buildUserContext()                         │   │
│  │                                                          │   │
│  │  Busca em paralelo:                                      │   │
│  │  ├── profiles (nome, plano, regime, setor)               │   │
│  │  ├── company_profile (razão social, CNPJ, atividades)    │   │
│  │  ├── tax_score (score, dimensões, riscos)                │   │
│  │  ├── company_dre (receita, margem, EBITDA, impacto)      │   │
│  │  ├── credit_analysis_summary (créditos totais)           │   │
│  │  ├── company_opportunities (oportunidades ativas)        │   │
│  │  ├── workflow_progress (workflows em andamento)          │   │
│  │  ├── xml_imports (count de XMLs processados)             │   │
│  │  ├── notifications (não lidas, por categoria)            │   │
│  │  ├── erp_connections (ERPs conectados, status sync)      │   │
│  │  └── user_onboarding_progress (etapas concluídas)        │   │
│  │                                                          │   │
│  │  Retorna: UserPlatformContext                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  Injeta no System Prompt como "CONTEXTO DO USUÁRIO"             │
│         │                                                       │
│         ▼                                                       │
│  Claude/Gemini responde com conhecimento completo               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura do Contexto do Usuário

```typescript
interface UserPlatformContext {
  // Identificação
  userName: string | null;
  companyName: string | null;
  cnpj: string | null;
  setor: string | null;
  regime: string | null;
  plano: string;
  
  // Score Tributário
  score: {
    total: number | null;
    grade: string | null;
    riscoAutuacao: number | null;
    dimensoes: {
      conformidade: number;
      eficiencia: number;
      risco: number;
      documentacao: number;
      gestao: number;
    } | null;
    calculadoEm: string | null;
  };
  
  // Financeiro (DRE)
  financeiro: {
    receitaBruta: number | null;
    margemBruta: number | null;
    margemLiquida: number | null;
    ebitda: number | null;
    cargaTributariaPercent: number | null;
    reformaImpactoPercent: number | null;
    atualizadoEm: string | null;
  };
  
  // Créditos e Oportunidades
  oportunidades: {
    creditosDisponiveis: number;
    oportunidadesAtivas: number;
    economiaAnualPotencial: number;
  };
  
  // Progresso
  progresso: {
    xmlsProcessados: number;
    workflowsEmAndamento: number;
    workflowsConcluidos: number;
    onboardingCompleto: boolean;
    checklistItens: string[];
  };
  
  // Engajamento
  engajamento: {
    ultimoAcesso: string | null;
    streakDias: number;
    notificacoesNaoLidas: number;
  };
  
  // Integrações
  integracoes: {
    erpConectado: boolean;
    erpNome: string | null;
    ultimaSync: string | null;
    syncStatus: 'success' | 'error' | 'pending' | null;
  };
}
```

---

## Exemplo de Prompt Injetado

```
CONTEXTO DO USUÁRIO (dados reais da plataforma):

👤 PERFIL
- Nome: Stephanie
- Empresa: ABC Comércio Ltda
- CNPJ: 12.345.678/0001-90
- Setor: Varejo
- Regime: Lucro Presumido
- Plano: Professional

📊 SCORE TRIBUTÁRIO
- Nota: B (720 pontos)
- Risco de Autuação: 35% (médio)
- Ponto fraco: Documentação (score 45/200)
- Calculado em: 15/01/2026

💰 FINANCEIRO (DRE)
- Receita Bruta Mensal: R$ 850.000
- Margem Bruta: 32%
- Margem Líquida: 8,5%
- Carga Tributária Atual: 22%
- Impacto Reforma 2027: -2,3% na margem
- Atualizado em: 28/01/2026

💡 OPORTUNIDADES
- Créditos disponíveis para recuperar: R$ 47.500
- Oportunidades fiscais ativas: 5
- Economia anual potencial: R$ 156.000

📈 PROGRESSO
- XMLs processados: 234
- Workflows em andamento: 2 (Diagnóstico Completo, Reforma)
- Onboarding: 75% completo (falta: perfil empresa)

🔗 INTEGRAÇÕES
- ERP: Conta Azul (conectado)
- Última sync: há 2 horas
- Status: ✅ sucesso

📬 ENGAJAMENTO
- Streak: 5 dias consecutivos
- Notificações não lidas: 3

---

Use este contexto para personalizar suas respostas. Quando Stephanie perguntar algo, você já sabe:
- Ela tem créditos para recuperar (mencione!)
- A margem dela vai cair 2,3pp com a Reforma (alerte se relevante)
- O ponto fraco é Documentação (sugira melhorar)
- Ela tem workflows em andamento (pergunte se precisa de ajuda)
```

---

## Alterações Necessárias

### 1. Edge Function `clara-assistant/index.ts`

**Criar função `buildUserContext()`**:
- Buscar dados de 10+ tabelas em paralelo
- Formatar em estrutura legível para o LLM
- Cachear por 5 minutos para evitar queries excessivas

**Modificar `buildSystemPrompt()`**:
- Adicionar seção `CONTEXTO DO USUÁRIO` com dados reais
- Incluir instruções sobre como usar o contexto

**Nova lógica de personalização**:
- Se usuário tem créditos > R$ 10k: mencionar proativamente
- Se Score < C: sugerir ações de melhoria
- Se workflow em andamento: perguntar se precisa de ajuda
- Se sem DRE: priorizar preenchimento

### 2. Otimizações de Performance

**Cache de contexto**:
- Armazenar contexto em memória por 5 min
- Invalidar quando houver mudança relevante (novo XML, DRE atualizado)

**Query otimizada**:
- Usar uma única função SQL que retorna todos os dados
- Evitar N+1 queries

---

## Tabelas Consultadas

| Tabela | Dados Extraídos |
|--------|-----------------|
| `profiles` | nome, plano, regime, setor, streak |
| `company_profile` | razão_social, cnpj, atividades |
| `tax_score` | score_total, grade, dimensões, risco |
| `company_dre` | receita, margens, EBITDA, impacto reforma |
| `credit_analysis_summary` | total_potential |
| `company_opportunities` | count, economia_anual |
| `workflow_progress` | em_andamento, concluídos |
| `xml_imports` | count processados |
| `notifications` | não_lidas count |
| `erp_connections` | nome, status, última_sync |
| `user_onboarding_progress` | checklist_items |

---

## Benefícios Esperados

1. **Clara sabe quem é o usuário** - Chama pelo nome, conhece a empresa
2. **Clara sabe o estado financeiro** - Menciona números reais, não genéricos
3. **Clara identifica oportunidades** - "Vi que você tem R$ 47k em créditos..."
4. **Clara acompanha progresso** - "Você está no passo 3 do workflow..."
5. **Clara antecipa problemas** - "Sua margem vai cair 2,3pp em 2027..."
6. **Clara é proativa** - Sugere próximos passos baseados em dados

---

## Exemplo de Conversa Após Implementação

**Usuário**: Oi Clara, como estou?

**Clara**: Oi Stephanie! 😊 Que bom te ver de volta pelo 5º dia seguido!

Olha só o resumo rápido da ABC Comércio:

- **Score B (720 pts)** - Bom, mas dá pra chegar no A
- **R$ 47.500 em créditos** esperando recuperação
- **Impacto Reforma**: sua margem vai cair 2,3pp em 2027

💡 Notei que o ponto mais fraco é Documentação. Quer que eu te mostre como melhorar esse score?

E você tem 2 workflows em andamento - precisa de ajuda para continuar algum deles?

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/clara-assistant/index.ts` | Adicionar `buildUserContext()`, modificar `buildSystemPrompt()`, implementar cache |

---

## Segurança

- Todos os dados já são filtrados por `user_id` via RLS
- Clara só vê dados do próprio usuário autenticado
- Nenhum dado sensível (senhas, tokens) é incluído no contexto
- O contexto não é logado ou persistido

---

## Passos de Implementação

1. Criar função `buildUserContext()` com queries paralelas
2. Formatar contexto em texto legível para o LLM
3. Modificar `buildSystemPrompt()` para incluir contexto
4. Adicionar instruções de uso do contexto no prompt
5. Implementar cache de 5 minutos
6. Testar com diferentes perfis de usuário
7. Deploy da edge function

