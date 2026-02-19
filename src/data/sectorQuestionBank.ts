// Sector Question Bank — macros, sectors, default tags, exploratory questions

export interface SectorQuestion {
  text: string;
  roi: string;
  key: string;
  maps_to?: string;
  value_if_true?: string;
  adds_tag?: string;
  type?: 'boolean' | 'select';
  options?: string[];
}

export interface SectorInfo {
  value: string;
  label: string;
}

export const MACRO_SEGMENTS: SectorInfo[] = [
  { value: 'servicos', label: 'Serviços' },
  { value: 'comercio', label: 'Comércio' },
  { value: 'industria', label: 'Indústria' },
];

export const MACRO_TO_SECTORS: Record<string, SectorInfo[]> = {
  servicos: [
    { value: 'servicos_profissionais', label: 'Serviços Profissionais' },
    { value: 'tecnologia_saas', label: 'Tecnologia / SaaS' },
    { value: 'logistica_transporte', label: 'Logística e Transporte' },
    { value: 'corretagem_seguros', label: 'Corretagem e Seguros' },
    { value: 'educacao', label: 'Educação' },
    { value: 'saude', label: 'Saúde' },
    { value: 'imobiliario', label: 'Imobiliário' },
  ],
  comercio: [
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'varejo_fisico', label: 'Varejo Físico' },
    { value: 'distribuicao_atacado', label: 'Distribuição / Atacado' },
    { value: 'alimentacao_bares_restaurantes', label: 'Alimentação / Bares / Restaurantes' },
  ],
  industria: [
    { value: 'construcao_incorporacao', label: 'Construção / Incorporação' },
    { value: 'agro', label: 'Agronegócio' },
    { value: 'industria_alimentos_bebidas', label: 'Indústria de Alimentos e Bebidas' },
    { value: 'industria_metal_mecanica', label: 'Indústria Metal-Mecânica' },
  ],
};

export const OPERATION_TAGS: SectorInfo[] = [
  { value: 'tem_icms', label: 'ICMS' },
  { value: 'tem_iss', label: 'ISS' },
  { value: 'tem_st_icms', label: 'ST' },
  { value: 'importa', label: 'Importo' },
  { value: 'exporta', label: 'Exporto' },
  { value: 'multi_uf', label: 'Multi-UF' },
  { value: 'alto_volume_nfe', label: 'Alto volume NF' },
  { value: 'grupo_economico', label: 'Grupo econômico' },
];

export const SECTOR_DEFAULT_TAGS: Record<string, string[]> = {
  servicos_profissionais: ['tem_iss'],
  tecnologia_saas: ['tem_iss'],
  logistica_transporte: ['tem_icms', 'tem_iss'],
  corretagem_seguros: ['tem_iss'],
  educacao: ['tem_iss'],
  saude: ['tem_iss'],
  imobiliario: ['tem_iss'],
  ecommerce: ['tem_icms', 'alto_volume_nfe'],
  varejo_fisico: ['tem_icms'],
  distribuicao_atacado: ['tem_icms', 'alto_volume_nfe'],
  alimentacao_bares_restaurantes: ['tem_icms', 'tem_iss'],
  construcao_incorporacao: ['tem_iss'],
  agro: ['tem_icms'],
  industria_alimentos_bebidas: ['tem_icms'],
  industria_metal_mecanica: ['tem_icms'],
};

export const SECTOR_QUESTIONS: Record<string, SectorQuestion[]> = {
  servicos_profissionais: [
    {
      text: 'Sua folha de pagamento representa mais de 28% do faturamento?',
      roi: 'Destrava Fator R — pode reduzir alíquota efetiva no Simples Nacional',
      key: 'folha_acima_28pct',
      maps_to: 'folha_acima_28pct',
      value_if_true: 'sim',
    },
    {
      text: 'Sua margem líquida é superior a 15%?',
      roi: 'Destrava revisão de regime — Lucro Presumido frequentemente mais vantajoso',
      key: 'margem_liquida_faixa',
      maps_to: 'margem_liquida_faixa',
      value_if_true: 'gt_20',
    },
    {
      text: 'Você presta serviço principalmente para poucos clientes grandes?',
      roi: 'Destrava estratégia de estrutura e contratos com impacto tributário',
      key: 'b2b_alto',
      adds_tag: 'b2b_alto',
    },
    {
      text: 'Você tem outras empresas ou sociedades no grupo?',
      roi: 'Destrava oportunidades de estrutura societária entre empresas',
      key: 'grupo_economico_exp',
      adds_tag: 'grupo_economico',
    },
  ],
  tecnologia_saas: [
    {
      text: 'Seu modelo é principalmente assinatura recorrente?',
      roi: 'Destrava enquadramento correto e previsibilidade tributária',
      key: 'modelo_recorrente',
    },
    {
      text: 'Você atende clientes em vários municípios ou estados?',
      roi: 'Destrava ISS por localização e rotinas fiscais',
      key: 'multi_uf_saas',
      adds_tag: 'multi_uf',
    },
    {
      text: 'Sua margem líquida é superior a 15%?',
      roi: 'Destrava revisão de regime — Lucro Presumido pode ser mais vantajoso',
      key: 'margem_liquida_saas',
      maps_to: 'margem_liquida_faixa',
      value_if_true: 'gt_20',
    },
    {
      text: 'Você tem mais de 10 funcionários CLT?',
      roi: 'Destrava decisões por folha e estrutura societária',
      key: 'folha_10_clt',
    },
  ],
  ecommerce: [
    {
      text: 'Você vende em marketplace (Mercado Livre, Shopee, Amazon)?',
      roi: 'Destrava regras de cadeia fiscal e pode gerar créditos',
      key: 'vende_marketplace',
    },
    {
      text: 'Você vende para vários estados?',
      roi: 'Destrava oportunidades de ICMS por UF e benefícios regionais',
      key: 'multi_uf_ecommerce',
      adds_tag: 'multi_uf',
    },
    {
      text: 'Seus produtos têm ICMS por substituição tributária?',
      roi: 'Destrava exclusões e ressarcimentos de ICMS-ST — economia direta',
      key: 'st_ecommerce',
      adds_tag: 'tem_st_icms',
    },
    {
      text: 'Você tem alto volume de devoluções ou trocas?',
      roi: 'Destrava ajustes de crédito e rotinas fiscais que viram economia',
      key: 'alto_devolucoes',
    },
  ],
  construcao_incorporacao: [
    {
      text: 'Você atua como empreiteira ou incorporadora?',
      roi: 'Destrava enquadramento correto e reduz riscos fiscais significativos',
      key: 'tipo_construcao',
      type: 'select',
      options: ['Empreiteira', 'Incorporadora', 'Ambos'],
    },
    {
      text: 'Você cria SPE para cada obra?',
      roi: 'Destrava oportunidades estruturais por empreendimento',
      key: 'spe_obras',
      adds_tag: 'grupo_economico',
    },
    {
      text: 'Você tem muita subcontratação de mão de obra?',
      roi: 'Destrava oportunidades de retenções e organização da cadeia fiscal',
      key: 'subcontratacao',
    },
    {
      text: 'Você tem obras em mais de um município?',
      roi: 'Destrava ISS por localização e rotinas fiscais',
      key: 'multi_mun_obras',
      adds_tag: 'multi_uf',
    },
  ],
  saude: [
    {
      text: 'Seus serviços são de natureza hospitalar (internação, cirurgia, UTI)?',
      roi: 'Destrava oportunidades clássicas do setor com base legal sólida',
      key: 'natureza_hospitalar',
    },
    {
      text: 'Você atende mais por convênio ou particular?',
      roi: 'Destrava perfil de receita e estratégia tributária adequada',
      key: 'tipo_atendimento',
      type: 'select',
      options: ['Principalmente convênio', 'Principalmente particular', 'Metade a metade'],
    },
    {
      text: 'Sua folha de pagamento é expressiva?',
      roi: 'Destrava estratégia por folha e melhor enquadramento tributário',
      key: 'folha_expressiva_saude',
    },
    {
      text: 'Você tem médicos sócios como PJ?',
      roi: 'Destrava análise de estrutura societária com potencial de economia',
      key: 'medicos_pj',
      adds_tag: 'grupo_economico',
    },
  ],
  agro: [
    {
      text: 'Você é produtor rural ou agroindústria?',
      roi: 'Destrava enquadramento e cadeia fiscal correta para seu perfil',
      key: 'tipo_agro',
      type: 'select',
      options: ['Produtor rural', 'Agroindústria', 'Cooperativa'],
    },
    {
      text: 'Você exporta sua produção?',
      roi: 'Destrava créditos acumulados de ICMS e oportunidades de exportação',
      key: 'exporta_agro',
      adds_tag: 'exporta',
    },
    {
      text: 'Você compra insumos em alto volume?',
      roi: 'Destrava conciliação fiscal e créditos sobre insumos agropecuários',
      key: 'alto_insumos_agro',
      adds_tag: 'alto_volume_nfe',
    },
    {
      text: 'Você opera em mais de um estado?',
      roi: 'Destrava oportunidades de ICMS e benefícios fiscais regionais',
      key: 'multi_uf_agro',
      adds_tag: 'multi_uf',
    },
  ],
  logistica_transporte: [
    {
      text: 'Você tem frota própria de veículos?',
      roi: 'Destrava oportunidades de estrutura, custo e compliance fiscal',
      key: 'frota_propria',
    },
    {
      text: 'Você faz mais armazenagem/fulfillment do que transporte puro?',
      roi: 'Destrava enquadramento ISS vs ICMS e otimização de alíquota',
      key: 'armazenagem_vs_transporte',
    },
    {
      text: 'Você atende clientes em vários estados?',
      roi: 'Destrava oportunidades por estado e rotinas fiscais interestaduais',
      key: 'multi_uf_logistica',
      adds_tag: 'multi_uf',
    },
    {
      text: 'Você terceiriza boa parte das entregas?',
      roi: 'Destrava oportunidades contratuais e tributárias com parceiros',
      key: 'terceiriza_entregas',
    },
  ],
  varejo_fisico: [
    {
      text: 'Você também vende online além da loja física?',
      roi: 'Destrava regras de canal híbrido e oportunidades de estrutura fiscal',
      key: 'vende_online_varejo',
      adds_tag: 'alto_volume_nfe',
    },
    {
      text: 'Seu mix inclui produtos com substituição tributária?',
      roi: 'Destrava exclusões e ajustes de ICMS-ST — recuperação direta',
      key: 'st_varejo',
      adds_tag: 'tem_st_icms',
    },
    {
      text: 'Você compra de muitos fornecedores com alto volume de notas?',
      roi: 'Destrava conciliação fiscal e créditos não aproveitados',
      key: 'alto_nfe_varejo',
      adds_tag: 'alto_volume_nfe',
    },
    {
      text: 'Você tem mais de uma loja ou filial?',
      roi: 'Destrava oportunidades de estrutura e governança fiscal entre unidades',
      key: 'filiais_varejo',
      adds_tag: 'grupo_economico',
    },
  ],
  distribuicao_atacado: [
    {
      text: 'Você opera com ICMS por substituição tributária?',
      roi: 'Destrava ressarcimentos e exclusões de ICMS-ST',
      key: 'st_atacado',
      adds_tag: 'tem_st_icms',
    },
    {
      text: 'Você atende clientes em vários estados?',
      roi: 'Destrava benefícios fiscais regionais e otimização interestadual',
      key: 'multi_uf_atacado',
      adds_tag: 'multi_uf',
    },
    {
      text: 'Seu volume de compras com NF-e é alto?',
      roi: 'Destrava conciliação fiscal automatizada e créditos',
      key: 'alto_nfe_atacado',
      adds_tag: 'alto_volume_nfe',
    },
    {
      text: 'Você tem centro de distribuição em estado com incentivo fiscal?',
      roi: 'Destrava benefícios estaduais e redução de carga tributária',
      key: 'cd_incentivado',
    },
  ],
  alimentacao_bares_restaurantes: [
    {
      text: 'Você prepara alimentos no estabelecimento?',
      roi: 'Destrava enquadramento ISS vs ICMS e otimização fiscal',
      key: 'prepara_alimentos',
    },
    {
      text: 'Você usa plataformas de delivery (iFood, Rappi)?',
      roi: 'Destrava regras de cadeia fiscal com intermediários',
      key: 'usa_delivery',
    },
    {
      text: 'Você recebe gorjetas?',
      roi: 'Destrava tratamento fiscal específico e economia trabalhista',
      key: 'recebe_gorjetas_alim',
    },
    {
      text: 'Você tem mais de um ponto de venda?',
      roi: 'Destrava oportunidades de estrutura e governança fiscal',
      key: 'multiplos_pontos',
      adds_tag: 'grupo_economico',
    },
  ],
  corretagem_seguros: [
    {
      text: 'Sua folha de pagamento representa mais de 28% do faturamento?',
      roi: 'Destrava Fator R no Simples Nacional',
      key: 'folha_corretagem',
      maps_to: 'folha_acima_28pct',
      value_if_true: 'sim',
    },
    {
      text: 'Você tem estrutura de subagentes ou corretores PJ?',
      roi: 'Destrava oportunidades de estrutura societária',
      key: 'subagentes',
      adds_tag: 'grupo_economico',
    },
    {
      text: 'Sua margem líquida é superior a 15%?',
      roi: 'Destrava revisão de regime tributário',
      key: 'margem_corretagem',
      maps_to: 'margem_liquida_faixa',
      value_if_true: 'gt_20',
    },
    {
      text: 'Você atende clientes em vários estados?',
      roi: 'Destrava ISS por localização',
      key: 'multi_uf_corretagem',
      adds_tag: 'multi_uf',
    },
  ],
  imobiliario: [
    {
      text: 'Você atua com incorporação imobiliária?',
      roi: 'Destrava RET e enquadramento específico para incorporação',
      key: 'incorporacao_imob',
    },
    {
      text: 'Você usa patrimônio de afetação nas obras?',
      roi: 'Destrava Regime Especial de Tributação com alíquota reduzida',
      key: 'patrimonio_afetacao',
    },
    {
      text: 'Você tem obras em mais de um município?',
      roi: 'Destrava ISS por localização e otimização fiscal',
      key: 'multi_mun_imob',
      adds_tag: 'multi_uf',
    },
    {
      text: 'Você participa do programa Minha Casa Minha Vida?',
      roi: 'Destrava incentivos fiscais específicos do programa',
      key: 'mcmv_imob',
    },
  ],
  industria_alimentos_bebidas: [
    {
      text: 'Seus produtos têm substituição tributária de ICMS?',
      roi: 'Destrava exclusões e ressarcimentos de ICMS-ST',
      key: 'st_alimentos',
      adds_tag: 'tem_st_icms',
    },
    {
      text: 'Você exporta parte da produção?',
      roi: 'Destrava créditos acumulados de ICMS e benefícios de exportação',
      key: 'exporta_alimentos',
      adds_tag: 'exporta',
    },
    {
      text: 'Você compra insumos em grande volume?',
      roi: 'Destrava créditos de PIS/COFINS e ICMS sobre insumos',
      key: 'insumos_alimentos',
      adds_tag: 'alto_volume_nfe',
    },
    {
      text: 'Você opera em mais de um estado?',
      roi: 'Destrava benefícios fiscais regionais e otimização de ICMS',
      key: 'multi_uf_alimentos',
      adds_tag: 'multi_uf',
    },
  ],
  industria_metal_mecanica: [
    {
      text: 'Você exporta parte da produção?',
      roi: 'Destrava créditos acumulados de ICMS e incentivos de exportação',
      key: 'exporta_metal',
      adds_tag: 'exporta',
    },
    {
      text: 'Você investe em P&D ou inovação tecnológica?',
      roi: 'Destrava Lei do Bem e incentivos fiscais de inovação',
      key: 'pd_metal',
    },
    {
      text: 'Seus produtos têm substituição tributária?',
      roi: 'Destrava ressarcimentos de ICMS-ST',
      key: 'st_metal',
      adds_tag: 'tem_st_icms',
    },
    {
      text: 'Você tem alto volume de compras de matéria-prima?',
      roi: 'Destrava créditos tributários sobre insumos',
      key: 'insumos_metal',
      adds_tag: 'alto_volume_nfe',
    },
  ],
  educacao: [
    {
      text: 'Você é escola de educação básica/superior ou cursos livres?',
      roi: 'Destrava enquadramento correto e possíveis imunidades',
      key: 'tipo_educacao',
      type: 'select',
      options: ['Educação básica/superior', 'Cursos livres/profissionalizantes', 'Ambos'],
    },
    {
      text: 'Sua instituição tem fins lucrativos?',
      roi: 'Destrava análise de imunidade tributária para entidades sem fins lucrativos',
      key: 'fins_lucrativos_edu',
    },
    {
      text: 'Você investe em tecnologia educacional?',
      roi: 'Destrava incentivos fiscais de inovação e P&D',
      key: 'tech_edu',
    },
    {
      text: 'Você atende alunos de outros estados?',
      roi: 'Destrava ISS por localização e otimização fiscal',
      key: 'multi_uf_edu',
      adds_tag: 'multi_uf',
    },
  ],
};

/**
 * Infer macro segment from a detailed sector value
 */
export function inferMacroFromSector(sector: string): string | null {
  for (const [macro, sectors] of Object.entries(MACRO_TO_SECTORS)) {
    if (sectors.some(s => s.value === sector)) return macro;
  }
  return null;
}
