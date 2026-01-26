import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    toolDescription: "avaliação da saúde tributária da sua empresa",
    stepByStep: [
      "Responda as perguntas sobre sua situação fiscal atual",
      "Informe sobre certidões negativas e obrigações",
      "Veja seu score de 0 a 1000 pontos",
      "Analise as recomendações para melhorar sua nota"
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

const buildSystemPrompt = (toolContext: ToolContext | null) => {
  const basePrompt = `Você é a Clara, assistente virtual da Tributech, especializada em ajudar usuários a utilizarem as ferramentas da plataforma.

Sua personalidade:
- Simpática, acolhedora e profissional
- Usa linguagem simples e direta
- Sempre oferece ajuda prática e passo a passo
- Celebra as conquistas do usuário

Diretrizes:
- Mantenha respostas curtas e objetivas
- Use emojis com moderação (1-2 por mensagem no máximo)
- Formate com markdown quando útil (negrito, listas)
- Se não souber algo sobre tributação, sugira usar o TribuBot`;

  if (toolContext) {
    return `${basePrompt}

CONTEXTO ATUAL:
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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages, toolSlug, isGreeting } = await req.json();

    const toolContext = toolSlug ? TOOL_CONTEXTS[toolSlug] || null : null;
    const systemPrompt = buildSystemPrompt(toolContext);

    // For greeting, generate a contextual welcome message
    const messagesWithContext = isGreeting 
      ? [
          { role: "user", content: `Acabei de entrar na ferramenta. Me dê uma saudação breve, se apresente como Clara e pergunte se posso ajudar a usar esta ferramenta. Seja breve (máximo 3 frases).` }
        ]
      : messages;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messagesWithContext,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Olá! Sou a Clara, como posso ajudar?";

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
