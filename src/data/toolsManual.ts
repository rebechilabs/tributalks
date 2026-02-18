// Base de conhecimento de ferramentas da plataforma TribuTalks
// Usado pela Clara AI (ajuda contextual) e pela página de Manual do Usuário

export interface ToolField {
  name: string;
  description: string;
  example?: string;
  tips?: string;
}

export interface ToolManualEntry {
  slug: string;
  name: string;
  icon: string; // lucide icon name
  category: "entender" | "simular" | "diagnosticar" | "comandar" | "extras";
  shortDescription: string;
  fullDescription: string;
  whenToUse: string[];
  howItWorks: string[];
  fields?: ToolField[];
  outputDescription: string;
  nextSteps?: string[];
  minPlan: "FREE" | "STARTER" | "NAVIGATOR" | "PROFESSIONAL" | "ENTERPRISE";
  videoUrl?: string;
}

export const TOOLS_MANUAL: ToolManualEntry[] = [
  // ============ ETAPA 1: ENTENDER ============
  {
    slug: "score-tributario",
    name: "Score Tributário",
    icon: "Target",
    category: "entender",
    minPlan: "FREE",
    shortDescription: "Avalie o nível de complexidade tributária da sua empresa em minutos.",
    fullDescription: `O Score Tributário é sua primeira parada na jornada tributária. Ele analisa 11 perguntas estratégicas sobre sua empresa e gera uma nota de A a E, indicando seu nível de risco e oportunidade fiscal.

Diferente de ferramentas técnicas, o Score foca no perfil do negócio: faturamento, regime tributário, operações interestaduais, e sua prontidão para a Reforma Tributária.`,
    whenToUse: [
      "Você quer entender rapidamente sua situação tributária",
      "Precisa de um diagnóstico inicial antes de usar outras ferramentas",
      "Quer comparar sua empresa com a média do setor (benchmark)"
    ],
    howItWorks: [
      "Responda 11 perguntas sobre sua empresa (5-10 minutos)",
      "O sistema calcula sua nota baseado em benchmarks do setor",
      "Você recebe um relatório com pontos fortes e fracos",
      "O histórico permite acompanhar evolução ao longo do tempo"
    ],
    fields: [
      {
        name: "Faturamento Anual",
        description: "Receita bruta anual da empresa",
        example: "R$ 5.000.000",
        tips: "Use o valor do último exercício fiscal completo"
      },
      {
        name: "Regime Tributário",
        description: "Simples Nacional, Lucro Presumido ou Lucro Real",
        tips: "Verifique com seu contador se tiver dúvida"
      },
      {
        name: "Receita Sintonia",
        description: "Classificação da empresa perante a Receita Federal (A+ a D)",
        tips: "Acesse o e-CAC para verificar sua classificação atual"
      },
      {
        name: "Prontidão para Reforma",
        description: "Nível de preparação para as mudanças de 2026",
        tips: "Avalie se já estudou a LC 214/2025"
      }
    ],
    outputDescription: "Nota de A a E com relatório detalhado, benchmark setorial e recomendações de próximos passos.",
    nextSteps: ["calculadora-rtc", "comparativo-regimes", "dre"]
  },

  {
    slug: "timeline",
    name: "Timeline da Reforma",
    icon: "Calendar",
    category: "entender",
    minPlan: "FREE",
    shortDescription: "Visualize todos os prazos e marcos da Reforma Tributária de 2026 a 2033.",
    fullDescription: `A Timeline da Reforma é seu calendário estratégico. Ela mapeia todos os prazos importantes da transição tributária brasileira, desde a entrada do CBS em 2026 até a extinção completa de PIS/COFINS em 2033.

Cada marco inclui base legal (LC 214/2025), impacto esperado e ações recomendadas para sua empresa.`,
    whenToUse: [
      "Quer saber o que muda e quando",
      "Precisa planejar adaptações no sistema fiscal",
      "Quer antecipar obrigações e evitar multas"
    ],
    howItWorks: [
      "Visualize a timeline completa em formato visual",
      "Filtre por regime tributário para ver o que te impacta",
      "Clique em cada evento para ver detalhes e base legal",
      "Ative alertas para ser notificado antes dos prazos"
    ],
    outputDescription: "Timeline visual interativa com marcos legais, contagem regressiva e ações recomendadas.",
    nextSteps: ["noticias", "checklist-reforma"]
  },

  {
    slug: "noticias",
    name: "Notícias da Reforma",
    icon: "Newspaper",
    category: "entender",
    minPlan: "NAVIGATOR",
    shortDescription: "Acompanhe as últimas atualizações legislativas e regulamentações da Reforma.",
    fullDescription: `O feed de Notícias da Reforma consolida as informações mais relevantes sobre a transição tributária brasileira, filtrando ruído e destacando o que realmente impacta seu negócio.

Inclui análises de especialistas, alertas sobre mudanças legislativas e a "Pílula do Dia" - um resumo diário em 1 minuto.`,
    whenToUse: [
      "Quer se manter atualizado sobre mudanças legislativas",
      "Precisa de análises técnicas sobre novas regulamentações",
      "Quer receber resumos diários sem precisar ler tudo"
    ],
    howItWorks: [
      "Acesse o feed atualizado diariamente",
      "Filtre por setor ou regime tributário",
      "Leia a Pílula do Dia para resumo rápido",
      "Configure alertas por email para temas específicos"
    ],
    outputDescription: "Feed de notícias curado, alertas personalizados e resumos diários (Pílula do Dia).",
    nextSteps: ["timeline", "split-payment"]
  },

  // ============ ETAPA 2: SIMULAR ============
  {
    slug: "split-payment",
    name: "Simulador Split Payment",
    icon: "Split",
    category: "simular",
    minPlan: "FREE",
    shortDescription: "Entenda como o pagamento automático de impostos afetará seu fluxo de caixa.",
    fullDescription: `O Split Payment é a maior mudança operacional da Reforma Tributária. A partir de 2026, o imposto será retido automaticamente no momento do pagamento, antes de chegar ao seu caixa.

Este simulador mostra exatamente quanto você receberá líquido em cada transação e como isso impacta seu capital de giro.`,
    whenToUse: [
      "Quer entender o impacto no seu fluxo de caixa",
      "Precisa reprojetar capital de giro para 2026",
      "Quer simular cenários de transição"
    ],
    howItWorks: [
      "Informe o valor bruto da operação",
      "Selecione a UF de origem e destino",
      "Escolha o regime tributário",
      "Veja a divisão: quanto você recebe vs quanto vai para impostos"
    ],
    fields: [
      {
        name: "Valor da Operação",
        description: "Valor bruto da venda ou prestação de serviço",
        example: "R$ 10.000,00",
        tips: "Use valores típicos da sua operação para projeções realistas"
      },
      {
        name: "UF Origem",
        description: "Estado onde a operação é realizada",
        tips: "Onde sua empresa está sediada"
      },
      {
        name: "UF Destino",
        description: "Estado do cliente/destinatário",
        tips: "Para vendas locais, use a mesma UF"
      },
      {
        name: "Tipo de Operação",
        description: "Venda de produto ou prestação de serviço",
        tips: "Alíquotas diferem entre produtos e serviços"
      }
    ],
    outputDescription: "Demonstrativo visual: valor bruto → impostos retidos automaticamente → valor líquido recebido.",
    nextSteps: ["comparativo-regimes", "calculadora-rtc"]
  },

  {
    slug: "comparativo-regimes",
    name: "Comparativo de Regimes",
    icon: "Scale",
    category: "simular",
    minPlan: "FREE",
    shortDescription: "Compare Simples Nacional, Lucro Presumido e Lucro Real para 2026+.",
    fullDescription: `A Reforma Tributária muda completamente a lógica de escolha de regime. O que era vantajoso hoje pode não ser em 2026.

Este comparativo simula os três regimes com as novas alíquotas de CBS/IBS, considerando créditos tributários e a nova sistemática de não-cumulatividade.`,
    whenToUse: [
      "Está avaliando mudar de regime tributário",
      "Quer saber se o Simples ainda compensa após 2026",
      "Precisa simular o impacto da não-cumulatividade plena"
    ],
    howItWorks: [
      "Informe faturamento e custos mensais",
      "Indique se vende para PJ ou PF",
      "Veja a comparação lado a lado dos 3 regimes",
      "Identifique o regime mais vantajoso para seu perfil"
    ],
    fields: [
      {
        name: "Faturamento Mensal",
        description: "Receita bruta média mensal",
        example: "R$ 250.000",
        tips: "Use média dos últimos 12 meses para maior precisão"
      },
      {
        name: "Custos com Insumos",
        description: "Valor gasto com fornecedores que geram crédito tributário",
        example: "R$ 100.000",
        tips: "Inclua apenas custos de fornecedores que emitem NF"
      },
      {
        name: "Folha de Pagamento",
        description: "Total de salários + encargos",
        example: "R$ 50.000",
        tips: "Importante para cálculo do Fator R no Simples"
      },
      {
        name: "Perfil de Clientes",
        description: "Percentual de vendas para PJ vs PF",
        tips: "Vendas para PJ geram crédito para o cliente"
      }
    ],
    outputDescription: "Tabela comparativa com carga tributária efetiva de cada regime + recomendação.",
    nextSteps: ["calculadora-rtc", "dre"]
  },

  {
    slug: "calculadora-rtc",
    name: "Calculadora RTC (NCM)",
    icon: "Calculator",
    category: "simular",
    minPlan: "FREE",
    shortDescription: "Calcule CBS, IBS e Imposto Seletivo para qualquer NCM.",
    fullDescription: `A Calculadora RTC (Reforma Tributária Calculadora) integra diretamente com a API oficial do governo (piloto-cbs.tributos.gov.br) para trazer alíquotas atualizadas de cada NCM.

Ideal para simulações rápidas de precificação e análise de impacto por produto.`,
    whenToUse: [
      "Precisa calcular a nova carga tributária de um produto específico",
      "Quer simular preço de venda considerando CBS/IBS",
      "Precisa verificar se seu produto tem Imposto Seletivo"
    ],
    howItWorks: [
      "Digite o código NCM do produto (8 dígitos)",
      "Selecione UF de origem e destino",
      "Informe o município para alíquota IBS local",
      "Veja o detalhamento completo: CBS + IBS + IS"
    ],
    fields: [
      {
        name: "Código NCM",
        description: "Nomenclatura Comum do Mercosul (8 dígitos)",
        example: "2203.00.00",
        tips: "Encontre o NCM na sua nota fiscal de compra ou DANFE"
      },
      {
        name: "Valor do Produto",
        description: "Valor unitário ou total da operação",
        example: "R$ 150,00"
      },
      {
        name: "Município Destino",
        description: "Cidade do cliente (para alíquota IBS local)",
        tips: "O sistema busca automaticamente o código IBGE"
      }
    ],
    outputDescription: "Detalhamento: alíquota CBS + alíquota IBS (estadual e municipal) + IS + valor final.",
    nextSteps: ["split-payment", "calculadora-nbs"]
  },

  {
    slug: "calculadora-nbs",
    name: "Calculadora NBS (Serviços)",
    icon: "Calculator",
    category: "simular",
    minPlan: "NAVIGATOR",
    shortDescription: "Calcule a nova tributação para serviços usando código NBS.",
    fullDescription: `A Calculadora NBS é a versão para serviços da Calculadora RTC. Utiliza a Nomenclatura Brasileira de Serviços para calcular a carga tributária na nova sistemática.

Essencial para prestadores de serviços que precisam reprojetar preços.`,
    whenToUse: [
      "Você presta serviços e quer simular a nova carga",
      "Precisa precificar contratos considerando CBS/IBS",
      "Quer comparar tributação atual (ISS) vs futura (IBS)"
    ],
    howItWorks: [
      "Digite o código NBS do serviço (7 dígitos)",
      "Informe o valor do serviço",
      "Selecione o município de prestação",
      "Veja a comparação ISS atual vs IBS futuro"
    ],
    fields: [
      {
        name: "Código NBS",
        description: "Nomenclatura Brasileira de Serviços (7 dígitos)",
        example: "1.0101.10.00",
        tips: "Consulte a tabela NBS no site da Receita Federal"
      },
      {
        name: "Valor do Serviço",
        description: "Valor total do serviço prestado",
        example: "R$ 5.000,00"
      },
      {
        name: "Município",
        description: "Onde o serviço é prestado/tomado",
        tips: "Determina a alíquota do IBS municipal"
      }
    ],
    outputDescription: "Comparativo: ISS atual + alíquotas CBS/IBS + economia ou aumento projetado.",
    nextSteps: ["split-payment", "dre"]
  },

  // ============ ETAPA 3: DIAGNOSTICAR ============
  {
    slug: "dre",
    name: "DRE Inteligente",
    icon: "BarChart3",
    category: "diagnosticar",
    minPlan: "PROFESSIONAL",
    shortDescription: "Monte sua DRE simplificada e descubra como a Reforma impacta seu lucro.",
    fullDescription: `A DRE Inteligente é uma ferramenta de gestão para não-contadores. Você preenche seus números em linguagem simples (vendas, custos, despesas) e o sistema gera automaticamente:

1. Demonstrativo do Resultado completo
2. Margens e indicadores (EBITDA, margem líquida)
3. Projeção de impacto da Reforma no lucro
4. Health Score da saúde financeira vs benchmark do setor`,
    whenToUse: [
      "Quer visualizar seu resultado financeiro de forma clara",
      "Precisa projetar o impacto da Reforma no lucro",
      "Quer comparar sua performance com empresas do setor"
    ],
    howItWorks: [
      "Preencha o wizard de 5 etapas com seus números",
      "O sistema calcula automaticamente a DRE completa",
      "Veja o Health Score e diagnósticos automáticos",
      "Analise a projeção de impacto da Reforma no lucro"
    ],
    fields: [
      {
        name: "Vendas de Produtos",
        description: "Receita bruta com venda de mercadorias",
        example: "R$ 500.000/mês",
        tips: "Valor antes de descontos e devoluções"
      },
      {
        name: "Vendas de Serviços",
        description: "Receita bruta com prestação de serviços",
        example: "R$ 100.000/mês"
      },
      {
        name: "Custo das Mercadorias (CMV)",
        description: "Quanto você paga pelo que vende",
        example: "R$ 300.000/mês",
        tips: "Inclua frete de compra e impostos não recuperáveis"
      },
      {
        name: "Despesas Operacionais",
        description: "Salários, aluguel, marketing, etc.",
        example: "R$ 80.000/mês",
        tips: "Use o detalhamento se quiser análise mais precisa"
      }
    ],
    outputDescription: "DRE completa + Health Score + benchmark setorial + projeção de impacto da Reforma.",
    nextSteps: ["nexus", "radar-creditos"]
  },

  {
    slug: "radar-creditos",
    name: "Radar de Créditos",
    icon: "Radar",
    category: "diagnosticar",
    minPlan: "PROFESSIONAL",
    shortDescription: "Identifique automaticamente créditos tributários recuperáveis nos seus XMLs.",
    fullDescription: `O Radar de Créditos é um motor de análise que processa suas notas fiscais (XMLs) e identifica automaticamente oportunidades de recuperação de tributos.

São 24 regras legislativas programadas que detectam créditos de PIS/COFINS, ICMS, IPI, ISS, IRPJ e CSLL, incluindo cenários complexos como energia industrial, fretes e produtos monofásicos.`,
    whenToUse: [
      "Quer descobrir se está perdendo créditos tributários",
      "Precisa de um diagnóstico automático das suas notas",
      "Quer identificar fornecedores com tributação inadequada"
    ],
    howItWorks: [
      "Faça upload dos seus XMLs de notas fiscais",
      "O sistema processa e aplica 24 regras legislativas",
      "Veja os créditos identificados por categoria e confiança",
      "Exporte o relatório para validação com seu contador"
    ],
    fields: [
      {
        name: "Arquivos XML",
        description: "Notas fiscais eletrônicas (.xml)",
        tips: "Exporte do seu ERP ou contabilidade. Aceita arquivos individuais ou ZIP"
      },
      {
        name: "Período de Análise",
        description: "Intervalo de datas para análise",
        tips: "Recomendamos analisar os últimos 5 anos (prazo prescricional)"
      }
    ],
    outputDescription: "Lista de créditos recuperáveis com valor estimado, base legal e nível de confiança.",
    nextSteps: ["oportunidades", "nexus"]
  },

  {
    slug: "oportunidades",
    name: "Motor de Oportunidades",
    icon: "Lightbulb",
    category: "diagnosticar",
    minPlan: "PROFESSIONAL",
    shortDescription: "Descubra 61+ oportunidades tributárias personalizadas para seu perfil.",
    fullDescription: `O Motor de Oportunidades cruza o perfil da sua empresa com uma base de 61+ estratégias tributárias, identificando quais se aplicam ao seu negócio.

Cada oportunidade inclui economia estimada, complexidade de implementação e base legal (Lei do Bem, incentivos estaduais, regimes especiais, etc.).`,
    whenToUse: [
      "Quer descobrir incentivos fiscais disponíveis",
      "Precisa de um mapa de oportunidades para apresentar à diretoria",
      "Quer priorizar ações de planejamento tributário"
    ],
    howItWorks: [
      "Complete o Perfil da Empresa com informações detalhadas",
      "O sistema faz matching com 61+ oportunidades cadastradas",
      "Veja as oportunidades ordenadas por impacto e viabilidade",
      "Marque como 'em análise' ou 'descartada' para organizar"
    ],
    outputDescription: "Lista de oportunidades com economia estimada, complexidade, base legal e status.",
    nextSteps: ["nexus", "painel-executivo"]
  },

  {
    slug: "margem-ativa",
    name: "Suíte Margem Ativa",
    icon: "TrendingUp",
    category: "diagnosticar",
    minPlan: "PROFESSIONAL",
    shortDescription: "Proteja sua margem de lucro na transição CBS/IBS com análise de compras e preços.",
    fullDescription: `A Suíte Margem Ativa é composta por dois módulos estratégicos:

**OMC-AI (Compras)**: Analisa seus fornecedores para identificar vazamento de margem. Calcula o "Preço de Indiferença" - quanto você deveria pagar considerando os créditos tributários.

**PriceGuard (Vendas)**: Usa fórmulas de gross-up reverso para reprojetar seus preços de venda, garantindo que a margem EBITDA seja preservada após a Reforma.`,
    whenToUse: [
      "Quer identificar fornecedores que estão te custando créditos",
      "Precisa reprojetar preços de venda para 2026",
      "Quer proteger sua margem durante a transição"
    ],
    howItWorks: [
      "Importe dados de compras (XMLs ou ERP)",
      "Veja análise de fornecedores com índice de aproveitamento",
      "Use o PriceGuard para simular novos preços de venda",
      "Exporte relatório para negociação com fornecedores"
    ],
    outputDescription: "Dashboard executivo com análise de fornecedores + simulador de preços + relatório de ação.",
    nextSteps: ["nexus", "dre"]
  },

  // ============ ETAPA 4: COMANDAR ============
  {
    slug: "nexus",
    name: "NEXUS Command Center",
    icon: "LayoutDashboard",
    category: "comandar",
    minPlan: "PROFESSIONAL",
    shortDescription: "Centro de comando executivo com 8 KPIs estratégicos consolidados.",
    fullDescription: `O NEXUS é o cockpit executivo que consolida todos os dados da plataforma em 8 KPIs estratégicos:

1. Fluxo de Caixa Projetado
2. Receita Bruta
3. Margem Bruta
4. Margem Líquida
5. Impacto Tributário CBS/IBS
6. Créditos Recuperáveis
7. Risco Fiscal
8. Score Tributário

Inclui motor de insights que cruza KPIs para disparar alertas estratégicos automaticamente.`,
    whenToUse: [
      "Precisa de visão consolidada para tomada de decisão",
      "Quer apresentar situação tributária para diretoria/conselho",
      "Quer monitorar indicadores continuamente"
    ],
    howItWorks: [
      "O NEXUS consolida dados de DRE, Score e Perfil automaticamente",
      "Veja os 8 KPIs em tempo real",
      "Receba insights automáticos baseados nos dados",
      "Exporte dashboard para apresentações executivas"
    ],
    outputDescription: "Dashboard com 8 KPIs + insights automáticos + alertas estratégicos.",
    nextSteps: ["painel-executivo"]
  },

  {
    slug: "painel-executivo",
    name: "Painel Executivo",
    icon: "Presentation",
    category: "comandar",
    minPlan: "ENTERPRISE",
    shortDescription: "Relatórios PDF profissionais e acompanhamento com consultoria jurídica.",
    fullDescription: `O Painel Executivo é exclusivo do plano Enterprise e combina relatórios automatizados com acompanhamento humano especializado.

Inclui:
- Relatórios PDF mensais automáticos
- Dashboard personalizado por CNPJ
- Acesso a consultoria jurídica da Rebechi & Silva
- Reuniões estratégicas mensais com especialistas`,
    whenToUse: [
      "Precisa de relatórios profissionais para diretoria/conselho",
      "Quer acompanhamento especializado na transição",
      "Precisa de suporte jurídico para implementar estratégias"
    ],
    howItWorks: [
      "Configure relatórios automáticos por email",
      "Acesse dashboard personalizado por CNPJ",
      "Agende consultorias com especialistas tributários",
      "Receba análise mensal com recomendações personalizadas"
    ],
    outputDescription: "Relatórios PDF + consultoria jurídica + reuniões estratégicas.",
    nextSteps: []
  },

  // ============ EXTRAS ============
  {
    slug: "analisador-docs",
    name: "Analisador de Documentos IA",
    icon: "FileSearch",
    category: "extras",
    minPlan: "NAVIGATOR",
    shortDescription: "Analise contratos societários e documentos com inteligência artificial.",
    fullDescription: `O Analisador de Documentos usa IA para ler e interpretar contratos, identificando:

- Pontos positivos (cláusulas favoráveis)
- Pontos de atenção (riscos potenciais)
- Recomendações de melhoria
- Oportunidades tributárias escondidas

Ideal para contratos sociais, acordos de sócios, contratos de serviço e documentos tributários.`,
    whenToUse: [
      "Quer revisar contratos antes de assinar",
      "Precisa identificar riscos em documentos existentes",
      "Quer encontrar oportunidades tributárias em contratos"
    ],
    howItWorks: [
      "Faça upload do documento (PDF, Word, imagem)",
      "A IA processa e extrai informações relevantes",
      "Veja análise estruturada com pontos positivos/negativos",
      "Receba recomendações de ação"
    ],
    fields: [
      {
        name: "Documento",
        description: "Arquivo para análise",
        tips: "Aceita PDF, DOCX, imagens (JPG, PNG). Tamanho máximo: 10MB"
      },
      {
        name: "Tipo de Documento",
        description: "Categoria do documento para análise especializada",
        tips: "Contrato social, acordo de sócios, contrato de serviço, etc."
      }
    ],
    outputDescription: "Relatório com pontos positivos, atenção, recomendações e oportunidades.",
    nextSteps: ["oportunidades"]
  },

  {
    slug: "workflows",
    name: "Workflows Guiados",
    icon: "Route",
    category: "extras",
    minPlan: "NAVIGATOR",
    shortDescription: "Jornadas estruturadas que conectam ferramentas de forma lógica.",
    fullDescription: `Os Workflows Guiados são roteiros que encadeiam múltiplas ferramentas em uma sequência lógica, facilitando diagnósticos completos sem navegação manual.

**Workflows disponíveis:**
1. Diagnóstico Tributário Completo
2. Preparação para a Reforma
3. Análise de Contratos Societários
4. Simulação de Preços`,
    whenToUse: [
      "Quer fazer um diagnóstico completo sem se perder",
      "Precisa de um roteiro estruturado",
      "Está começando e não sabe por onde ir"
    ],
    howItWorks: [
      "Escolha um workflow baseado no seu objetivo",
      "Siga os passos na ordem indicada",
      "O sistema salva seu progresso automaticamente",
      "Ao final, veja o resultado consolidado"
    ],
    outputDescription: "Resultado consolidado do workflow + plano de ação.",
    nextSteps: ["nexus"]
  },

  {
    slug: "comunidade",
    name: "TribuTalks Connect",
    icon: "Users",
    category: "extras",
    minPlan: "NAVIGATOR",
    shortDescription: "Acesse a comunidade exclusiva de empresários e contadores.",
    fullDescription: `A TribuTalks Connect é a comunidade exclusiva para networking e troca de experiências entre usuários da plataforma.

Inclui:
- Fóruns temáticos por setor e regime
- Lives mensais com especialistas
- Grupo de WhatsApp exclusivo (Navigator)
- Circle exclusivo (Professional+)
- Acesso antecipado a novas funcionalidades`,
    whenToUse: [
      "Quer trocar experiências com outros empresários",
      "Precisa de networking tributário",
      "Quer acesso a conteúdo exclusivo"
    ],
    howItWorks: [
      "Acesse a TribuTalks Connect pelo menu da plataforma",
      "Participe de discussões e faça perguntas",
      "Acompanhe lives e webinars",
      "Conecte-se com profissionais do seu setor"
    ],
    outputDescription: "Acesso à comunidade, fóruns, lives e networking.",
    nextSteps: []
  },

  {
    slug: "checklist-reforma",
    name: "Checklist da Reforma",
    icon: "CheckSquare",
    category: "extras",
    minPlan: "NAVIGATOR",
    shortDescription: "Avalie a prontidão operacional da sua empresa para 2026.",
    fullDescription: `O Checklist da Reforma avalia 4 dimensões da sua prontidão:

1. **Sistemas**: ERP, emissão de NF, integração fiscal
2. **Obrigações**: Cadastros, declarações, certidões
3. **Créditos**: Aproveitamento, saldos, compensações
4. **Caixa**: Capital de giro, Split Payment, fluxo

Ao final, você recebe o "Relatório de Prontidão para a Reforma Tributária".`,
    whenToUse: [
      "Quer saber se sua empresa está preparada para 2026",
      "Precisa identificar gaps operacionais",
      "Quer um plano de ação para adequação"
    ],
    howItWorks: [
      "Responda itens em cada categoria (Sim/Não/Parcial)",
      "A Clara guia o preenchimento com explicações",
      "Veja seu percentual de prontidão por área",
      "Receba relatório com prioridades de ação"
    ],
    outputDescription: "Relatório de Prontidão com percentual por área + plano de ação priorizado.",
    nextSteps: ["timeline", "dre"]
  },

  {
    slug: "perfil-empresa",
    name: "Perfil da Empresa",
    icon: "Building2",
    category: "extras",
    minPlan: "FREE",
    shortDescription: "Configure o perfil completo da sua empresa para personalizar análises.",
    fullDescription: `O Perfil da Empresa é a base de todas as personalizações da plataforma. Quanto mais completo, mais precisas serão as análises e recomendações.

Inclui dados básicos (CNPJ, regime, faturamento) e avançados (operações interestaduais, benefícios fiscais, estrutura societária).`,
    whenToUse: [
      "Está começando a usar a plataforma",
      "Quer análises mais personalizadas",
      "Mudou alguma característica da empresa"
    ],
    howItWorks: [
      "Preencha as informações por etapas",
      "O sistema valida CNPJ automaticamente",
      "Dados são usados em todas as ferramentas",
      "Atualize sempre que houver mudanças"
    ],
    fields: [
      {
        name: "CNPJ",
        description: "CNPJ principal da empresa",
        tips: "Se tiver grupo, cadastre o CNPJ principal primeiro"
      },
      {
        name: "Regime Tributário",
        description: "Simples Nacional, Lucro Presumido ou Lucro Real"
      },
      {
        name: "Faturamento Anual",
        description: "Receita bruta dos últimos 12 meses"
      },
      {
        name: "Setor de Atuação",
        description: "Comércio, Indústria, Serviços, etc."
      }
    ],
    outputDescription: "Perfil completo que alimenta todas as ferramentas da plataforma.",
    nextSteps: ["score-tributario", "oportunidades"]
  }
];

// Helper para buscar ferramenta por slug
export function getToolBySlug(slug: string): ToolManualEntry | undefined {
  return TOOLS_MANUAL.find(t => t.slug === slug);
}

// Helper para buscar ferramentas por categoria
export function getToolsByCategory(category: ToolManualEntry["category"]): ToolManualEntry[] {
  return TOOLS_MANUAL.filter(t => t.category === category);
}

// Gerar prompt para Clara explicar uma ferramenta
export function generateToolHelpPrompt(tool: ToolManualEntry): string {
  let prompt = `## ${tool.name}

**O que é:** ${tool.fullDescription}

**Quando usar:**
${tool.whenToUse.map(u => `- ${u}`).join("\n")}

**Como funciona:**
${tool.howItWorks.map((h, i) => `${i + 1}. ${h}`).join("\n")}
`;

  if (tool.fields && tool.fields.length > 0) {
    prompt += `\n**Campos para preencher:**\n`;
    tool.fields.forEach(f => {
      prompt += `\n**${f.name}**: ${f.description}`;
      if (f.example) prompt += `\n  _Exemplo:_ ${f.example}`;
      if (f.tips) prompt += `\n  💡 ${f.tips}`;
    });
  }

  prompt += `\n\n**O que você recebe:** ${tool.outputDescription}`;

  if (tool.nextSteps && tool.nextSteps.length > 0) {
    const nextTools = tool.nextSteps.map(s => getToolBySlug(s)?.name).filter(Boolean);
    if (nextTools.length > 0) {
      prompt += `\n\n**Próximos passos recomendados:** ${nextTools.join(", ")}`;
    }
  }

  return prompt;
}
