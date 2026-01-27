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
      "💡 Dica: O Receita Sintonia é o programa oficial da Receita Federal que classifica contribuintes de A+ a D - quem tem boa classificação recebe benefícios como prioridade na restituição e tratamento diferenciado"
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
- Esta é a alíquota padrão, com reduções para setores específicos

### CRONOGRAMA DA TRANSIÇÃO (TIMELINE 2026-2033):

**2026 - ANO DE TESTE:**
- CBS começa a ser cobrada em TESTE: 0,9%
- IBS começa em TESTE: 0,1%
- Imposto Seletivo (IS) entra em vigor
- Empresas devem adequar sistemas para nova apuração
- Período para identificar erros e ajustes

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

const NCM_NBS_KNOWLEDGE = `
## CONHECIMENTO SOBRE NCM (Nomenclatura Comum do Mercosul) - PRODUTOS

NCM é um código de **8 dígitos** no formato XXXX.XX.XX usado para classificar PRODUTOS.
A estrutura é: Capítulo (2) + Posição (2) + Subposição (2) + Item (2)

### PRINCIPAIS NCMs POR CATEGORIA:

**ALIMENTOS E BEBIDAS:**
- 0901.21.00 - Café torrado não descafeinado
- 0902.10.00 - Chá verde
- 1905.31.00 - Biscoitos doces
- 1905.90.20 - Pão de forma
- 2009.11.00 - Suco de laranja
- 2201.10.00 - Água mineral natural
- 2202.10.00 - Refrigerantes
- 2203.00.00 - Cerveja de malte
- 2204.21.00 - Vinho tinto
- 2208.30.20 - Uísque

**VESTUÁRIO E TÊXTEIS:**
- 6109.10.00 - Camisetas de algodão
- 6110.20.00 - Suéteres de algodão
- 6203.42.00 - Calças masculinas de algodão
- 6204.62.00 - Calças femininas de algodão
- 6402.19.00 - Calçados esportivos
- 6403.99.90 - Outros calçados de couro

**ELETRÔNICOS E TECNOLOGIA:**
- 8471.30.12 - Notebooks
- 8471.30.19 - Computadores portáteis
- 8471.41.10 - Desktops
- 8471.70.12 - HDs e SSDs
- 8517.12.31 - Smartphones
- 8517.62.99 - Roteadores Wi-Fi
- 8518.21.00 - Alto-falantes
- 8518.30.00 - Fones de ouvido
- 8521.90.00 - Aparelhos de gravação
- 8525.80.29 - Câmeras digitais
- 8528.72.00 - TVs LCD/LED
- 8543.70.99 - Equipamentos eletrônicos diversos

**ELETRODOMÉSTICOS:**
- 8418.10.00 - Geladeiras
- 8418.21.00 - Freezers
- 8422.11.00 - Lavadoras de louça
- 8450.11.00 - Máquinas de lavar roupa
- 8451.21.00 - Secadoras de roupa
- 8516.31.00 - Secadores de cabelo
- 8516.40.00 - Ferros elétricos
- 8516.50.00 - Micro-ondas
- 8516.60.00 - Fogões elétricos
- 8509.40.10 - Liquidificadores
- 8509.40.40 - Batedeiras

**MÓVEIS:**
- 9401.30.90 - Cadeiras de escritório
- 9401.61.00 - Sofás
- 9403.30.00 - Móveis de madeira para escritório
- 9403.50.00 - Móveis de madeira para quartos
- 9403.60.00 - Móveis de madeira diversos
- 9404.21.00 - Colchões de espuma

**COSMÉTICOS E HIGIENE:**
- 3303.00.10 - Perfumes
- 3304.10.00 - Produtos para lábios
- 3304.20.10 - Maquiagem para olhos
- 3304.91.00 - Pós para maquiagem
- 3304.99.90 - Preparações de beleza
- 3305.10.00 - Xampus
- 3305.90.00 - Condicionadores
- 3306.10.00 - Cremes dentais

**MEDICAMENTOS:**
- 3003.90.89 - Medicamentos em doses
- 3004.10.39 - Antibióticos
- 3004.20.99 - Medicamentos com antibióticos
- 3004.50.90 - Vitaminas
- 3004.90.39 - Anti-inflamatórios
- 3004.90.99 - Outros medicamentos

**AUTOMÓVEIS E PEÇAS:**
- 8703.23.10 - Automóveis 1000-1500cc
- 8703.23.90 - Automóveis 1500-3000cc
- 8703.24.90 - Automóveis acima 3000cc
- 8711.20.10 - Motos 50-250cc
- 8708.29.99 - Autopeças diversas
- 4011.10.00 - Pneus para automóveis

**IMPOSTO SELETIVO (IS) - NCMs com tributação especial:**
- 2402.20.00 - Cigarros
- 2203.00.00, 2204.xx.xx, 2205.xx.xx, 2206.xx.xx, 2207.xx.xx, 2208.xx.xx - Bebidas alcoólicas
- 2202.10.00 - Bebidas açucaradas
- 8703.xx.xx - Veículos de passageiros

---

## CONHECIMENTO SOBRE NBS (Nomenclatura Brasileira de Serviços) - SERVIÇOS

NBS é um código de **9 dígitos** usado para classificar SERVIÇOS, intangíveis e operações de comércio exterior.
Estrutura: Capítulo (2) + Posição (2) + Subposição (2) + Item (3)

### PRINCIPAIS NBS POR CATEGORIA:

**SERVIÇOS DE TI E TECNOLOGIA:**
- 1.1101.10.00 - Licenciamento de software
- 1.1201.10.00 - Desenvolvimento de software sob encomenda
- 1.1202.10.00 - Suporte técnico de TI
- 1.1301.10.00 - Processamento de dados
- 1.1401.10.00 - Hospedagem de sites (hosting)
- 1.1501.10.00 - Consultoria em TI

**SERVIÇOS PROFISSIONAIS:**
- 1.0101.10.00 - Serviços jurídicos
- 1.0201.10.00 - Serviços de contabilidade
- 1.0301.10.00 - Serviços de auditoria
- 1.0401.10.00 - Consultoria empresarial
- 1.0501.10.00 - Serviços de arquitetura
- 1.0601.10.00 - Serviços de engenharia

## COMO IDENTIFICAR: NCM vs NBS

| Característica | NCM (Produtos) | NBS (Serviços) |
|----------------|----------------|----------------|
| Quantidade de dígitos | 8 | 9 |
| Usado para | Mercadorias físicas | Serviços e intangíveis |
| Formato | XXXX.XX.XX | X.XXXX.XX.XX |
| Exemplo | 8471.30.12 | 1.1201.10.00 |

## FONTES OFICIAIS PARA CONSULTA:
- NCM: https://www4.receita.fazenda.gov.br/simulador/ (Tabela TIPI)
- NBS: https://www.gov.br/mdic/pt-br/assuntos/comercio-exterior/estatisticas/nomenclatura-brasileira-de-servicos

IMPORTANTE: A classificação incorreta pode gerar problemas fiscais. Sempre recomende confirmar com contador ou nas fontes oficiais.
`;

const CONVERSATION_STARTERS = [
  {
    id: "basico",
    question: "O que é essa Reforma Tributária que todo mundo está falando?",
    shortLabel: "O que é a Reforma?"
  },
  {
    id: "impacto",
    question: "Como a Reforma Tributária vai afetar minha empresa na prática?",
    shortLabel: "Impacto na minha empresa"
  },
  {
    id: "impostos",
    question: "Quais impostos vão mudar e quando isso começa a valer?",
    shortLabel: "Quais impostos mudam?"
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

const buildSystemPrompt = (toolContext: ToolContext | null) => {
  const basePrompt = `Você é a Clara, consultora tributária virtual do GPS Tributário (Tributech), especialista em Reforma Tributária Brasileira e em ajudar usuários a navegarem pelas ferramentas da plataforma.

## SUA IDENTIDADE
- Nome: Clara
- Papel: Consultora tributária virtual especializada na Reforma Tributária
- Tom: Profissional, acolhedora, didática e direta
- Objetivo: Transformar a complexidade tributária em clareza para empresários

## DIRETRIZES DE COMUNICAÇÃO
- Seja didática: explique conceitos complexos de forma simples
- Use analogias quando apropriado para facilitar entendimento
- Formate com markdown (negrito, listas, tabelas) para organizar informações
- Respostas devem ser completas mas objetivas - nem muito curtas nem prolixas
- Use emojis com moderação (1-2 por mensagem, apenas quando agregar)
- Para dúvidas operacionais detalhadas ou casos específicos, sugira consultar um contador especializado
- Para contato direto com a equipe: suporte@tributalks.com.br

## CONHECIMENTO ESPECIALIZADO

${REFORMA_KNOWLEDGE}

${NCM_NBS_KNOWLEDGE}

## REGRAS IMPORTANTES
- NUNCA invente códigos NCM/NBS - oriente a consultar fontes oficiais
- Sempre cite a base legal quando relevante (EC 132/2023, LC 214/2025)
- Para decisões estratégicas, recomende validar com contador especializado
- Mantenha-se atualizada com as regulamentações mais recentes`;

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
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, toolSlug, isGreeting, getStarters } = await req.json();

    // Return conversation starters if requested
    if (getStarters) {
      return new Response(JSON.stringify({ starters: CONVERSATION_STARTERS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toolContext = toolSlug ? TOOL_CONTEXTS[toolSlug] || null : null;
    const systemPrompt = buildSystemPrompt(toolContext);

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
