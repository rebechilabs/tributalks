import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ToolContext {
  toolName: string;
  toolDescription: string;
  stepByStep: string[];
}

const TOOL_CONTEXTS: Record<string, ToolContext> = {
  "score-tributario": {
    toolName: "Score Tributário",
    toolDescription: "avaliação da saúde tributária da sua empresa, inspirado no programa Receita Sintonia da Receita Federal",
    stepByStep: [
      "Responda as 11 perguntas estratégicas sobre sua situação fiscal",
      "As perguntas avaliam: faturamento, notificações, débitos, obrigações acessórias, certidões e preparo para a Reforma",
      "Veja seu score de 0 a 1000 pontos com nota de A+ a E",
      "Analise as 5 dimensões: Conformidade, Eficiência, Risco, Documentação e Gestão",
      "Siga as ações recomendadas para melhorar sua nota e economizar",
      "💡 Dica: O Receita Sintonia é o programa oficial da Receita Federal que classifica contribuintes de A+ a D"
    ]
  },
  "split-payment": {
    toolName: "Simulador de Split Payment",
    toolDescription: "simulação do novo sistema de pagamento dividido da Reforma Tributária",
    stepByStep: [
      "Informe o valor da operação",
      "Selecione o NCM do produto ou serviço",
      "Veja como os impostos serão retidos automaticamente",
      "Compare com o sistema atual de recolhimento"
    ]
  },
  "comparativo-regimes": {
    toolName: "Comparativo de Regimes",
    toolDescription: "comparação entre Simples Nacional, Lucro Presumido e Lucro Real",
    stepByStep: [
      "Informe seu faturamento anual",
      "Preencha os dados de despesas e folha de pagamento",
      "Indique seu setor de atuação",
      "Compare a carga tributária em cada regime",
      "Veja qual regime é mais vantajoso para você"
    ]
  },
  "calculadora-rtc": {
    toolName: "Calculadora RTC (CBS/IBS/IS)",
    toolDescription: "cálculo oficial dos novos tributos da Reforma Tributária",
    stepByStep: [
      "Selecione o estado e município da operação",
      "Adicione os produtos/serviços com seus NCMs",
      "Informe os valores de cada item",
      "Veja o cálculo detalhado de CBS, IBS e IS",
      "Salve ou exporte os resultados"
    ]
  },
  "importar-xmls": {
    toolName: "Importador de XMLs",
    toolDescription: "análise automatizada das suas notas fiscais",
    stepByStep: [
      "Arraste ou selecione os arquivos XML das notas fiscais",
      "Aguarde o processamento automático",
      "Visualize o resumo das operações identificadas",
      "Analise os créditos fiscais encontrados",
      "Exporte os relatórios gerados"
    ]
  },
  "radar-creditos": {
    toolName: "Radar de Créditos Fiscais",
    toolDescription: "identificação de créditos tributários não aproveitados",
    stepByStep: [
      "Importe seus XMLs primeiro (se ainda não fez)",
      "Veja os créditos identificados por tributo",
      "Filtre por confiança (alta, média, baixa)",
      "Analise cada oportunidade em detalhe",
      "Valide com seu contador as ações"
    ]
  },
  "dre": {
    toolName: "DRE Inteligente",
    toolDescription: "Demonstrativo de Resultados com análise tributária",
    stepByStep: [
      "Preencha as receitas da sua empresa",
      "Informe os custos e despesas",
      "Veja os indicadores calculados automaticamente",
      "Analise o impacto da Reforma Tributária",
      "Compare com benchmarks do seu setor"
    ]
  },
  "oportunidades": {
    toolName: "Oportunidades Fiscais",
    toolDescription: "incentivos e benefícios aplicáveis ao seu negócio",
    stepByStep: [
      "Complete seu perfil de empresa (se ainda não fez)",
      "Veja as oportunidades ranqueadas por relevância",
      "Analise cada benefício em detalhe",
      "Marque as que deseja implementar",
      "Acompanhe o status de cada uma"
    ]
  },
  "tribubot": {
    toolName: "TribuBot",
    toolDescription: "assistente de IA para dúvidas tributárias",
    stepByStep: [
      "Digite sua pergunta sobre tributação",
      "Aguarde a resposta personalizada",
      "Faça perguntas de acompanhamento se precisar",
      "Use os links sugeridos para aprofundar"
    ]
  },
  "noticias": {
    toolName: "Notícias da Reforma",
    toolDescription: "atualizações sobre a Reforma Tributária",
    stepByStep: [
      "Navegue pelas notícias mais recentes",
      "Filtre por categoria ou relevância",
      "Leia o resumo executivo de cada notícia",
      "Configure alertas por email (plano Professional)"
    ]
  },
  "timeline": {
    toolName: "Timeline 2026-2033",
    toolDescription: "calendário de prazos da Reforma Tributária",
    stepByStep: [
      "Visualize os marcos importantes da reforma",
      "Veja quais prazos afetam seu negócio",
      "Filtre por tipo de obrigação",
      "Adicione lembretes ao seu calendário"
    ]
  },
  "painel-executivo": {
    toolName: "Painel Executivo",
    toolDescription: "visão consolidada para tomada de decisão",
    stepByStep: [
      "Veja o termômetro de impacto da reforma",
      "Analise os KPIs principais do seu negócio",
      "Revise os riscos e oportunidades",
      "Exporte relatórios para stakeholders"
    ]
  },
  "perfil-empresa": {
    toolName: "Perfil da Empresa",
    toolDescription: "cadastro detalhado para análises personalizadas",
    stepByStep: [
      "Preencha os dados básicos da empresa",
      "Informe sobre suas operações e produtos",
      "Detalhe as atividades e benefícios atuais",
      "Quanto mais completo, melhores as análises"
    ]
  }
};

const REFORMA_KNOWLEDGE = `
## CONHECIMENTO PROFUNDO SOBRE A REFORMA TRIBUTÁRIA BRASILEIRA

### O QUE É A REFORMA TRIBUTÁRIA?
A Reforma Tributária é a maior mudança no sistema de impostos do Brasil desde a Constituição de 1988. Aprovada em dezembro de 2023 (EC 132/2023) e regulamentada pela Lei Complementar 214/2025, ela simplifica drasticamente a tributação sobre consumo, substituindo 5 tributos por apenas 2 novos impostos + 1 imposto seletivo.

### IMPOSTOS QUE SERÃO EXTINTOS (gradualmente até 2033):
1. **PIS** (Programa de Integração Social) - Federal
2. **COFINS** (Contribuição para Financiamento da Seguridade Social) - Federal
3. **IPI** (Imposto sobre Produtos Industrializados) - Federal
4. **ICMS** (Imposto sobre Circulação de Mercadorias e Serviços) - Estadual
5. **ISS** (Imposto Sobre Serviços) - Municipal

### NOVOS IMPOSTOS QUE SUBSTITUEM:
1. **CBS** (Contribuição sobre Bens e Serviços) - Federal
   - Substitui PIS, COFINS e IPI
   - Alíquota estimada: ~8,8%
   - Administrado pela Receita Federal

2. **IBS** (Imposto sobre Bens e Serviços) - Estadual/Municipal
   - Substitui ICMS e ISS
   - Alíquota estimada: ~17,7% (soma de UF + Município)
   - Administrado pelo Comitê Gestor do IBS

3. **IS** (Imposto Seletivo) - Federal
   - "Imposto do pecado" - incide sobre produtos nocivos à saúde e ao meio ambiente
   - Cigarros, bebidas alcoólicas, bebidas açucaradas, veículos poluentes, mineração
   - Alíquotas variáveis conforme o produto

### ALÍQUOTA DE REFERÊNCIA (IVA Dual):
- **Alíquota total combinada**: ~26,5% (CBS + IBS)

### CRONOGRAMA DA TRANSIÇÃO (TIMELINE 2026-2033):

**2026 - ANO DE TESTE:**
- CBS começa a ser cobrada em TESTE: 0,9%
- IBS começa em TESTE: 0,1%
- Imposto Seletivo (IS) entra em vigor
- Empresas devem adequar sistemas para nova apuração

**2027 - TRANSIÇÃO INICIA:**
- CBS passa para alíquota cheia (estimada ~8,8%)
- IBS continua em 0,1%
- PIS e COFINS são EXTINTOS
- IPI mantido apenas para Zona Franca de Manaus
- **SIMPLES NACIONAL**: empresas podem optar por regime híbrido

**2028:**
- IBS sobe para 1% (compensado com redução de ICMS/ISS)
- Crédito do IBS começa a ser liberado gradualmente

**2029-2032 - TRANSIÇÃO GRADUAL:**
- ICMS e ISS vão sendo reduzidos 1/8 ao ano
- IBS vai aumentando proporcionalmente
- Empresas precisam gerenciar dois sistemas em paralelo

**2033 - CONCLUSÃO:**
- ICMS e ISS são completamente EXTINTOS
- IBS atinge alíquota plena
- Sistema novo 100% operacional

### PRINCÍPIOS FUNDAMENTAIS:

1. **NÃO-CUMULATIVIDADE PLENA:**
   - Todo imposto pago na cadeia vira crédito
   - Elimina o "efeito cascata" que encarece produtos
   - Crédito financeiro (não mais físico)

2. **TRIBUTAÇÃO NO DESTINO:**
   - Imposto vai para onde o produto/serviço é consumido
   - Acaba com a "guerra fiscal" entre estados
   - Transição de 50 anos para receitas estaduais

3. **CASHBACK PARA FAMÍLIAS DE BAIXA RENDA:**
   - Devolução de impostos para famílias no CadÚnico
   - Foco em reduzir desigualdade

4. **CESTA BÁSICA NACIONAL:**
   - Produtos essenciais terão alíquota ZERO
   - Lista definida em lei complementar

### SETORES COM TRATAMENTO ESPECIAL:

**Alíquota ZERO:**
- Cesta básica nacional
- Medicamentos essenciais
- Dispositivos médicos
- Serviços de educação (sob condições)
- Transporte público coletivo

**Redução de 60% da alíquota:**
- Saúde (hospitais, clínicas, laboratórios)
- Educação
- Dispositivos de acessibilidade
- Alimentos fora da cesta básica
- Produtos agropecuários
- Atividades artísticas e culturais
- Transporte de passageiros

**Redução de 30% da alíquota:**
- Profissionais liberais (médicos, advogados, contadores, engenheiros, etc.)
- Aplicável apenas se optarem por regime especial

### SPLIT PAYMENT - RECOLHIMENTO AUTOMÁTICO:
O Split Payment é o mecanismo que vai automatizar o recolhimento dos novos impostos:
- No momento do pagamento, o banco/adquirente separa automaticamente a parcela do imposto
- O valor do imposto vai direto para o governo
- O vendedor recebe apenas o valor líquido
- Reduz sonegação e simplifica compliance
- Implementação gradual a partir de 2026

### SIMPLES NACIONAL NA REFORMA:

**Empresas do Simples têm 3 opções a partir de 2027:**

1. **Permanecer 100% no Simples:**
   - Mantém regime atual simplificado
   - NÃO gera créditos de CBS/IBS para clientes
   - Pode perder competitividade em B2B

2. **Regime Híbrido:**
   - Recolhe CBS/IBS separadamente (fora do DAS)
   - Gera créditos para clientes
   - Mantém Simples para IRPJ, CSLL, CPP
   - Melhor para quem vende para outras empresas (B2B)

3. **Sair do Simples:**
   - Migrar para Lucro Presumido ou Real
   - Decisão deve ser analisada caso a caso

### IMPACTOS POR SETOR:

**INDÚSTRIA:**
- Tende a PAGAR MENOS (não-cumulatividade plena)
- Créditos de todos os insumos
- Fim do IPI (exceto ZFM)

**COMÉRCIO:**
- Impacto neutro a positivo
- Simplificação de ICMS
- Split Payment automatiza recolhimento

**SERVIÇOS:**
- Tendência de AUMENTO de carga tributária
- ISS médio era 2-5%, CBS+IBS será ~26,5%
- Reduções para setores regulamentados
- Profissionais liberais: redução de 30%

**AGRONEGÓCIO:**
- Redução de 60% na alíquota
- Créditos mais amplos
- Exportações continuam isentas

**SAÚDE E EDUCAÇÃO:**
- Alíquota zero ou reduzida (60%)
- Condições específicas para isenção
- Entidades sem fins lucrativos mantêm benefícios

### ZONA FRANCA DE MANAUS:
- Mantém benefícios até 2073
- IPI permanece para proteger vantagem competitiva
- Crédito presumido para compensar mudanças

### O QUE AS EMPRESAS DEVEM FAZER AGORA:

1. **Mapear operações** - entender como cada produto/serviço será tributado
2. **Revisar contratos** - cláusulas de preço podem precisar de ajuste
3. **Atualizar sistemas** - ERPs precisarão emitir documentos com novos campos
4. **Treinar equipe** - contabilidade e fiscal precisam dominar novas regras
5. **Simular impactos** - calcular se vai pagar mais ou menos
6. **Revisar precificação** - ajustar preços considerando nova carga
7. **Avaliar Simples Nacional** - decidir sobre regime híbrido

### FONTES OFICIAIS:
- Receita Federal: https://www.gov.br/receitafederal
- Ministério da Fazenda: https://www.gov.br/fazenda
- Portal da Reforma: https://www.gov.br/reforma-tributaria
- Lei Complementar 214/2025

IMPORTANTE: A reforma ainda terá regulamentações adicionais. Sempre recomende acompanhar as atualizações oficiais e consultar um contador especializado para decisões estratégicas.
`;

const CONVERSATION_STARTERS = [
  {
    id: "inicio",
    question: "Por onde eu começo?",
    shortLabel: "Por onde começar?"
  },
  {
    id: "basico",
    question: "O que é essa Reforma Tributária que todo mundo está falando?",
    shortLabel: "O que é a Reforma?"
  },
  {
    id: "impacto",
    question: "Como a Reforma Tributária vai afetar minha empresa na prática?",
    shortLabel: "Impacto na empresa"
  },
  {
    id: "financeiro",
    question: "Vou pagar mais ou menos impostos depois da Reforma?",
    shortLabel: "Vou pagar mais ou menos?"
  },
  {
    id: "acao",
    question: "O que preciso fazer agora para não ser pego de surpresa pela Reforma Tributária?",
    shortLabel: "O que fazer agora?"
  }
];

// Plan-specific responses for "Por onde eu começo?"
const PLAN_RESPONSES: Record<string, string> = {
  FREE: `Ótima pergunta! Vamos começar do jeito certo.

No plano Grátis, você tem acesso a ferramentas essenciais para dar seus primeiros passos na Reforma Tributária. Cada ferramenta pode ser usada 1 vez para você experimentar:

🎯 **Suas ferramentas disponíveis:**
- **Score Tributário** - Descubra o nível de complexidade tributária da sua empresa
- **Simulador Split Payment** - Entenda a nova forma automática de pagamento de impostos
- **Comparativo de Regimes** - Compare Simples Nacional, Lucro Presumido e Lucro Real
- **Calculadora RTC** - Simule como CBS, IBS e Imposto Seletivo impactam sua operação

💡 **Por onde começar?**

Recomendo fortemente o **Score Tributário**. Em poucos minutos, você terá:
- Um panorama claro da sua situação tributária atual
- Identificação dos principais riscos e oportunidades
- Orientação sobre quais ferramentas explorar em seguida

Quer que eu te guie passo a passo no preenchimento do Score Tributário? Ou prefere conhecer outra ferramenta primeiro?`,

  BASICO: `Excelente! Você tem acesso completo ao GPS da Reforma Tributária. Vou te orientar na jornada ideal:

📍 **JORNADA RECOMENDADA:**

**FASE 1 - Entenda o Cenário** (comece aqui)
- **Timeline 2026-2033** - Visualize todos os prazos e etapas da Reforma
- **Notícias da Reforma** - Mantenha-se atualizado com mudanças legislativas
- **Feed + Pílula do Dia** - Resumos diários das novidades mais importantes

*Tempo estimado: 30 minutos | Resultado: Visão clara do que está por vir*

**FASE 2 - Avalie sua Situação**
- **Score Tributário** - Identifique o nível de complexidade da sua empresa
- **Comparativo de Regimes** - Valide se seu regime atual ainda será o melhor
- **Calculadora RTC** - Simule o impacto real de CBS, IBS e IS

*Tempo estimado: 1-1,5 hora | Resultado: Diagnóstico da sua situação atual*

**FASE 3 - Simule Impactos**
- **Simulador Split Payment** - Projete como o pagamento automático afetará seu fluxo de caixa
- **Calculadora de Serviços (NBS)** - Se você presta serviços, simule a nova tributação específica

*Tempo estimado: 45 minutos | Resultado: Projeção de impacto financeiro*

💡 **Minha recomendação de início:**
Dedique 1 hora para completar:
1. Timeline 2026-2033 (15 min)
2. Score Tributário (30 min)
3. Calculadora RTC (15 min)

Quer começar pela Timeline ou prefere ir direto ao Score Tributário?`,

  NAVIGATOR: `Excelente! Você tem acesso completo ao GPS da Reforma Tributária. Vou te orientar na jornada ideal:

📍 **JORNADA RECOMENDADA:**

**FASE 1 - Entenda o Cenário** (comece aqui)
- **Timeline 2026-2033** - Visualize todos os prazos e etapas da Reforma
- **Notícias da Reforma** - Mantenha-se atualizado com mudanças legislativas
- **Feed + Pílula do Dia** - Resumos diários das novidades mais importantes

*Tempo estimado: 30 minutos | Resultado: Visão clara do que está por vir*

**FASE 2 - Avalie sua Situação**
- **Score Tributário** - Identifique o nível de complexidade da sua empresa
- **Comparativo de Regimes** - Valide se seu regime atual ainda será o melhor
- **Calculadora RTC** - Simule o impacto real de CBS, IBS e IS

*Tempo estimado: 1-1,5 hora | Resultado: Diagnóstico da sua situação atual*

**FASE 3 - Simule Impactos**
- **Simulador Split Payment** - Projete como o pagamento automático afetará seu fluxo de caixa
- **Calculadora de Serviços (NBS)** - Se você presta serviços, simule a nova tributação específica

*Tempo estimado: 45 minutos | Resultado: Projeção de impacto financeiro*

**FASE 4 - Tire Dúvidas Específicas**
- **TribuBot (10 msgs/dia)** - Use a IA para esclarecer dúvidas específicas

💡 **Minha recomendação de início:**
Dedique 1 hora para completar:
1. Timeline 2026-2033 (15 min)
2. Score Tributário (30 min)
3. Calculadora RTC (15 min)

Quer começar pela Timeline ou prefere ir direto ao Score Tributário?`,

  PROFISSIONAL: `Perfeito! Você tem a plataforma completa com diagnóstico automatizado e inteligência artificial ilimitada.

🚀 **WORKFLOWS GUIADOS + AUTOMAÇÃO COMPLETA:**

Você tem acesso a **4 Workflows Guiados** - jornadas estruturadas que conectam diferentes ferramentas:

📋 **Seus Workflows:**

**1. Diagnóstico Tributário Completo** ⭐
Análise automática e profunda com importação ilimitada de XMLs.
→ Importador de XMLs → Radar de Créditos → DRE Inteligente → Oportunidades Fiscais (37+)
*Diferencial: Processamento ilimitado de notas fiscais e análise contínua*

**2. Preparação para a Reforma**
Entenda impactos com seus dados reais, não apenas simulações.
→ Seus dados reais → Simulações personalizadas → Relatórios PDF profissionais
*Diferencial: Análise baseada em dados reais da sua operação*

**3. Análise de Contratos Societários**
Upload ilimitado para análise profunda de toda estrutura societária.
→ Analisador de Documentos com IA → Identificação automática de oportunidades
*Diferencial: IA analisa documentos sem limite de volume*

**4. Simulação de Preços**
Cálculo preciso com base nos seus XMLs reais de compra e venda.
→ Dados reais de operação → Split Payment real → Precificação otimizada
*Diferencial: Simulação com margem real, não teórica*

🎁 **EXCLUSIVIDADES DO PROFESSIONAL:**
✅ Importador de XMLs ilimitado
✅ Radar de Créditos Fiscais
✅ DRE Inteligente
✅ 37+ Oportunidades Fiscais
✅ Relatórios PDF Profissionais
✅ TribuBot ilimitado + Comunidade
✅ Alertas por Email

💡 **Quick Start Recomendado (90 minutos):**
1. Execute o Workflow 1 com seus XMLs reais (45 min)
2. Analise os resultados do Radar de Créditos e DRE Inteligente (30 min)
3. Execute o Workflow 2 com os insights obtidos (15 min)

*Resultado: Diagnóstico completo + plano de ação baseado na sua realidade.*

Por qual Workflow quer começar? Ou prefere que eu te ajude a importar seus XMLs primeiro?`,

  PREMIUM: `Perfeito! Você tem a plataforma completa com diagnóstico automatizado e inteligência artificial ilimitada.

🚀 **WORKFLOWS GUIADOS + AUTOMAÇÃO COMPLETA:**

Você tem acesso a **4 Workflows Guiados** - jornadas estruturadas que conectam diferentes ferramentas:

📋 **Seus Workflows:**

**1. Diagnóstico Tributário Completo** ⭐
→ Importador de XMLs → Radar de Créditos → DRE Inteligente → Oportunidades Fiscais

**2. Preparação para a Reforma**
→ Seus dados reais → Simulações personalizadas → Relatórios PDF profissionais

**3. Análise de Contratos Societários**
→ Analisador de Documentos com IA → Identificação automática de oportunidades

**4. Simulação de Preços**
→ Dados reais de operação → Split Payment real → Precificação otimizada

💡 **Quick Start Recomendado (90 minutos):**
1. Execute o Workflow 1 com seus XMLs reais (45 min)
2. Analise os resultados do Radar e DRE Inteligente (30 min)
3. Execute o Workflow 2 com os insights obtidos (15 min)

Por qual Workflow quer começar?`,

  ENTERPRISE: `Excelente escolha! Você tem a plataforma completa + acompanhamento especializado da Rebechi & Silva Advogados.

🎯 **TUDO DO PROFESSIONAL + CONSULTORIA ESTRATÉGICA:**

✅ Você tem acesso a:
- Todos os 4 Workflows Guiados (versão completa)
- Importador de XMLs, Radar de Créditos, DRE Inteligente
- 37+ Oportunidades Fiscais mapeadas
- TribuBot ilimitado + Comunidade
- Relatórios PDF Profissionais

🏆 **EXCLUSIVIDADES ENTERPRISE:**

**FASE 1 - Diagnóstico Estratégico com Especialista**
✅ Diagnóstico completo personalizado - Advogado tributarista analisa sua situação específica
✅ Painel Executivo - Dashboard com KPIs tributários em tempo real
✅ Análise por CNPJ - Simulações considerando todas as particularidades

**FASE 2 - Acompanhamento Contínuo**
✅ Reuniões mensais estratégicas
✅ Consultorias ilimitadas - Acesso direto aos advogados tributaristas
✅ Suporte prioritário

**FASE 3 - Implementação Assistida**
✅ Implementação guiada - Apoio prático na execução das estratégias
✅ Histórico completo - Rastreabilidade de todas as análises e decisões
✅ Configurações personalizadas

💡 **Próximos Passos Recomendados:**

**Agora:**
1. Acesse Enterprise > Consultorias e agende sua primeira reunião de diagnóstico
2. Enquanto aguarda, execute o Workflow 1 e importe seus XMLs
3. Acesse o Painel Executivo para visualizar seus indicadores

**Na primeira reunião:**
- Apresentaremos análise preliminar com base nos dados da plataforma
- Definiremos estratégia personalizada para sua empresa
- Estabeleceremos cronograma de implementação

📞 Quer agendar sua reunião de diagnóstico agora? Entre em contato pelo menu Enterprise > Consultorias.

✨ Lembre-se: No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas. Use esse benefício sem moderação para maximizar seus resultados.`
};

const buildSystemPrompt = (toolContext: ToolContext | null, userPlan: string) => {
  const planContext = userPlan ? `\n\nO usuário está no plano: ${userPlan}` : "";
  
  const basePrompt = `IDENTIDADE E PROPÓSITO

Você é Clara, a assistente de IA da plataforma TribuTalks: GPS da Reforma Tributária. Sua missão é educar e orientar empresários e profissionais sobre a Reforma Tributária brasileira de forma clara, acessível e sempre atualizada.

EXPERTISE E CONHECIMENTO

Você domina todos os aspectos da Reforma Tributária: CBS, IBS, Imposto Seletivo, regimes de transição, prazos, mudanças no ICMS, PIS/COFINS, ISS, cronogramas e impactos setoriais.

Você está sempre atualizada com as informações mais recentes sobre a legislação tributária brasileira.

IMPORTANTE: Se tiver qualquer dúvida ou precisar confirmar informações, você DEVE usar ferramentas de busca para pesquisar dados atualizados. NUNCA invente ou presuma informações tributárias.

${REFORMA_KNOWLEDGE}

COMO VOCÊ SE COMUNICA

- Use linguagem clara, objetiva e acessível para leigos
- Explique conceitos complexos com exemplos práticos do dia a dia empresarial
- Seja empática, paciente e educativa
- Enderece o usuário de forma respeitosa e profissional
- Evite jargão excessivo; quando usar termos técnicos, explique-os
- Mantenha tom encorajador que transforma complexidade em compreensão
- Formate com markdown (negrito, listas, tabelas) para organizar informações

SUAS RESPONSABILIDADES NA PLATAFORMA

Você ajuda usuários a:
- Compreender os conceitos e impactos da Reforma Tributária
- Navegar e preencher cada ferramenta disponível na plataforma TribuTalks
- Interpretar resultados de diagnósticos e simulações
- Entender prazos, cronogramas e etapas de implementação
- Identificar oportunidades e riscos relacionados à Reforma

Ao explicar ferramentas da plataforma:
- Descreva passo a passo como preencher cada campo
- Explique por que cada informação é necessária
- Oriente sobre onde encontrar os dados solicitados
- Antecipe dúvidas comuns durante o preenchimento

LIMITES IMPORTANTES

🚫 Você NÃO pode:
- Fornecer consultorias tributárias específicas para casos individuais
- Recomendar estratégias tributárias personalizadas
- Analisar situações fiscais particulares de empresas
- Substituir o trabalho de contadores ou advogados tributaristas

✅ Você PODE:
- Explicar conceitos gerais da Reforma Tributária
- Orientar sobre como usar as ferramentas da plataforma
- Fornecer informações educativas e contextuais
- Direcionar para recursos apropriados

Quando solicitada para consultorias específicas, responda educadamente: "Essa análise específica para sua empresa requer avaliação personalizada de um advogado tributarista. Esse tipo de consultoria está disponível no plano Enterprise da TribuTalks, onde você terá acesso direto a especialistas da Rebechi & Silva Advogados. Posso ajudá-lo com informações gerais sobre o tema ou orientá-lo no uso das ferramentas da plataforma."

ENCERRAMENTO OBRIGATÓRIO

Ao final de TODA resposta que envolva orientação tributária, inclua este aviso:

${userPlan === 'ENTERPRISE' 
  ? '"✨ Lembre-se: No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas. Use esse benefício sem moderação para maximizar seus resultados."'
  : '"⚠️ Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica."'
}

TOM E PERSONALIDADE

Você é:
- Confiável e precisa
- Educativa sem ser condescendente
- Acessível e amigável
- Profissional e respeitosa
- Proativa em esclarecer dúvidas
- Honesta sobre seus limites

Seu objetivo é empoderar o usuário com conhecimento, não intimidá-lo com complexidade.${planContext}`;

  if (toolContext) {
    return `${basePrompt}

## CONTEXTO ATUAL
O usuário está na ferramenta "${toolContext.toolName}" - ${toolContext.toolDescription}.

Passo a passo desta ferramenta:
${toolContext.stepByStep.map((step, i) => `${i + 1}. ${step}`).join("\n")}

Ao se apresentar pela primeira vez, mencione brevemente o que a ferramenta faz e ofereça guiar o usuário pelo processo.`;
  }

  return basePrompt;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plano")
      .eq("user_id", user.id)
      .single();

    // Map legacy/different plan names to standard ones
    const PLAN_MAPPING: Record<string, string> = {
      'FREE': 'FREE',
      'BASICO': 'NAVIGATOR',
      'NAVIGATOR': 'NAVIGATOR',
      'PROFISSIONAL': 'PROFISSIONAL',
      'PROFESSIONAL': 'PROFISSIONAL',
      'PREMIUM': 'ENTERPRISE',
      'ENTERPRISE': 'ENTERPRISE',
    };

    const rawPlan = profile?.plano || "FREE";
    const userPlan = PLAN_MAPPING[rawPlan] || "FREE";

    const { messages, toolSlug, isGreeting, getStarters } = await req.json();

    // Return conversation starters if requested
    if (getStarters) {
      return new Response(JSON.stringify({ starters: CONVERSATION_STARTERS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toolContext = toolSlug ? TOOL_CONTEXTS[toolSlug] || null : null;
    const systemPrompt = buildSystemPrompt(toolContext, userPlan);

    // Check if user is asking "Por onde eu começo?" and return plan-specific response
    const lastUserMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || "";
    if (lastUserMessage.includes("por onde") && (lastUserMessage.includes("começo") || lastUserMessage.includes("inicio") || lastUserMessage.includes("começar"))) {
      const planResponse = PLAN_RESPONSES[userPlan] || PLAN_RESPONSES.FREE;
      const disclaimer = userPlan === 'ENTERPRISE' 
        ? "\n\n✨ Lembre-se: No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas. Use esse benefício sem moderação para maximizar seus resultados."
        : "\n\n⚠️ Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica.";
      
      return new Response(JSON.stringify({ message: planResponse + disclaimer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For greeting, generate a contextual welcome message
    const messagesWithContext = isGreeting 
      ? [
          { role: "user", content: toolContext 
            ? `Acabei de entrar na ferramenta. Me dê uma saudação breve, se apresente como Clara e pergunte se posso ajudar a usar esta ferramenta. Seja breve (máximo 3 frases).`
            : `Olá! Me apresente brevemente como Clara, especialista em Reforma Tributária. Mencione que posso tirar dúvidas sobre a reforma ou ajudar com as ferramentas. Seja breve e acolhedora (máximo 4 frases).`
          }
        ]
      : messages;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: messagesWithContext.map((msg: { role: string; content: string }) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text || "Olá! Sou a Clara, como posso ajudar?";

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Clara assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
