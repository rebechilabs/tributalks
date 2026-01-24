export const UF_OPTIONS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export const MUNICIPIOS_PRINCIPAIS: Record<string, { codigo: number; nome: string }[]> = {
  SP: [
    { codigo: 3550308, nome: "São Paulo" },
    { codigo: 3509502, nome: "Campinas" },
    { codigo: 3518800, nome: "Guarulhos" },
    { codigo: 3547809, nome: "Santo André" },
    { codigo: 3548708, nome: "São Bernardo do Campo" },
    { codigo: 3534401, nome: "Osasco" },
    { codigo: 3543402, nome: "Ribeirão Preto" },
    { codigo: 3552205, nome: "Sorocaba" },
  ],
  RJ: [
    { codigo: 3304557, nome: "Rio de Janeiro" },
    { codigo: 3301702, nome: "Duque de Caxias" },
    { codigo: 3303500, nome: "Niterói" },
    { codigo: 3303302, nome: "Nova Iguaçu" },
    { codigo: 3304904, nome: "São Gonçalo" },
    { codigo: 3302858, nome: "Macaé" },
  ],
  MG: [
    { codigo: 3106200, nome: "Belo Horizonte" },
    { codigo: 3170206, nome: "Uberlândia" },
    { codigo: 3118601, nome: "Contagem" },
    { codigo: 3136702, nome: "Juiz de Fora" },
    { codigo: 3106705, nome: "Betim" },
  ],
  RS: [
    { codigo: 4314902, nome: "Porto Alegre" },
    { codigo: 4303905, nome: "Caxias do Sul" },
    { codigo: 4304606, nome: "Canoas" },
    { codigo: 4313409, nome: "Pelotas" },
  ],
  PR: [
    { codigo: 4106902, nome: "Curitiba" },
    { codigo: 4113700, nome: "Londrina" },
    { codigo: 4115200, nome: "Maringá" },
    { codigo: 4119905, nome: "Ponta Grossa" },
  ],
  SC: [
    { codigo: 4205407, nome: "Florianópolis" },
    { codigo: 4209102, nome: "Joinville" },
    { codigo: 4202404, nome: "Blumenau" },
  ],
  BA: [
    { codigo: 2927408, nome: "Salvador" },
    { codigo: 2910800, nome: "Feira de Santana" },
    { codigo: 2933307, nome: "Vitória da Conquista" },
  ],
  PE: [
    { codigo: 2611606, nome: "Recife" },
    { codigo: 2609600, nome: "Olinda" },
    { codigo: 2604106, nome: "Caruaru" },
  ],
  CE: [
    { codigo: 2304400, nome: "Fortaleza" },
    { codigo: 2304103, nome: "Caucaia" },
    { codigo: 2307304, nome: "Juazeiro do Norte" },
  ],
  DF: [
    { codigo: 5300108, nome: "Brasília" },
  ],
  GO: [
    { codigo: 5208707, nome: "Goiânia" },
    { codigo: 5201405, nome: "Anápolis" },
    { codigo: 5201108, nome: "Aparecida de Goiânia" },
  ],
  PA: [
    { codigo: 1501402, nome: "Belém" },
    { codigo: 1500800, nome: "Ananindeua" },
  ],
  AM: [
    { codigo: 1302603, nome: "Manaus" },
  ],
  MA: [
    { codigo: 2111300, nome: "São Luís" },
  ],
  MT: [
    { codigo: 5103403, nome: "Cuiabá" },
    { codigo: 5108402, nome: "Várzea Grande" },
  ],
  MS: [
    { codigo: 5002704, nome: "Campo Grande" },
    { codigo: 5003702, nome: "Dourados" },
  ],
  ES: [
    { codigo: 3205309, nome: "Vitória" },
    { codigo: 3205002, nome: "Vila Velha" },
    { codigo: 3201308, nome: "Cariacica" },
  ],
  PB: [
    { codigo: 2507507, nome: "João Pessoa" },
    { codigo: 2504009, nome: "Campina Grande" },
  ],
  RN: [
    { codigo: 2408102, nome: "Natal" },
    { codigo: 2407104, nome: "Mossoró" },
  ],
  PI: [
    { codigo: 2211001, nome: "Teresina" },
  ],
  AL: [
    { codigo: 2704302, nome: "Maceió" },
  ],
  SE: [
    { codigo: 2800308, nome: "Aracaju" },
  ],
  RO: [
    { codigo: 1100205, nome: "Porto Velho" },
  ],
  TO: [
    { codigo: 1721000, nome: "Palmas" },
  ],
  AC: [
    { codigo: 1200401, nome: "Rio Branco" },
  ],
  AP: [
    { codigo: 1600303, nome: "Macapá" },
  ],
  RR: [
    { codigo: 1400100, nome: "Boa Vista" },
  ],
};

export const CST_OPTIONS = [
  { value: "000", label: "000 - Tributação Normal" },
  { value: "200", label: "200 - Alíquota Reduzida" },
  { value: "550", label: "550 - Tributação Diferenciada" },
  { value: "900", label: "900 - Outras" },
];

export const UNIDADE_OPTIONS = [
  { value: "UN", label: "UN - Unidade" },
  { value: "KG", label: "KG - Quilograma" },
  { value: "L", label: "L - Litro" },
  { value: "M", label: "M - Metro" },
  { value: "M2", label: "M² - Metro quadrado" },
  { value: "M3", label: "M³ - Metro cúbico" },
  { value: "PC", label: "PC - Peça" },
  { value: "CX", label: "CX - Caixa" },
  { value: "DZ", label: "DZ - Dúzia" },
  { value: "PAR", label: "PAR - Par" },
];

export const WARNING_MESSAGES: Record<number, string> = {
  1: "Alíquotas CBS/IBS não definidas em lei",
  2: "Redutor de compras governamentais não definido",
  3: "Alíquotas e classificações IS não definidas",
  4: "Múltiplos parâmetros ainda não definidos",
  5: "Classificação tributária informada não definida em lei",
};

export const NCM_POPULARES = [
  { ncm: "84713012", descricao: "Notebooks e laptops" },
  { ncm: "85171210", descricao: "Smartphones" },
  { ncm: "94036000", descricao: "Móveis de madeira para escritório" },
  { ncm: "22011000", descricao: "Água mineral" },
  { ncm: "09012100", descricao: "Café torrado não descafeinado" },
  { ncm: "61091000", descricao: "Camisetas de algodão" },
  { ncm: "87032310", descricao: "Automóveis de passageiros" },
  { ncm: "30049099", descricao: "Medicamentos diversos" },
  { ncm: "19053100", descricao: "Biscoitos doces" },
  { ncm: "24021000", descricao: "Cigarros" },
];
