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

**CERÂMICA E LOUÇAS:**
- 6910.10.00 - Pias e lavatórios de porcelana
- 6910.90.00 - Outros artigos cerâmicos sanitários
- 6911.10.10 - Artigos de porcelana para mesa
- 6911.10.90 - Outros artigos de porcelana
- 6912.00.00 - Louça de cerâmica

**MATERIAIS DE CONSTRUÇÃO:**
- 2523.29.10 - Cimento Portland
- 6802.23.00 - Granito trabalhado
- 6907.21.00 - Pisos cerâmicos
- 6907.22.00 - Revestimentos cerâmicos
- 7213.10.00 - Vergalhões de aço
- 7308.90.90 - Estruturas metálicas

**IMPOSTO SELETIVO (IS) - NCMs com tributação especial:**
- 2402.20.00 - Cigarros
- 2203.00.00, 2204.xx.xx, 2205.xx.xx, 2206.xx.xx, 2207.xx.xx, 2208.xx.xx - Bebidas alcoólicas
- 2202.10.00 - Bebidas açucaradas
- 8703.xx.xx - Veículos de passageiros
- Minerais extraídos

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

**SERVIÇOS FINANCEIROS:**
- 1.2101.10.00 - Serviços bancários
- 1.2201.10.00 - Serviços de seguros
- 1.2301.10.00 - Corretagem de valores
- 1.2401.10.00 - Gestão de ativos

**SERVIÇOS DE COMUNICAÇÃO:**
- 1.0901.10.00 - Serviços de telecomunicações
- 1.0902.10.00 - Serviços de internet
- 1.0903.10.00 - Transmissão de dados

**SERVIÇOS DE MARKETING E PUBLICIDADE:**
- 1.0701.10.00 - Serviços de publicidade
- 1.0702.10.00 - Pesquisa de mercado
- 1.0703.10.00 - Serviços de design

**SERVIÇOS DE EDUCAÇÃO:**
- 1.1601.10.00 - Educação presencial
- 1.1602.10.00 - Educação a distância (EAD)
- 1.1603.10.00 - Treinamentos corporativos

**SERVIÇOS DE SAÚDE:**
- 1.1701.10.00 - Serviços médicos
- 1.1702.10.00 - Serviços odontológicos
- 1.1703.10.00 - Serviços de laboratório

**SERVIÇOS DE CONSTRUÇÃO:**
- 1.0801.10.00 - Construção de edificações
- 1.0802.10.00 - Instalações elétricas
- 1.0803.10.00 - Instalações hidráulicas

**SERVIÇOS DE TRANSPORTE:**
- 1.0801.20.00 - Transporte rodoviário de cargas
- 1.0802.20.00 - Transporte aéreo
- 1.0803.20.00 - Transporte marítimo

**SERVIÇOS DE TURISMO:**
- 1.2001.10.00 - Agências de viagem
- 1.2002.10.00 - Serviços de hospedagem
- 1.2003.10.00 - Serviços de alimentação

---

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

const buildSystemPrompt = (toolContext: ToolContext | null) => {
  const basePrompt = `Você é a Clara, assistente virtual do GPS Tributário (Tributech), especializada em ajudar usuários a utilizarem as ferramentas da plataforma.

Sua personalidade:
- Simpática, acolhedora e profissional
- Usa linguagem simples e direta
- Sempre oferece ajuda prática e passo a passo
- Celebra as conquistas do usuário

Diretrizes:
- Mantenha respostas curtas e objetivas
- Use emojis com moderação (1-2 por mensagem no máximo)
- Formate com markdown quando útil (negrito, listas)
- Se não souber algo sobre tributação, sugira usar o TribuBot
- Para contato direto com a equipe, oriente o usuário a enviar email para contato@tributalks.com.br
- NUNCA invente códigos NCM - sempre oriente o usuário a consultar fontes oficiais

${NCM_NBS_KNOWLEDGE}`;

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
