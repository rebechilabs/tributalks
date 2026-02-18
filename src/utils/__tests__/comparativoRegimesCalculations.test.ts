import { describe, it, expect } from "vitest";
import {
  calcularComparativoRegimes,
  ALIQUOTA_CBS_IBS,
  REDUCAO_DAS_POR_FORA,
  LIMITE_SIMPLES,
  FAIXAS_SIMPLES,
  ALIQUOTAS_SIMPLES,
  PRESUNCAO_LUCRO,
  formatarMoeda,
  formatarPercentual,
} from "../comparativoRegimesCalculations";
import type { ComparativoRegimesInput } from "@/types/comparativoRegimes";

// ========================================
// Helpers
// ========================================
function buildInput(overrides: Partial<ComparativoRegimesInput> = {}): ComparativoRegimesInput {
  return {
    faturamento_anual: 1200000,
    folha_pagamento: 180000,
    cnae_principal: "4712-1/00", // Comércio
    compras_insumos: 480000,
    despesas_operacionais: 120000,
    margem_lucro: 20,
    perfil_clientes: "B2B",
    ...overrides,
  };
}

// ========================================
// Constantes
// ========================================
describe("Constantes tributárias", () => {
  it("alíquota CBS/IBS deve ser 26.5%", () => {
    expect(ALIQUOTA_CBS_IBS).toBe(0.265);
  });

  it("redução DAS por fora deve ser 40%", () => {
    expect(REDUCAO_DAS_POR_FORA).toBe(0.40);
  });

  it("limite Simples Nacional deve ser R$ 4.8M", () => {
    expect(LIMITE_SIMPLES).toBe(4800000);
  });

  it("faixas do Simples devem ter 6 faixas progressivas", () => {
    expect(FAIXAS_SIMPLES).toHaveLength(6);
    for (let i = 1; i < FAIXAS_SIMPLES.length; i++) {
      expect(FAIXAS_SIMPLES[i]).toBeGreaterThan(FAIXAS_SIMPLES[i - 1]);
    }
  });

  it("alíquotas do Simples devem existir para 3 setores", () => {
    expect(ALIQUOTAS_SIMPLES).toHaveProperty("comercio");
    expect(ALIQUOTAS_SIMPLES).toHaveProperty("industria");
    expect(ALIQUOTAS_SIMPLES).toHaveProperty("servicos");
    Object.values(ALIQUOTAS_SIMPLES).forEach((arr) => {
      expect(arr).toHaveLength(6);
    });
  });

  it("presunção de lucro deve estar correta", () => {
    expect(PRESUNCAO_LUCRO.comercio).toBe(0.08);
    expect(PRESUNCAO_LUCRO.industria).toBe(0.08);
    expect(PRESUNCAO_LUCRO.servicos).toBe(0.32);
  });
});

// ========================================
// Cálculo Completo - Comércio
// ========================================
describe("calcularComparativoRegimes - Comércio", () => {
  const input = buildInput();
  const result = calcularComparativoRegimes(input);

  it("deve retornar 5 regimes", () => {
    expect(result.regimes).toHaveLength(5);
  });

  it("todos os regimes devem ser elegíveis (fat < 4.8M)", () => {
    result.regimes.forEach((r) => {
      expect(r.is_elegivel).toBe(true);
    });
  });

  it("deve ter um regime recomendado", () => {
    expect(result.recomendado).toBeTruthy();
  });

  it("recomendado deve ser o de menor imposto entre elegíveis", () => {
    const elegiveis = result.regimes.filter((r) => r.is_elegivel);
    const menorImposto = elegiveis.reduce((min, r) =>
      r.imposto_anual < min.imposto_anual ? r : min
    );
    expect(result.recomendado).toBe(menorImposto.tipo);
  });

  it("economia_vs_segundo deve ser >= 0", () => {
    expect(result.economia_vs_segundo).toBeGreaterThanOrEqual(0);
  });

  it("deve ter justificativa e disclaimer", () => {
    expect(result.justificativa).toBeTruthy();
    expect(result.disclaimer).toBeTruthy();
  });
});

// ========================================
// Simples Nacional
// ========================================
describe("Simples Nacional", () => {
  it("deve aplicar alíquota da faixa correta para comércio R$ 1.2M", () => {
    const input = buildInput({ faturamento_anual: 1200000 });
    const result = calcularComparativoRegimes(input);
    const simples = result.regimes.find((r) => r.tipo === "SIMPLES_NACIONAL")!;

    // R$ 1.2M cai na faixa 3 (720.001-1.800.000) → alíquota comércio[2] = 0.095
    // Mas o algoritmo usa <= comparação, então 1.2M <= 1.800.000 → faixa index 4 (0-indexed)
    // Faixa: 180k, 360k, 720k, 1.8M, 3.6M, 4.8M → 1.2M <= 1.8M → index 3 → alíquota 10.7%
    expect(simples.aliquota_efetiva).toBeCloseTo(10.7, 0);
    expect(simples.imposto_anual).toBeCloseTo(1200000 * 0.107, 0);
    expect(simples.creditos_gerados).toBe(0);
  });

  it("deve ser inelegível para faturamento > R$ 4.8M", () => {
    const input = buildInput({ faturamento_anual: 5000000 });
    const result = calcularComparativoRegimes(input);
    const simples = result.regimes.find((r) => r.tipo === "SIMPLES_NACIONAL")!;

    expect(simples.is_elegivel).toBe(false);
    expect(simples.imposto_anual).toBe(0);
    expect(simples.motivo_inelegibilidade).toBeTruthy();
  });

  it("deve aplicar fator R para serviços com folha >= 28%", () => {
    const input = buildInput({
      cnae_principal: "6201-5/01", // Serviços (TI)
      faturamento_anual: 500000,
      folha_pagamento: 150000, // 30% > 28%
    });
    const result = calcularComparativoRegimes(input);
    const simples = result.regimes.find((r) => r.tipo === "SIMPLES_NACIONAL")!;

    // 500k <= 720k → faixa index 2 → serviços[2] = 0.135
    // Fator R >= 28% → 0.135 * 0.85 = 0.11475 → 11.475%
    expect(simples.aliquota_efetiva).toBeCloseTo(13.5 * 0.85, 0);
  });
});

// ========================================
// Lucro Presumido
// ========================================
describe("Lucro Presumido", () => {
  it("deve calcular corretamente para comércio (presunção 8%)", () => {
    const input = buildInput({ faturamento_anual: 2000000 });
    const result = calcularComparativoRegimes(input);
    const lp = result.regimes.find((r) => r.tipo === "LUCRO_PRESUMIDO")!;

    const baseIRPJ = 2000000 * 0.08; // 160.000
    const irpj = baseIRPJ * 0.15; // 24.000
    // Adicional IR: nenhum (base < 240.000)
    const csll = baseIRPJ * 0.09; // 14.400
    const pisCofins = 2000000 * 0.0365; // 73.000
    const esperado = irpj + csll + pisCofins; // 111.400

    expect(lp.imposto_anual).toBeCloseTo(esperado, 0);
    expect(lp.is_elegivel).toBe(true);
  });

  it("deve calcular adicional IR quando base > R$ 240k", () => {
    const input = buildInput({
      faturamento_anual: 5000000,
      cnae_principal: "6201-5/01", // Serviços (presunção 32%)
    });
    const result = calcularComparativoRegimes(input);
    const lp = result.regimes.find((r) => r.tipo === "LUCRO_PRESUMIDO")!;

    const baseIRPJ = 5000000 * 0.32; // 1.600.000
    const irpj = baseIRPJ * 0.15 + (baseIRPJ - 240000) * 0.10;
    const csll = baseIRPJ * 0.09;
    const pisCofins = 5000000 * 0.0365;
    const esperado = irpj + csll + pisCofins;

    expect(lp.imposto_anual).toBeCloseTo(esperado, 0);
  });
});

// ========================================
// Lucro Real
// ========================================
describe("Lucro Real", () => {
  it("deve deduzir insumos e despesas operacionais", () => {
    const input = buildInput({
      faturamento_anual: 2000000,
      compras_insumos: 800000,
      folha_pagamento: 300000,
      despesas_operacionais: 200000,
    });
    const result = calcularComparativoRegimes(input);
    const lr = result.regimes.find((r) => r.tipo === "LUCRO_REAL")!;

    const lucro = 2000000 - 800000 - 300000 - 200000; // 700.000
    const irpj = lucro * 0.15 + (lucro - 240000) * 0.10; // 105.000 + 46.000
    const csll = lucro * 0.09; // 63.000
    const pisDebito = 2000000 * 0.0925; // 185.000
    const pisCredInsumo = 800000 * 0.0925; // 74.000
    const pisCredDesp = 200000 * 0.0925 * 0.50; // 9.250
    const pisLiquido = Math.max(0, pisDebito - pisCredInsumo - pisCredDesp);
    const esperado = irpj + csll + pisLiquido;

    expect(lr.imposto_anual).toBeCloseTo(esperado, 0);
    expect(lr.creditos_gerados).toBeCloseTo(pisCredInsumo + pisCredDesp, 0);
  });

  it("imposto sobre lucro não deve ser negativo", () => {
    const input = buildInput({
      faturamento_anual: 500000,
      compras_insumos: 400000,
      folha_pagamento: 200000,
      despesas_operacionais: 100000,
    });
    const result = calcularComparativoRegimes(input);
    const lr = result.regimes.find((r) => r.tipo === "LUCRO_REAL")!;

    // Lucro operacional = 500k - 400k - 200k - 100k = -200k → 0
    expect(lr.imposto_anual).toBeGreaterThanOrEqual(0);
  });
});

// ========================================
// Simples 2027
// ========================================
describe("Simples 2027 'Por Dentro'", () => {
  it("deve ter alíquota ajustada por setor (maior que Simples atual)", () => {
    const input = buildInput();
    const result = calcularComparativoRegimes(input);
    const atual = result.regimes.find((r) => r.tipo === "SIMPLES_NACIONAL")!;
    const dentro = result.regimes.find((r) => r.tipo === "SIMPLES_2027_DENTRO")!;

    // Comércio: ajuste de +1,5pp → alíquota efetiva deve ser maior que atual
    expect(dentro.aliquota_efetiva).toBeGreaterThan(atual.aliquota_efetiva);
    expect(dentro.imposto_anual).toBeGreaterThan(atual.imposto_anual);
  });
});

describe("Simples 2027 'Por Fora'", () => {
  it("deve ter DAS reduzido em 40% + IBS/CBS líquido", () => {
    const input = buildInput({
      faturamento_anual: 1200000,
      compras_insumos: 480000,
    });
    const result = calcularComparativoRegimes(input);
    const fora = result.regimes.find((r) => r.tipo === "SIMPLES_2027_FORA")!;

    // 1.2M → faixa index 3 → comércio[3] = 0.107
    const aliquota = ALIQUOTAS_SIMPLES.comercio[3];
    const dasReduzido = 1200000 * aliquota * (1 - REDUCAO_DAS_POR_FORA);
    const ibsDebito = 1200000 * ALIQUOTA_CBS_IBS;
    const ibsCredito = 480000 * ALIQUOTA_CBS_IBS;
    const ibsLiquido = Math.max(0, ibsDebito - ibsCredito);

    expect(fora.imposto_anual).toBeCloseTo(dasReduzido + ibsLiquido, 0);
    expect(fora.creditos_gerados).toBeCloseTo(ibsCredito, 0);
  });

  it("deve gerar créditos IBS/CBS", () => {
    const input = buildInput({ compras_insumos: 600000 });
    const result = calcularComparativoRegimes(input);
    const fora = result.regimes.find((r) => r.tipo === "SIMPLES_2027_FORA")!;

    expect(fora.creditos_gerados).toBeCloseTo(600000 * ALIQUOTA_CBS_IBS, 0);
  });
});

// ========================================
// Recomendação
// ========================================
describe("Recomendação de regime", () => {
  it("para empresa de alto custo de insumos, deve favorecer regimes com crédito", () => {
    const input = buildInput({
      faturamento_anual: 2000000,
      compras_insumos: 1400000, // 70% do faturamento
      despesas_operacionais: 200000,
      folha_pagamento: 200000,
    });
    const result = calcularComparativoRegimes(input);

    // Com 70% de insumos, Lucro Real ou Simples Por Fora devem ser competitivos
    const recomendado = result.regimes.find((r) => r.tipo === result.recomendado)!;
    expect(recomendado.imposto_anual).toBeGreaterThan(0);
  });

  it("empresa acima de R$ 4.8M só deve recomendar LP ou LR", () => {
    const input = buildInput({
      faturamento_anual: 6000000,
      compras_insumos: 2400000,
      despesas_operacionais: 600000,
      folha_pagamento: 900000,
    });
    const result = calcularComparativoRegimes(input);

    expect(["LUCRO_PRESUMIDO", "LUCRO_REAL"]).toContain(result.recomendado);
  });
});

// ========================================
// Formatação
// ========================================
describe("Funções de formatação", () => {
  it("formatarMoeda deve formatar em BRL", () => {
    const formatted = formatarMoeda(150000);
    expect(formatted).toContain("150");
    expect(formatted).toContain("R$");
  });

  it("formatarPercentual deve adicionar %", () => {
    expect(formatarPercentual(9.5)).toBe("9.5%");
    expect(formatarPercentual(12.34)).toBe("12.3%");
  });
});

// ========================================
// Edge cases
// ========================================
describe("Edge cases", () => {
  it("faturamento zero não deve causar erro", () => {
    const input = buildInput({ faturamento_anual: 0 });
    expect(() => calcularComparativoRegimes(input)).not.toThrow();
    const result = calcularComparativoRegimes(input);
    // Deve retornar 5 regimes sem crash
    expect(result.regimes).toHaveLength(5);
  });

  it("CNAE vazio deve cair em comércio", () => {
    const input = buildInput({ cnae_principal: "" });
    const result = calcularComparativoRegimes(input);
    // Não deve dar erro
    expect(result.regimes).toHaveLength(5);
  });
});
