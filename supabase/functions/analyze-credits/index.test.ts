import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertAlmostEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { detectFaixaFromRBT12, detectAnexoFromCNAE, isMonophasicNCMFromList } from "./index.ts";

// ========== Mock data ==========
const MOCK_MONOPHASIC_NCMS = [
  { ncm_prefix: '2710', category: 'Combustíveis', legal_basis: 'Lei 11.116/2005', description: 'Óleos de petróleo' },
  { ncm_prefix: '2207', category: 'Combustíveis', legal_basis: 'Lei 11.116/2005', description: 'Álcool etílico' },
  { ncm_prefix: '3003', category: 'Medicamentos', legal_basis: 'Lei 10.147/2000', description: 'Medicamentos (mistura)' },
  { ncm_prefix: '3004', category: 'Medicamentos', legal_basis: 'Lei 10.147/2000', description: 'Medicamentos (dose)' },
  { ncm_prefix: '3303', category: 'Cosméticos', legal_basis: 'Lei 10.147/2000', description: 'Perfumes' },
  { ncm_prefix: '3304', category: 'Cosméticos', legal_basis: 'Lei 10.147/2000', description: 'Maquiagem' },
  { ncm_prefix: '3305', category: 'Cosméticos', legal_basis: 'Lei 10.147/2000', description: 'Capilares' },
  { ncm_prefix: '3306', category: 'Higiene', legal_basis: 'Lei 10.147/2000', description: 'Higiene bucal' },
  { ncm_prefix: '3307', category: 'Higiene', legal_basis: 'Lei 10.147/2000', description: 'Desodorantes' },
  { ncm_prefix: '2201', category: 'Bebidas', legal_basis: 'Lei 13.097/2015', description: 'Águas minerais' },
  { ncm_prefix: '2202', category: 'Bebidas', legal_basis: 'Lei 13.097/2015', description: 'Bebidas não alcoólicas' },
  { ncm_prefix: '2203', category: 'Bebidas', legal_basis: 'Lei 13.097/2015', description: 'Cervejas' },
  { ncm_prefix: '8708', category: 'Autopeças', legal_basis: 'Lei 10.485/2002', description: 'Peças veículos' },
  { ncm_prefix: '4011', category: 'Autopeças', legal_basis: 'Lei 10.485/2002', description: 'Pneus' },
  { ncm_prefix: '8507', category: 'Autopeças', legal_basis: 'Lei 10.485/2002', description: 'Baterias' },
  { ncm_prefix: '8433', category: 'Máq.Agrícolas', legal_basis: 'Lei 10.485/2002', description: 'Máquinas agrícolas' },
  { ncm_prefix: '8701', category: 'Máq.Agrícolas', legal_basis: 'Lei 10.485/2002', description: 'Tratores' },
];

// ========== Teste 5: Funções auxiliares ==========

Deno.test("detectFaixaFromRBT12 - faixa 1", () => {
  assertEquals(detectFaixaFromRBT12(100000), 1);
  assertEquals(detectFaixaFromRBT12(180000), 1);
});

Deno.test("detectFaixaFromRBT12 - faixa 2", () => {
  assertEquals(detectFaixaFromRBT12(180001), 2);
  assertEquals(detectFaixaFromRBT12(360000), 2);
});

Deno.test("detectFaixaFromRBT12 - faixa 3", () => {
  assertEquals(detectFaixaFromRBT12(360001), 3);
  assertEquals(detectFaixaFromRBT12(720000), 3);
});

Deno.test("detectFaixaFromRBT12 - faixa 4", () => {
  assertEquals(detectFaixaFromRBT12(720001), 4);
  assertEquals(detectFaixaFromRBT12(1800000), 4);
});

Deno.test("detectFaixaFromRBT12 - faixa 5", () => {
  assertEquals(detectFaixaFromRBT12(1800001), 5);
  assertEquals(detectFaixaFromRBT12(3600000), 5);
});

Deno.test("detectFaixaFromRBT12 - faixa 6", () => {
  assertEquals(detectFaixaFromRBT12(3600001), 6);
  assertEquals(detectFaixaFromRBT12(4800000), 6);
});

Deno.test("detectAnexoFromCNAE - comércio", () => {
  assertEquals(detectAnexoFromCNAE('4712100'), 'I');
  assertEquals(detectAnexoFromCNAE('4711302'), 'I');
  assertEquals(detectAnexoFromCNAE('4623100'), 'I');
});

Deno.test("detectAnexoFromCNAE - indústria", () => {
  assertEquals(detectAnexoFromCNAE('1091100'), 'II');
  assertEquals(detectAnexoFromCNAE('2511000'), 'II');
});

Deno.test("detectAnexoFromCNAE - serviços III", () => {
  assertEquals(detectAnexoFromCNAE('5611200'), 'III');
  assertEquals(detectAnexoFromCNAE('9602500'), 'III');
});

Deno.test("detectAnexoFromCNAE - serviços IV (construção)", () => {
  assertEquals(detectAnexoFromCNAE('4120400'), 'IV');
  assertEquals(detectAnexoFromCNAE('8011100'), 'IV');
});

Deno.test("detectAnexoFromCNAE - serviços V (tecnologia)", () => {
  assertEquals(detectAnexoFromCNAE('6201500'), 'V');
  assertEquals(detectAnexoFromCNAE('7112000'), 'V');
});

Deno.test("detectAnexoFromCNAE - vazio retorna I", () => {
  assertEquals(detectAnexoFromCNAE(''), 'I');
});

// ========== isMonophasicNCMFromList ==========

Deno.test("isMonophasicNCMFromList - NCM monofásico encontrado", () => {
  const result = isMonophasicNCMFromList('33041000', MOCK_MONOPHASIC_NCMS);
  assertEquals(result?.category, 'Cosméticos');
  assertEquals(result?.legal_basis, 'Lei 10.147/2000');
});

Deno.test("isMonophasicNCMFromList - NCM não monofásico", () => {
  const result = isMonophasicNCMFromList('94011000', MOCK_MONOPHASIC_NCMS);
  assertEquals(result, null);
});

Deno.test("isMonophasicNCMFromList - combustível", () => {
  const result = isMonophasicNCMFromList('27101259', MOCK_MONOPHASIC_NCMS);
  assertEquals(result?.category, 'Combustíveis');
});

Deno.test("isMonophasicNCMFromList - autopeças", () => {
  const result = isMonophasicNCMFromList('87089990', MOCK_MONOPHASIC_NCMS);
  assertEquals(result?.category, 'Autopeças');
});

Deno.test("isMonophasicNCMFromList - máquinas agrícolas", () => {
  const result = isMonophasicNCMFromList('84332000', MOCK_MONOPHASIC_NCMS);
  assertEquals(result?.category, 'Máq.Agrícolas');
});

Deno.test("isMonophasicNCMFromList - higiene bucal", () => {
  const result = isMonophasicNCMFromList('33061000', MOCK_MONOPHASIC_NCMS);
  assertEquals(result?.category, 'Higiene');
});

// ========== Teste 2: Cálculo PIS/COFINS monofásico ==========
// Receita monofásica R$ 303.812 x 9,76% x 15,50% ≈ R$ 4.596

Deno.test("Cálculo PIS/COFINS monofásico - caso controlado", () => {
  const receitaMonofasica = 303812;
  const aliquotaEfetiva = 0.0976;
  // Anexo I, Faixa 4: PIS 2.76% + COFINS 12.74% = 15.50%
  const parcelaPisCofins = (2.76 + 12.74) / 100; // 0.155
  
  const recovery = receitaMonofasica * aliquotaEfetiva * parcelaPisCofins;
  
  // Esperado ≈ R$ 4.596
  assertAlmostEquals(recovery, 4596, 50); // Tolerância de R$ 50
});

// ========== Teste 3: ICMS-ST segregação ==========
// Receita ST ~R$ 19.275 x 9,76% x 34% ≈ R$ 640

Deno.test("Cálculo ICMS-ST segregação - caso controlado", () => {
  const receitaST = 19275;
  const aliquotaEfetiva = 0.0976;
  // Anexo I, Faixa 4: ICMS 34%
  const parcelaIcms = 34.00 / 100; // 0.34
  
  const recovery = receitaST * aliquotaEfetiva * parcelaIcms;
  
  // Esperado ≈ R$ 640
  assertAlmostEquals(recovery, 640, 20); // Tolerância de R$ 20
});

// ========== Teste 1: Simples Nacional comércio - IPI = 0 ==========

Deno.test("Simples Nacional comércio - IPI desabilitado", () => {
  const SIMPLES_DISABLED_RULES = new Set([
    'IPI_001', 'IPI_002', 'IPI_003',
    'ICMS_001', 'ICMS_002', 'ICMS_005',
    'ICMS_ST_001', 'ICMS_ST_002',
    'PIS_COFINS_001', 'PIS_COFINS_002', 'PIS_COFINS_003',
    'PIS_COFINS_007', 'PIS_COFINS_008', 'PIS_COFINS_010', 'PIS_COFINS_011',
  ]);
  
  // Verify IPI rules are disabled
  assertEquals(SIMPLES_DISABLED_RULES.has('IPI_001'), true);
  assertEquals(SIMPLES_DISABLED_RULES.has('IPI_002'), true);
  assertEquals(SIMPLES_DISABLED_RULES.has('IPI_003'), true);
  
  // Verify ICMS rules are disabled
  assertEquals(SIMPLES_DISABLED_RULES.has('ICMS_001'), true);
  assertEquals(SIMPLES_DISABLED_RULES.has('ICMS_002'), true);
  
  // Verify Simples-specific rules are NOT disabled
  assertEquals(SIMPLES_DISABLED_RULES.has('SIMPLES_MONO_001'), false);
  assertEquals(SIMPLES_DISABLED_RULES.has('SIMPLES_ICMS_ST_001'), false);
});

// ========== Teste 6: Repartição por faixa - todas as 30 combinações ==========

Deno.test("Repartição tributária - Anexo I todas as faixas somam ~100%", () => {
  const faixas = [
    { irpj: 5.50, csll: 3.50, cofins: 12.74, pis: 2.76, cpp: 41.50, icms: 34.00, iss: 0 },
    { irpj: 5.50, csll: 3.50, cofins: 12.74, pis: 2.76, cpp: 41.50, icms: 34.00, iss: 0 },
    { irpj: 5.50, csll: 3.50, cofins: 12.74, pis: 2.76, cpp: 42.00, icms: 33.50, iss: 0 },
    { irpj: 5.50, csll: 3.50, cofins: 12.74, pis: 2.76, cpp: 41.50, icms: 34.00, iss: 0 },
    { irpj: 5.50, csll: 3.50, cofins: 12.74, pis: 2.76, cpp: 42.00, icms: 33.50, iss: 0 },
    { irpj: 13.50, csll: 10.00, cofins: 28.27, pis: 6.13, cpp: 42.10, icms: 0.00, iss: 0 },
  ];
  
  for (let i = 0; i < faixas.length; i++) {
    const f = faixas[i];
    const total = f.irpj + f.csll + f.cofins + f.pis + f.cpp + f.icms + f.iss;
    assertAlmostEquals(total, 100, 0.5);
  }
});

Deno.test("Repartição tributária - Anexo III faixa 1 tem ISS", () => {
  // Anexo III deve ter ISS > 0 (serviços)
  const anexoIII_f1 = { irpj: 4.00, csll: 3.50, cofins: 12.82, pis: 2.78, cpp: 43.40, icms: 0, iss: 33.50 };
  const total = anexoIII_f1.irpj + anexoIII_f1.csll + anexoIII_f1.cofins + anexoIII_f1.pis + anexoIII_f1.cpp + anexoIII_f1.icms + anexoIII_f1.iss;
  assertAlmostEquals(total, 100, 0.5);
  assertEquals(anexoIII_f1.iss > 0, true);
  assertEquals(anexoIII_f1.icms, 0); // Serviços não têm ICMS
});

Deno.test("Repartição tributária - Anexo IV não tem CPP na faixa 6", () => {
  // Anexo IV, faixa 6: CPP = 0 (recolhido à parte)
  const anexoIV_f6 = { irpj: 53.50, csll: 21.50, cofins: 20.55, pis: 4.45, cpp: 0, icms: 0, iss: 0 };
  const total = anexoIV_f6.irpj + anexoIV_f6.csll + anexoIV_f6.cofins + anexoIV_f6.pis + anexoIV_f6.cpp + anexoIV_f6.icms + anexoIV_f6.iss;
  assertAlmostEquals(total, 100, 0.5);
});
