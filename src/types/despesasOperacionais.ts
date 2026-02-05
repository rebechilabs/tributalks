export interface DespesaItem {
  id: string;
  nome: string;
}

export interface CategoriaDespesa {
  id: string;
  nome: string;
  items: DespesaItem[];
}

export const CATEGORIAS_DESPESAS: CategoriaDespesa[] = [
  {
    id: 'producao',
    nome: 'I. Produção e Prestação de Serviços',
    items: [
      { id: 'materia_prima', nome: 'Matéria-prima' },
      { id: 'produto_intermediario', nome: 'Produto intermediário' },
      { id: 'embalagem_primaria', nome: 'Material de embalagem primária' },
      { id: 'embalagem_secundaria', nome: 'Material de embalagem secundária' },
      { id: 'energia_eletrica', nome: 'Energia elétrica' },
      { id: 'energia_termica', nome: 'Energia térmica (vapor)' },
      { id: 'combustiveis_lubrificantes', nome: 'Combustíveis e lubrificantes' },
      { id: 'agua_produtivo', nome: 'Água (processo produtivo)' },
      { id: 'ferramentas_desgaste', nome: 'Ferramentas de desgaste rápido' },
      { id: 'industrializacao_encomenda', nome: 'Serviços de industrialização por encomenda' },
    ]
  },
  {
    id: 'logistica',
    nome: 'II. Logística e Transporte',
    items: [
      { id: 'frete_compra', nome: 'Frete sobre compra de insumos' },
      { id: 'frete_venda', nome: 'Frete sobre venda de produtos' },
      { id: 'armazenagem', nome: 'Armazenagem' },
      { id: 'paletes_conteineres', nome: 'Paletes e contêineres' },
      { id: 'seguro_transporte', nome: 'Seguro de transporte de carga' },
    ]
  },
  {
    id: 'manutencao',
    nome: 'III. Manutenção e Reparos',
    items: [
      { id: 'pecas_reposicao', nome: 'Peças de reposição para máquinas' },
      { id: 'manutencao_preventiva', nome: 'Manutenção preventiva' },
      { id: 'manutencao_corretiva', nome: 'Manutenção corretiva' },
      { id: 'calibracao_equipamentos', nome: 'Calibração de equipamentos' },
      { id: 'software_controle_maquinas', nome: 'Software de controle de máquinas' },
    ]
  },
  {
    id: 'qualidade',
    nome: 'IV. Qualidade e Conformidade',
    items: [
      { id: 'testes_qualidade', nome: 'Testes de qualidade' },
      { id: 'certificacoes', nome: 'Certificações obrigatórias (ISO, etc.)' },
      { id: 'tratamento_efluentes', nome: 'Tratamento de efluentes' },
      { id: 'controle_pragas', nome: 'Controle de pragas' },
      { id: 'licenciamento_ambiental', nome: 'Taxas de licenciamento ambiental' },
    ]
  },
  {
    id: 'seguranca',
    nome: 'V. Segurança e Saúde do Trabalho',
    items: [
      { id: 'epis', nome: 'EPIs (Súmula CARF)' },
      { id: 'uniformes', nome: 'Uniformes obrigatórios' },
      { id: 'exames_medicos', nome: 'Exames médicos ocupacionais' },
      { id: 'treinamentos_nrs', nome: 'Treinamentos de segurança (NRs)' },
      { id: 'medicina_trabalho', nome: 'Serviços de medicina do trabalho' },
    ]
  },
  {
    id: 'pessoal',
    nome: 'VI. Despesas com Pessoal (Jurisprudência)',
    items: [
      { id: 'vale_transporte', nome: 'Vale-transporte' },
      { id: 'vale_refeicao', nome: 'Vale-refeição/alimentação' },
      { id: 'seguro_vida', nome: 'Seguro de vida em grupo' },
      { id: 'plano_saude', nome: 'Plano de saúde' },
    ]
  },
  {
    id: 'alugueis',
    nome: 'VII. Aluguéis e Arrendamento',
    items: [
      { id: 'aluguel_predios', nome: 'Aluguel de prédios (PJ)' },
      { id: 'aluguel_maquinas', nome: 'Aluguel de máquinas (PJ)' },
      { id: 'leasing_veiculos', nome: 'Leasing de veículos' },
      { id: 'saas', nome: 'Software como Serviço (SaaS)' },
    ]
  },
  {
    id: 'outras',
    nome: 'VIII. Outras Despesas Relevantes',
    items: [
      { id: 'marketing_publicidade', nome: 'Marketing e publicidade' },
      { id: 'comissoes_vendas', nome: 'Comissões sobre vendas (PJ)' },
      { id: 'limpeza_area_produtiva', nome: 'Serviços de limpeza (área produtiva)' },
      { id: 'vigilancia_seguranca', nome: 'Vigilância e segurança' },
      { id: 'desembaraco_aduaneiro', nome: 'Desembaraço aduaneiro' },
      { id: 'royalties', nome: 'Royalties' },
      { id: 'contabilidade_consultoria', nome: 'Contabilidade e consultoria' },
      { id: 'depreciacao_maquinas', nome: 'Depreciação de máquinas' },
      { id: 'amortizacao_softwares', nome: 'Amortização de softwares' },
      { id: 'taxas_cartao', nome: 'Taxas de cartão de crédito' },
      { id: 'telecomunicacoes', nome: 'Telecomunicações (internet, telefone)' },
      { id: 'viagens_tecnicos', nome: 'Viagens de técnicos (manutenção)' },
    ]
  },
];

// Helper para obter todos os IDs de despesas
export const getAllDespesaIds = (): string[] => {
  return CATEGORIAS_DESPESAS.flatMap(cat => cat.items.map(item => item.id));
};

// Helper para obter o nome de uma despesa por ID
export const getDespesaNome = (id: string): string | undefined => {
  for (const categoria of CATEGORIAS_DESPESAS) {
    const item = categoria.items.find(i => i.id === id);
    if (item) return item.nome;
  }
  return undefined;
};
