export interface CaseStudy {
  id: string;
  slug: string;
  company: string;
  sector: string;
  sectorIcon: string;
  logo?: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  timeline: string;
  toolsUsed: string[];
  fullStory: string;
  featured?: boolean;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "1",
    slug: "distribuidora-alimentos-sp",
    company: "Distribuidora Alimentos SP",
    sector: "Atacado & Distribuição",
    sectorIcon: "Package",
    challenge: "Com faturamento de R$ 45 milhões/ano e operações em 5 estados, a empresa enfrentava dificuldades em acompanhar os benefícios fiscais estaduais e identificar créditos não aproveitados de PIS/COFINS sobre fretes.",
    solution: "Implementamos o diagnóstico completo com importação de XMLs dos últimos 24 meses, análise automatizada de NCMs e CFOPs, e geração de relatórios executivos mensais para a diretoria.",
    results: [
      { metric: "Créditos Recuperados", value: "R$ 847.000", description: "Em créditos de PIS/COFINS identificados em 24 meses" },
      { metric: "Economia Mensal", value: "R$ 12.500", description: "Redução na carga tributária mensal" },
      { metric: "Tempo Economizado", value: "40 horas/mês", description: "Antes gastas em análises manuais" },
    ],
    testimonial: {
      quote: "O TribuTalks transformou nossa gestão fiscal. Em 3 meses recuperamos o investimento de 2 anos de assinatura.",
      author: "Carlos Mendes",
      role: "Diretor Financeiro",
    },
    timeline: "3 meses para implementação completa",
    toolsUsed: ["Importador de XMLs", "Radar de Créditos", "DRE Inteligente", "Painel Executivo"],
    fullStory: `A Distribuidora Alimentos SP é uma empresa familiar fundada em 1998 que atua no segmento de distribuição de alimentos secos e refrigerados para o varejo em São Paulo, Minas Gerais, Rio de Janeiro, Paraná e Santa Catarina.

**O Desafio**

Com operações interestaduais complexas e mais de 2.000 notas fiscais emitidas por mês, a equipe contábil de 3 pessoas não conseguia acompanhar todas as mudanças na legislação tributária. Além disso, a empresa suspeitava que não estava aproveitando todos os créditos fiscais a que tinha direito.

**A Descoberta**

Após uma demonstração do TribuTalks, identificamos que a empresa:
- Não estava aproveitando créditos de PIS/COFINS sobre fretes contratados
- Possuía NCMs classificados incorretamente em produtos monofásicos
- Não utilizava benefícios estaduais disponíveis no Paraná (TTD)

**A Implementação**

Em 3 meses, realizamos:
1. **Semana 1-2**: Importação de 48.000 XMLs dos últimos 24 meses
2. **Semana 3-4**: Análise completa do Radar de Créditos
3. **Mês 2**: Configuração do DRE Inteligente e benchmarks
4. **Mês 3**: Treinamento da equipe e setup do Painel Executivo

**Os Resultados**

A empresa recuperou R$ 847.000 em créditos que estavam "esquecidos" e passou a ter uma economia mensal recorrente de R$ 12.500 com a otimização da carga tributária. O ROI do investimento foi de 1.850%.`,
    featured: true,
  },
  {
    id: "2",
    slug: "clinica-oftalmologica-rj",
    company: "Clínica Oftalmológica Rio",
    sector: "Saúde",
    sectorIcon: "Heart",
    challenge: "Clínica médica com 12 oftalmologistas e faturamento de R$ 8 milhões/ano operando no Lucro Presumido, sem clareza se era o regime mais vantajoso.",
    solution: "Utilizamos o Comparativo de Regimes e o Score Tributário para identificar a melhor estrutura, descobrindo que a empresa poderia usar o regime especial de serviços de saúde.",
    results: [
      { metric: "Economia Anual", value: "R$ 156.000", description: "Com mudança de regime tributário" },
      { metric: "Score Tributário", value: "De D para A", description: "Melhoria na saúde fiscal" },
      { metric: "Compliance", value: "100%", description: "Conformidade com obrigações" },
    ],
    testimonial: {
      quote: "Descobrimos que estávamos pagando impostos a mais há anos. O comparativo de regimes mostrou exatamente onde otimizar.",
      author: "Dra. Fernanda Lima",
      role: "Sócia-Administradora",
    },
    timeline: "45 dias para análise e implementação",
    toolsUsed: ["Comparativo de Regimes", "Score Tributário", "Oportunidades Fiscais"],
    fullStory: `A Clínica Oftalmológica Rio é referência em cirurgias refrativas e tratamento de catarata no Rio de Janeiro, com 15 anos de mercado.

**O Desafio**

A clínica operava no Lucro Presumido desde sua fundação, sem nunca ter feito uma análise detalhada se esse era realmente o melhor regime. Com a Reforma Tributária se aproximando, os sócios queriam entender o impacto futuro.

**A Descoberta**

Através do Comparativo de Regimes, identificamos que:
- A clínica poderia se enquadrar no regime especial de serviços de saúde (alíquota reduzida)
- A folha de pagamento representava 32% do faturamento, indicando potencial para Fator R no Simples
- Havia créditos de equipamentos médicos não aproveitados

**A Implementação**

1. Análise completa com Score Tributário (nota inicial: D)
2. Simulação de 4 cenários de regimes tributários
3. Identificação de 5 oportunidades fiscais aplicáveis
4. Planejamento da transição para 2026

**Os Resultados**

A clínica economizou R$ 156.000/ano com a otimização do regime tributário e alcançou nota A no Score Tributário. Agora tem visibilidade completa do impacto da Reforma Tributária.`,
    featured: true,
  },
  {
    id: "3",
    slug: "industria-metalurgica-mg",
    company: "Metalúrgica Belo Horizonte",
    sector: "Indústria",
    sectorIcon: "Factory",
    challenge: "Indústria metalúrgica com R$ 28 milhões de faturamento anual não aproveitava créditos de energia elétrica e tinha dúvidas sobre a transição para CBS/IBS.",
    solution: "Implementamos o Radar de Créditos para identificar oportunidades históricas e a Calculadora RTC para projetar o impacto da reforma nos produtos.",
    results: [
      { metric: "Créditos de Energia", value: "R$ 234.000", description: "Recuperados dos últimos 5 anos" },
      { metric: "Produtos Analisados", value: "1.847", description: "NCMs classificados para reforma" },
      { metric: "Preparação 2026", value: "100%", description: "Empresa pronta para transição" },
    ],
    testimonial: {
      quote: "A análise de NCMs mostrou que 23% dos nossos produtos terão alíquota reduzida. Isso muda completamente nosso planejamento.",
      author: "Roberto Andrade",
      role: "Controller",
    },
    timeline: "60 dias para diagnóstico completo",
    toolsUsed: ["Importador de XMLs", "Radar de Créditos", "Calculadora RTC", "CBS/IBS & NCM"],
    fullStory: `A Metalúrgica Belo Horizonte fabrica peças automotivas e equipamentos industriais, exportando 15% da produção para a América Latina.

**O Desafio**

Como indústria, a empresa sabia que tinha direito a diversos créditos tributários, mas a complexidade das operações (compras de matéria-prima, energia industrial, exportações) dificultava o controle. A aproximação da Reforma Tributária também gerava ansiedade.

**A Descoberta**

O diagnóstico revelou:
- Créditos de energia elétrica (Convênio ICMS 106/96) não aproveitados desde 2019
- NCMs de produtos exportados classificados incorretamente para drawback
- Oportunidade de regime especial para exportadores

**A Implementação**

1. Importação de 36 meses de XMLs de entrada e saída
2. Classificação completa de 1.847 NCMs para a nova estrutura CBS/IBS
3. Identificação de produtos com alíquota reduzida (bens de capital)
4. Simulação do impacto da reforma em cada linha de produto

**Os Resultados**

A empresa recuperou R$ 234.000 em créditos de energia e agora tem clareza total sobre como a Reforma Tributária afetará cada produto. O planejamento de preços para 2026-2027 já está definido.`,
    featured: false,
  },
  {
    id: "4",
    slug: "startup-saas-sp",
    company: "TechFlow SaaS",
    sector: "Tecnologia",
    sectorIcon: "Code",
    challenge: "Startup de software B2B com crescimento de 200% ao ano precisava entender a tributação de serviços digitais e preparar-se para a Reforma Tributária.",
    solution: "Utilizamos a Clara AI para consultoria contínua e o Score Tributário para estabelecer uma baseline de saúde fiscal desde o início.",
    results: [
      { metric: "Consultas Resolvidas", value: "127", description: "Dúvidas respondidas pela Clara AI em 6 meses" },
      { metric: "Economia Identificada", value: "R$ 45.000/ano", description: "Com estruturação correta desde o início" },
      { metric: "Score Inicial", value: "B+", description: "Startup já nasce com boa saúde fiscal" },
    ],
    testimonial: {
      quote: "Como founders técnicos, não entendíamos nada de tributação. A Clara AI virou nosso 'contador virtual' disponível 24/7.",
      author: "Marina Costa",
      role: "CEO & Co-founder",
    },
    timeline: "Implementação contínua desde o mês 1",
    toolsUsed: ["Clara AI", "Score Tributário", "Comparativo de Regimes", "Timeline 2026-2033"],
    fullStory: `A TechFlow é uma startup de software B2B que oferece soluções de automação para empresas de médio porte, fundada em 2023 por dois engenheiros.

**O Desafio**

Como founders sem background em gestão, Marina e seu sócio não entendiam as complexidades da tributação brasileira. Estavam no Simples Nacional mas não sabiam se deveriam migrar com o crescimento acelerado.

**A Descoberta**

A Clara AI ajudou a esclarecer:
- Como funciona a tributação de SaaS (ISS vs ICMS)
- Quando faz sentido sair do Simples Nacional
- Impactos específicos da Reforma Tributária para serviços digitais

**A Implementação**

1. Setup inicial do Score Tributário para baseline
2. Configuração de alertas de legislação relevante
3. Acesso ilimitado à Clara AI para dúvidas operacionais
4. Monitoramento via Timeline 2026-2033

**Os Resultados**

A startup agora tem clareza tributária desde o início, economizando R$ 45.000/ano com estruturação correta. O Score B+ mostra que está no caminho certo para escalar com compliance.`,
    featured: false,
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(cs => cs.slug === slug);
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return caseStudies.filter(cs => cs.featured);
}
