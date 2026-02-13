// src/data/ncms-monofasicos.ts
// Fonte: Leis 10.147/2000, 10.485/2002, 13.097/2015, 11.116/2005

export interface NcmMonofasico {
  ncm: string;
  descricao: string;
  categoria: string;
  baseLegal: string;
}

export interface CategoriaMonofasica {
  nome: string;
  baseLegal: string;
  ncms: NcmMonofasico[];
}

// ========================================
// NCMs EXPRESSAMENTE EXCLUÍDOS
// ========================================
export const NCMS_EXCLUIDOS: string[] = [
  "3306",        // Preparações para higiene bucal (Lei 10.147/2000, art. 1º, I, "a" - EXCLUSÃO)
  "3003.90.56",  // Outros medicamentos contendo outros produtos misturados entre si (alíquota zero, não monofásico)
  "3004.90.46",  // Outros medicamentos em doses (alíquota zero, não monofásico)
];

// ========================================
// CATEGORIAS
// ========================================

const MEDICAMENTOS: CategoriaMonofasica = {
  nome: "Medicamentos e Produtos Farmacêuticos",
  baseLegal: "Lei 10.147/2000, art. 1º",
  ncms: [
    { ncm: "3001", descricao: "Glândulas e outros órgãos para usos opoterápicos", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3002.10", descricao: "Antissoros e vacinas", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3002.90", descricao: "Outros produtos do sangue", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3003", descricao: "Medicamentos não acondicionados em doses", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3004", descricao: "Medicamentos acondicionados em doses", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3005.10.10", descricao: "Curativos adesivos esterilizados", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3006.10", descricao: "Categutes esterilizados e semelhantes", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3006.20", descricao: "Reagentes para determinação de grupos sanguíneos", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3006.30", descricao: "Preparações opacificantes para exames radiográficos", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3006.40", descricao: "Cimentos e obturações dentárias", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3006.60", descricao: "Preparações químicas contraceptivas", categoria: "Medicamentos", baseLegal: "Lei 10.147/2000" },
  ]
};

const HIGIENE_COSMETICOS: CategoriaMonofasica = {
  nome: "Higiene Pessoal e Cosméticos",
  baseLegal: "Lei 10.147/2000, art. 1º",
  ncms: [
    { ncm: "3303", descricao: "Perfumes e águas-de-colônia", categoria: "Cosméticos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3304", descricao: "Produtos de beleza e maquiagem", categoria: "Cosméticos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3305", descricao: "Preparações capilares", categoria: "Cosméticos", baseLegal: "Lei 10.147/2000" },
    { ncm: "3401.11", descricao: "Sabões de toucador", categoria: "Higiene", baseLegal: "Lei 10.147/2000" },
    { ncm: "3401.19", descricao: "Outros sabões", categoria: "Higiene", baseLegal: "Lei 10.147/2000" },
    { ncm: "3401.20", descricao: "Sabões em outras formas", categoria: "Higiene", baseLegal: "Lei 10.147/2000" },
    { ncm: "3401.30", descricao: "Produtos orgânicos para limpeza da pele", categoria: "Higiene", baseLegal: "Lei 10.147/2000" },
    { ncm: "9603.21.00", descricao: "Escovas de dentes", categoria: "Higiene", baseLegal: "Lei 10.147/2000" },
  ]
};

const VEICULOS_AUTOPECAS: CategoriaMonofasica = {
  nome: "Veículos e Autopeças",
  baseLegal: "Lei 10.485/2002",
  ncms: [
    { ncm: "8701", descricao: "Tratores", categoria: "Veículos", baseLegal: "Lei 10.485/2002" },
    { ncm: "8702", descricao: "Veículos para transporte coletivo", categoria: "Veículos", baseLegal: "Lei 10.485/2002" },
    { ncm: "8703", descricao: "Automóveis de passageiros", categoria: "Veículos", baseLegal: "Lei 10.485/2002" },
    { ncm: "8704", descricao: "Veículos para transporte de mercadorias", categoria: "Veículos", baseLegal: "Lei 10.485/2002" },
    { ncm: "8705", descricao: "Veículos especiais", categoria: "Veículos", baseLegal: "Lei 10.485/2002" },
    { ncm: "8706", descricao: "Chassis com motor", categoria: "Veículos", baseLegal: "Lei 10.485/2002" },
    { ncm: "8716.20.00", descricao: "Reboques e semi-reboques autocarregáveis", categoria: "Veículos", baseLegal: "Lei 10.485/2002" },
    { ncm: "4011", descricao: "Pneumáticos novos", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "4013", descricao: "Câmaras de ar", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "4009", descricao: "Tubos de borracha vulcanizada", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "4010", descricao: "Correias transportadoras de borracha", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "6813", descricao: "Guarnições de fricção (pastilhas de freio)", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "7007", descricao: "Vidros de segurança", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "7009", descricao: "Espelhos retrovisores", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8407", descricao: "Motores de pistão, ignição por centelha", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8408", descricao: "Motores de pistão, ignição por compressão (diesel)", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8409", descricao: "Partes de motores", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8413", descricao: "Bombas para líquidos", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8414", descricao: "Bombas de ar, compressores", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8421", descricao: "Centrifugadores e filtros", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8424", descricao: "Aparelhos mecânicos para pulverizar", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8483", descricao: "Árvores de transmissão, engrenagens", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8507", descricao: "Acumuladores elétricos (baterias)", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8511", descricao: "Aparelhos de ignição", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8512", descricao: "Aparelhos de iluminação e sinalização", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8527", descricao: "Aparelhos receptores de rádio", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8539", descricao: "Lâmpadas e tubos elétricos", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8544", descricao: "Fios, cabos e condutores elétricos", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8707", descricao: "Carrocerias", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8708", descricao: "Partes e acessórios de veículos", categoria: "Autopeças", baseLegal: "Lei 10.485/2002" },
    { ncm: "8432", descricao: "Máquinas agrícolas para preparação do solo", categoria: "Máquinas Agrícolas", baseLegal: "Lei 10.485/2002" },
    { ncm: "8433", descricao: "Máquinas agrícolas para colheita", categoria: "Máquinas Agrícolas", baseLegal: "Lei 10.485/2002" },
    { ncm: "8434", descricao: "Máquinas de ordenhar", categoria: "Máquinas Agrícolas", baseLegal: "Lei 10.485/2002" },
    { ncm: "8435", descricao: "Prensas para fabricação de vinho, sidra, sucos", categoria: "Máquinas Agrícolas", baseLegal: "Lei 10.485/2002" },
    { ncm: "8436", descricao: "Outras máquinas para agricultura", categoria: "Máquinas Agrícolas", baseLegal: "Lei 10.485/2002" },
    { ncm: "8437", descricao: "Máquinas para limpeza, seleção de grãos", categoria: "Máquinas Agrícolas", baseLegal: "Lei 10.485/2002" },
  ]
};

const BEBIDAS: CategoriaMonofasica = {
  nome: "Bebidas",
  baseLegal: "Lei 13.097/2015",
  ncms: [
    { ncm: "2201", descricao: "Águas minerais e gaseificadas", categoria: "Bebidas", baseLegal: "Lei 13.097/2015" },
    { ncm: "2202", descricao: "Águas com adição de açúcar, refrigerantes", categoria: "Bebidas", baseLegal: "Lei 13.097/2015" },
    { ncm: "2203", descricao: "Cervejas de malte", categoria: "Bebidas", baseLegal: "Lei 13.097/2015" },
    { ncm: "2204", descricao: "Vinhos de uvas frescas", categoria: "Bebidas", baseLegal: "Lei 13.097/2015" },
    { ncm: "2106.90.10", descricao: "Preparações compostas para bebidas", categoria: "Bebidas", baseLegal: "Lei 13.097/2015" },
    { ncm: "2202.91.00", descricao: "Cerveja sem álcool", categoria: "Bebidas", baseLegal: "Lei 13.097/2015" },
    { ncm: "2202.99", descricao: "Outras bebidas não alcoólicas", categoria: "Bebidas", baseLegal: "Lei 13.097/2015" },
  ]
};

const COMBUSTIVEIS: CategoriaMonofasica = {
  nome: "Combustíveis e Derivados de Petróleo",
  baseLegal: "Lei 11.116/2005; Lei 9.718/1998, art. 4º",
  ncms: [
    { ncm: "2207", descricao: "Álcool etílico (etanol)", categoria: "Combustíveis", baseLegal: "Lei 11.116/2005" },
    { ncm: "2710", descricao: "Óleos de petróleo (gasolina, diesel, querosene)", categoria: "Combustíveis", baseLegal: "Lei 9.718/1998" },
    { ncm: "2713", descricao: "Coque de petróleo e outros resíduos", categoria: "Combustíveis", baseLegal: "Lei 9.718/1998" },
  ]
};

// ========================================
// LISTA CONSOLIDADA
// ========================================
export const CATEGORIAS_MONOFASICAS: CategoriaMonofasica[] = [
  MEDICAMENTOS,
  HIGIENE_COSMETICOS,
  VEICULOS_AUTOPECAS,
  BEBIDAS,
  COMBUSTIVEIS,
];

// Lista flat de todos os NCMs
export const TODOS_NCMS_MONOFASICOS: NcmMonofasico[] = CATEGORIAS_MONOFASICAS.flatMap(c => c.ncms);

// ========================================
// FUNÇÃO DE VERIFICAÇÃO
// ========================================

/**
 * Verifica se um NCM corresponde a um produto monofásico.
 * Faz match por prefixo e exclui NCMs expressamente excluídos.
 * 
 * @param ncm Código NCM do produto (ex: "33041000", "87089900")
 * @returns Dados do NCM monofásico encontrado, ou null
 */
export function verificarNcmMonofasico(ncm: string): NcmMonofasico | null {
  if (!ncm) return null;

  const ncmLimpo = ncm.replace(/[.\-\s]/g, '');

  // Verificar exclusões primeiro
  for (const excluido of NCMS_EXCLUIDOS) {
    const excluidoLimpo = excluido.replace(/[.\-\s]/g, '');
    if (ncmLimpo.startsWith(excluidoLimpo)) {
      return null;
    }
  }

  // Buscar match por prefixo (do mais específico para o mais genérico)
  const todosOrdenados = [...TODOS_NCMS_MONOFASICOS].sort(
    (a, b) => b.ncm.replace(/[.\-\s]/g, '').length - a.ncm.replace(/[.\-\s]/g, '').length
  );

  for (const item of todosOrdenados) {
    const prefixoLimpo = item.ncm.replace(/[.\-\s]/g, '');
    if (ncmLimpo.startsWith(prefixoLimpo)) {
      return item;
    }
  }

  return null;
}
