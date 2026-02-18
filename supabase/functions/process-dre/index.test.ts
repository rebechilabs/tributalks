import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/process-dre`;

// ── Helpers ──────────────────────────────────────────────────────────

function makeInputs(overrides: Record<string, unknown> = {}) {
  return {
    vendas_produtos: 100000,
    vendas_servicos: 50000,
    outras_receitas: 0,
    devolucoes: 2000,
    descontos: 1000,
    custo_mercadorias: 40000,
    custo_materiais: 5000,
    mao_obra_direta: 10000,
    servicos_terceiros: 3000,
    salarios_encargos: 15000,
    prolabore: 8000,
    aluguel: 5000,
    energia_agua_internet: 1500,
    marketing: 3000,
    software: 1000,
    contador_juridico: 2000,
    viagens: 500,
    manutencao: 800,
    frete: 2000,
    outras_despesas: 1000,
    juros_pagos: 1500,
    juros_recebidos: 200,
    tarifas: 300,
    multas: 0,
    impostos_vendas: 0,
    regime_tributario: "simples",
    calcular_auto: true,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────

Deno.test("process-dre: rejeita requisição sem autenticação", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: makeInputs(), period: { type: "monthly", month: 1, year: 2026 } }),
  });

  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});

Deno.test("process-dre: rejeita token inválido", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": "Bearer token_invalido_123",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: makeInputs(), period: { type: "monthly", month: 1, year: 2026 } }),
  });

  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});

Deno.test("process-dre: OPTIONS retorna CORS headers", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  await res.text(); // consume body
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
});

Deno.test("process-dre: calcula DRE corretamente (Simples Nacional)", async () => {
  // Este teste requer um token válido. Pule se não disponível.
  const testToken = Deno.env.get("TEST_USER_TOKEN");
  if (!testToken) {
    console.log("⏭️  Pulando teste autenticado: TEST_USER_TOKEN não configurado");
    return;
  }

  const inputs = makeInputs({
    vendas_produtos: 100000,
    vendas_servicos: 50000,
    regime_tributario: "simples",
    calcular_auto: true,
  });

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      period: { type: "monthly", month: 1, year: 2025 },
    }),
  });

  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.success, true);
  assertExists(body.dre);
  assertExists(body.diagnostics);
  assertExists(body.healthScore);
  assertExists(body.recommendations);
  assertExists(body.reformaImpact);

  // Validar cálculos de receita
  const dre = body.dre;
  assertEquals(dre.receita_bruta, 150000, "Receita bruta = vendas_produtos + vendas_servicos");

  // Simples Nacional: 6% de impostos sobre vendas
  const expectedImpostos = 150000 * 0.06;
  assertEquals(dre.impostos_vendas, expectedImpostos, "Impostos Simples = 6%");

  // Receita líquida = bruta - (devoluções + descontos + impostos)
  const expectedDeducoes = 2000 + 1000 + expectedImpostos;
  assertEquals(dre.deducoes, expectedDeducoes);
  assertEquals(dre.receita_liquida, 150000 - expectedDeducoes);

  // Margem bruta deve ser > 0
  assertEquals(dre.margem_bruta > 0, true, "Margem bruta deve ser positiva");

  // Health score
  assertEquals(typeof body.healthScore, "number");
  assertEquals(body.healthScore >= 0 && body.healthScore <= 100, true, "Health score entre 0-100");

  // DRE salvo
  assertExists(body.savedDre);
  assertExists(body.savedDre.id);
});

Deno.test("process-dre: calcula regime presumido corretamente", async () => {
  const testToken = Deno.env.get("TEST_USER_TOKEN");
  if (!testToken) {
    console.log("⏭️  Pulando teste autenticado: TEST_USER_TOKEN não configurado");
    return;
  }

  const inputs = makeInputs({
    regime_tributario: "presumido",
    calcular_auto: true,
    vendas_produtos: 200000,
    vendas_servicos: 0,
  });

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      period: { type: "monthly", month: 2, year: 2025 },
    }),
  });

  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.success, true);

  // Presumido: 9.25% de impostos sobre vendas
  const expectedImpostos = 200000 * 0.0925;
  assertEquals(body.dre.impostos_vendas, expectedImpostos, "Impostos Presumido = 9.25%");

  // Impostos sobre lucro (IRPJ + CSLL) devem existir se resultado_antes_ir > 0
  if (body.dre.resultado_antes_ir > 0) {
    assertEquals(body.dre.impostos_lucro > 0, true, "Presumido deve ter impostos sobre lucro");
  }
});

Deno.test("process-dre: cenário com receita zero", async () => {
  const testToken = Deno.env.get("TEST_USER_TOKEN");
  if (!testToken) {
    console.log("⏭️  Pulando teste autenticado: TEST_USER_TOKEN não configurado");
    return;
  }

  const inputs = makeInputs({
    vendas_produtos: 0,
    vendas_servicos: 0,
    outras_receitas: 0,
  });

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      period: { type: "monthly", month: 3, year: 2025 },
    }),
  });

  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.dre.receita_bruta, 0);
  assertEquals(body.dre.margem_bruta, 0, "Margem bruta = 0 quando receita = 0");
  assertEquals(body.dre.margem_liquida, 0);
});

Deno.test("process-dre: reforma tributária é simulada", async () => {
  const testToken = Deno.env.get("TEST_USER_TOKEN");
  if (!testToken) {
    console.log("⏭️  Pulando teste autenticado: TEST_USER_TOKEN não configurado");
    return;
  }

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${testToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: makeInputs(),
      period: { type: "monthly", month: 4, year: 2025 },
    }),
  });

  const body = await res.json();
  assertEquals(res.status, 200);
  assertExists(body.reformaImpact);
  assertExists(body.reformaImpact.impostos_atuais);
  assertExists(body.reformaImpact.impostos_novos);
  assertEquals(typeof body.reformaImpact.impacto_percentual, "number");
});
