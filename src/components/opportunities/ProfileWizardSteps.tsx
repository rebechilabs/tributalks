import { 
  Monitor, 
  Factory, 
  ShoppingBag, 
  Wrench, 
  HeartPulse, 
  Wheat,
  Sun,
  HardHat,
  Truck,
  UtensilsCrossed,
  GraduationCap,
  Store,
  Palette
} from "lucide-react";

// Step 1: Setor options - expanded with new sectors
export const SETOR_OPTIONS = [
  { value: 'comercio', label: 'Comércio', icon: ShoppingBag, description: 'Loja, varejo, atacado' },
  { value: 'servicos', label: 'Serviços', icon: Wrench, description: 'Consultoria, profissional' },
  { value: 'industria', label: 'Indústria', icon: Factory, description: 'Fábrica, produção' },
  { value: 'tecnologia', label: 'Tecnologia', icon: Monitor, description: 'Software, TI, apps' },
  { value: 'saude', label: 'Saúde', icon: HeartPulse, description: 'Clínica, hospital, lab' },
  { value: 'agro', label: 'Agronegócio', icon: Wheat, description: 'Fazenda, agrícola, pecuária' },
  { value: 'alimentacao', label: 'Alimentação', icon: UtensilsCrossed, description: 'Restaurante, bar, lanchonete' },
  { value: 'construcao', label: 'Construção', icon: HardHat, description: 'Construtora, incorporadora' },
  { value: 'transporte', label: 'Transporte', icon: Truck, description: 'Logística, frete, entregas' },
  { value: 'educacao', label: 'Educação', icon: GraduationCap, description: 'Escola, curso, treinamento' },
  { value: 'energia', label: 'Energia Solar', icon: Sun, description: 'Geração, instalação solar' },
  { value: 'ecommerce', label: 'E-commerce', icon: Store, description: 'Loja online, marketplace' },
  { value: 'artesanato', label: 'Artesanato (Produção)', icon: Palette, description: 'Artesão, produção manual, arte popular' },
  { value: 'comercio_artesanato', label: 'Comércio de Artesanato', icon: Store, description: 'Loja de artesanato, revenda de produtos artesanais' },
];

// Step 2: Porte/Faturamento options
export const FATURAMENTO_OPTIONS = [
  { value: 'mei', label: 'Até R$ 81 mil/ano', tag: 'MEI', faturamentoAnual: 81000 },
  { value: 'micro', label: 'R$ 81 mil a R$ 360 mil/ano', tag: 'Micro', faturamentoAnual: 220000 },
  { value: 'pequena', label: 'R$ 360 mil a R$ 4,8 milhões/ano', tag: 'Pequena', faturamentoAnual: 2400000 },
  { value: 'media', label: 'R$ 4,8 a R$ 78 milhões/ano', tag: 'Média', faturamentoAnual: 40000000 },
  { value: 'grande', label: 'Acima de R$ 78 milhões/ano', tag: 'Grande', faturamentoAnual: 100000000 },
];

// Step 3: Produtos específicos - expanded for new sectors
export const PRODUTOS_ESPECIFICOS = [
  { field: 'vende_combustiveis', label: 'Combustíveis (posto, distribuidora)' },
  { field: 'vende_bebidas', label: 'Bebidas (cervejas, refrigerantes, águas)' },
  { field: 'vende_farmacos', label: 'Medicamentos / Produtos farmacêuticos' },
  { field: 'vende_cosmeticos', label: 'Cosméticos / Perfumaria / Higiene pessoal' },
  { field: 'vende_autopecas', label: 'Autopeças / Pneus' },
  { field: 'vende_eletronicos', label: 'Eletrônicos / Informática' },
  { field: 'vende_automoveis', label: 'Veículos / Automóveis' },
];

// Sector-specific characteristics
export const SECTOR_CHARACTERISTICS: Record<string, { field: string; label: string; description?: string }[]> = {
  agro: [
    { field: 'tem_area_preservacao', label: 'Tenho área de preservação (APP/Reserva Legal)', description: 'Reduz ITR' },
    { field: 'comercializa_commodities', label: 'Comercializo commodities (soja, milho, café)', description: 'Diferimento ICMS' },
    { field: 'compra_insumos', label: 'Compro insumos agrícolas (sementes, fertilizantes)', description: 'Isenção ICMS' },
    { field: 'investe_maquinas', label: 'Invisto em máquinas e tratores', description: 'Depreciação acelerada' },
    { field: 'tipo_cooperativa', label: 'Sou cooperativa agrícola', description: 'Regime especial' },
  ],
  energia: [
    { field: 'tem_geracao_solar', label: 'Tenho sistema de geração solar instalado', description: 'Isenção ICMS' },
    { field: 'compra_equipamento_solar', label: 'Compro/vendo painéis e equipamentos solares', description: 'Isenção IPI' },
    { field: 'importa_equipamento_solar', label: 'Importo equipamentos de energia solar', description: 'PIS/COFINS zero' },
    { field: 'projeto_infraestrutura', label: 'Tenho projetos de infraestrutura energética', description: 'REIDI' },
  ],
  saude: [
    { field: 'tem_internacao_ou_procedimento_complexo', label: 'Tenho internação ou procedimentos complexos', description: 'Equiparação hospitalar' },
    { field: 'comercializa_medicamentos', label: 'Comercializo medicamentos', description: 'PIS/COFINS reduzido' },
    { field: 'compra_equipamentos_medicos', label: 'Compro órteses, próteses ou equipamentos médicos', description: 'Isenção ICMS' },
    { field: 'investe_pd_saude', label: 'Invisto em pesquisa e desenvolvimento na área de saúde', description: 'Lei do Bem' },
  ],
  construcao: [
    { field: 'incorporacao_imobiliaria', label: 'Faço incorporação imobiliária', description: 'RET 4%' },
    { field: 'programa_mcmv', label: 'Participo do Minha Casa Minha Vida', description: 'Tributação 1%' },
    { field: 'folha_alta_construcao', label: 'Tenho muitos funcionários em obra', description: 'Desoneração da folha' },
  ],
  transporte: [
    { field: 'transporte_cargas', label: 'Transporte de cargas / Frete', description: 'Crédito presumido ICMS' },
    { field: 'transporte_passageiros', label: 'Transporte de passageiros', description: 'Fator R Simples' },
    { field: 'operacao_interestadual', label: 'Opero entre estados', description: 'Redução BC ICMS' },
    { field: 'investe_frota', label: 'Invisto em renovação de frota', description: 'Subvenção' },
    { field: 'frete_exportacao', label: 'Faço frete de mercadorias para exportação', description: 'Isenção PIS/COFINS' },
  ],
  alimentacao: [
    { field: 'prepara_alimentos', label: 'Preparo alimentos no local', description: 'Redução 40% IBS/CBS' },
    { field: 'recebe_gorjetas', label: 'Recebo gorjetas', description: 'Exclusão da base tributária' },
    { field: 'usa_plataformas_delivery', label: 'Vendo via iFood, Rappi ou similar', description: 'Exclusão taxas' },
    { field: 'tem_bar', label: 'Tenho bar/bebidas alcoólicas', description: 'Regime especial' },
  ],
  ecommerce: [
    { field: 'tem_ecommerce', label: 'Tenho loja virtual própria' },
    { field: 'tem_marketplace', label: 'Vendo em marketplaces (Mercado Livre, Amazon, etc.)' },
    { field: 'centro_distribuicao_incentivado', label: 'CD em estado com incentivo fiscal (SC, ES, GO)', description: 'TTD/Compete' },
    { field: 'centro_distribuicao_zfm', label: 'Tenho operação na Zona Franca de Manaus', description: 'Isenções ZFM' },
    { field: 'vende_produtos_monofasicos', label: 'Vendo cosméticos, bebidas, autopeças online', description: 'Monofásico' },
  ],
  educacao: [
    { field: 'escola_regular', label: 'Escola de educação básica ou superior' },
    { field: 'cursos_livres', label: 'Cursos livres / Treinamentos' },
    { field: 'fins_lucrativos', label: 'Instituição COM fins lucrativos', description: 'Se não marcar, pode ser imune' },
    { field: 'investe_tecnologia_educacional', label: 'Invisto em tecnologia educacional', description: 'Dedução IR' },
  ],
  artesanato: [
    { field: 'tem_carteira_artesao', label: 'Possuo Carteira Nacional do Artesão', description: 'Benefícios PAB' },
    { field: 'artesanato_regional', label: 'Produzo artesanato regional/típico', description: 'Isenção ICMS Convênio 32/75' },
    { field: 'mei_artesao', label: 'Sou MEI como artesão', description: 'CNAE específico de artesanato' },
    { field: 'venda_direta_consumidor', label: 'Vendo diretamente ao consumidor final', description: 'Sem ST' },
    { field: 'participa_feiras', label: 'Participo de feiras e exposições', description: 'Regime especial eventos' },
    { field: 'exporta_artesanato', label: 'Exporto produtos artesanais', description: 'Imunidade exportação' },
    { field: 'usa_insumos_naturais', label: 'Uso matérias-primas naturais/recicladas', description: 'Isenção IPI' },
  ],
  comercio_artesanato: [
    { field: 'compra_artesao_local', label: 'Compro de artesãos locais', description: 'Apoio economia local' },
    { field: 'compra_cooperativas', label: 'Compro de cooperativas de artesãos', description: 'Benefícios cooperativismo' },
    { field: 'revende_artesanato_regional', label: 'Revendo artesanato regional/típico', description: 'Possível isenção ICMS' },
    { field: 'loja_fisica_artesanato', label: 'Tenho loja física especializada', description: 'Pode ter regime especial' },
    { field: 'vende_turistas', label: 'Vendo para turistas', description: 'Roteiros turísticos' },
    { field: 'exporta_revenda_artesanato', label: 'Exporto artesanato que revendo', description: 'Imunidade exportação' },
    { field: 'participa_feiras_revenda', label: 'Participo de feiras como expositor', description: 'Regime especial eventos' },
  ],
};

// Step 5: Regime tributário options
export const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional', description: 'Pago o DAS mensalmente' },
  { value: 'presumido', label: 'Lucro Presumido', description: 'Tributação sobre receita presumida' },
  { value: 'real', label: 'Lucro Real', description: 'Tributação sobre lucro efetivo' },
  { value: 'misto', label: 'Regimes diferentes no grupo', description: 'Tenho empresas em regimes diferentes' },
  { value: 'nao_sei', label: 'Não sei', description: 'Vou perguntar ao contador' },
];

// Step 6: Folha options
export const FOLHA_OPTIONS = [
  { value: 'baixa', label: 'Menos de 20%', percentual: 15 },
  { value: 'media', label: 'Entre 20% e 28%', percentual: 24 },
  { value: 'alta', label: 'Mais de 28%', percentual: 35, highlight: true },
  { value: 'nao_sei', label: 'Não sei', percentual: 0 },
];

// Wizard steps configuration
export const WIZARD_STEPS = [
  { id: 1, title: 'Seu Negócio', description: 'Setor de atuação' },
  { id: 2, title: 'Tamanho', description: 'Faturamento anual' },
  { id: 3, title: 'O que Vende', description: 'Produtos e serviços' },
  { id: 4, title: 'Para Quem', description: 'Clientes e abrangência' },
  { id: 5, title: 'Estrutura', description: 'CNPJs e regime' },
  { id: 6, title: 'Especial', description: 'Características extras' },
];

export interface ProfileFormData {
  // Step 1
  setor: string;
  
  // Step 2
  porte: string;
  faturamento_anual: number;
  
  // Step 3
  vende_produtos: boolean;
  vende_servicos: boolean;
  vende_combustiveis: boolean;
  vende_bebidas: boolean;
  vende_farmacos: boolean;
  vende_cosmeticos: boolean;
  vende_autopecas: boolean;
  vende_pneus: boolean;
  vende_eletronicos: boolean;
  vende_automoveis: boolean;
  tem_produtos_monofasicos: boolean;
  tem_atividades_mistas: boolean;
  
  // Step 4
  vende_pf: boolean;
  vende_pj: boolean;
  percentual_pf: number;
  percentual_pj: number;
  vende_governo: boolean;
  opera_outros_estados: boolean;
  exporta_produtos: boolean;
  exporta_servicos: boolean;
  
  // Step 5
  qtd_cnpjs: number;
  tem_holding: boolean;
  tem_filiais: boolean;
  regime_tributario: string;
  
  // Step 6 - General
  tem_atividade_pd: boolean;
  tem_patentes: boolean;
  zona_franca: boolean;
  folha_percentual_faturamento: number;
  
  // Step 6 - Sector specific
  // Agro
  tem_area_preservacao: boolean;
  comercializa_commodities: boolean;
  compra_insumos: boolean;
  investe_maquinas: boolean;
  tipo_cooperativa: boolean;
  
  // Energia
  tem_geracao_solar: boolean;
  compra_equipamento_solar: boolean;
  importa_equipamento_solar: boolean;
  projeto_infraestrutura: boolean;
  
  // Saúde
  tem_internacao_ou_procedimento_complexo: boolean;
  comercializa_medicamentos: boolean;
  compra_equipamentos_medicos: boolean;
  investe_pd_saude: boolean;
  
  // Construção
  incorporacao_imobiliaria: boolean;
  programa_mcmv: boolean;
  folha_alta_construcao: boolean;
  
  // Transporte
  transporte_cargas: boolean;
  transporte_passageiros: boolean;
  operacao_interestadual: boolean;
  investe_frota: boolean;
  frete_exportacao: boolean;
  
  // Alimentação
  prepara_alimentos: boolean;
  recebe_gorjetas: boolean;
  usa_plataformas_delivery: boolean;
  tem_bar: boolean;
  
  // E-commerce
  tem_ecommerce: boolean;
  tem_marketplace: boolean;
  centro_distribuicao_incentivado: boolean;
  centro_distribuicao_zfm: boolean;
  vende_produtos_monofasicos: boolean;
  
  // Educação
  escola_regular: boolean;
  cursos_livres: boolean;
  fins_lucrativos: boolean;
  investe_tecnologia_educacional: boolean;
  
  // Artesanato (Produção)
  tem_carteira_artesao: boolean;
  artesanato_regional: boolean;
  mei_artesao: boolean;
  venda_direta_consumidor: boolean;
  participa_feiras: boolean;
  exporta_artesanato: boolean;
  usa_insumos_naturais: boolean;
  
  // Comércio de Artesanato
  compra_artesao_local: boolean;
  compra_cooperativas: boolean;
  revende_artesanato_regional: boolean;
  loja_fisica_artesanato: boolean;
  vende_turistas: boolean;
  exporta_revenda_artesanato: boolean;
  participa_feiras_revenda: boolean;
}

export const INITIAL_PROFILE_DATA: ProfileFormData = {
  setor: '',
  porte: '',
  faturamento_anual: 0,
  vende_produtos: false,
  vende_servicos: false,
  vende_combustiveis: false,
  vende_bebidas: false,
  vende_farmacos: false,
  vende_cosmeticos: false,
  vende_autopecas: false,
  vende_pneus: false,
  vende_eletronicos: false,
  vende_automoveis: false,
  tem_produtos_monofasicos: false,
  tem_atividades_mistas: false,
  vende_pf: false,
  vende_pj: false,
  percentual_pf: 50,
  percentual_pj: 50,
  vende_governo: false,
  opera_outros_estados: false,
  exporta_produtos: false,
  exporta_servicos: false,
  qtd_cnpjs: 1,
  tem_holding: false,
  tem_filiais: false,
  regime_tributario: '',
  tem_atividade_pd: false,
  tem_patentes: false,
  zona_franca: false,
  folha_percentual_faturamento: 0,
  // Agro
  tem_area_preservacao: false,
  comercializa_commodities: false,
  compra_insumos: false,
  investe_maquinas: false,
  tipo_cooperativa: false,
  // Energia
  tem_geracao_solar: false,
  compra_equipamento_solar: false,
  importa_equipamento_solar: false,
  projeto_infraestrutura: false,
  // Saúde
  tem_internacao_ou_procedimento_complexo: false,
  comercializa_medicamentos: false,
  compra_equipamentos_medicos: false,
  investe_pd_saude: false,
  // Construção
  incorporacao_imobiliaria: false,
  programa_mcmv: false,
  folha_alta_construcao: false,
  // Transporte
  transporte_cargas: false,
  transporte_passageiros: false,
  operacao_interestadual: false,
  investe_frota: false,
  frete_exportacao: false,
  // Alimentação
  prepara_alimentos: false,
  recebe_gorjetas: false,
  usa_plataformas_delivery: false,
  tem_bar: false,
  // E-commerce
  tem_ecommerce: false,
  tem_marketplace: false,
  centro_distribuicao_incentivado: false,
  centro_distribuicao_zfm: false,
  vende_produtos_monofasicos: false,
  // Educação
  escola_regular: false,
  cursos_livres: false,
  fins_lucrativos: true, // Default true (most are for-profit)
  investe_tecnologia_educacional: false,
  // Artesanato (Produção)
  tem_carteira_artesao: false,
  artesanato_regional: false,
  mei_artesao: false,
  venda_direta_consumidor: false,
  participa_feiras: false,
  exporta_artesanato: false,
  usa_insumos_naturais: false,
  // Comércio de Artesanato
  compra_artesao_local: false,
  compra_cooperativas: false,
  revende_artesanato_regional: false,
  loja_fisica_artesanato: false,
  vende_turistas: false,
  exporta_revenda_artesanato: false,
  participa_feiras_revenda: false,
};
