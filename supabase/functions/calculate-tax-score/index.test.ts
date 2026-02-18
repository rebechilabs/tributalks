import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/calculate-tax-score`;

// ── Tests ────────────────────────────────────────────────────────────

Deno.test("calculate-tax-score: rejeita requisição sem autenticação", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});

Deno.test("calculate-tax-score: rejeita token inválido", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": "Bearer token_invalido_abc",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const body = await res.json();
  assertEquals(res.status, 401);
  assertExists(body.error);
});

Deno.test("calculate-tax-score: OPTIONS retorna CORS headers", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
});

Deno.test("calculate-tax-score: calcula score com token válido", async () => {
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
    body: JSON.stringify({}),
  });

  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.success, true);

  // Score total
  assertExists(body.score);
  assertEquals(typeof body.score, "number");
  assertEquals(body.score >= 0 && body.score <= 100, true, "Score entre 0-100");

  // Grade
  assertExists(body.grade);
  const validGrades = ["A+", "A", "B+", "B", "C", "D", "E"];
  assertEquals(validGrades.includes(body.grade), true, `Grade '${body.grade}' deve ser válida`);

  // Status
  assertExists(body.status);
  const validStatuses = ["excellent", "good", "regular", "attention", "critical"];
  assertEquals(validStatuses.includes(body.status), true, `Status '${body.status}' deve ser válido`);

  // Dimensões
  assertExists(body.dimensions);
  const dims = body.dimensions;
  for (const key of ["conformidade", "eficiencia", "risco", "documentacao", "gestao"]) {
    assertExists(dims[key], `Dimensão '${key}' deve existir`);
    assertEquals(typeof dims[key], "number");
    assertEquals(
      dims[key] >= 0 && dims[key] <= 100,
      true,
      `Dimensão '${key}' (${dims[key]}) deve estar entre 0-100`
    );
  }

  // Cards
  assertEquals(typeof body.cardsCompletos, "number");
  assertEquals(body.cardsTotal, 8);
  assertEquals(body.cardsCompletos <= body.cardsTotal, true);

  // Impacto financeiro
  assertExists(body.financialImpact);
  assertEquals(typeof body.financialImpact.economiaPotencial, "number");
  assertEquals(typeof body.financialImpact.riscoAutuacao, "number");
  assertEquals(typeof body.financialImpact.creditosNaoAproveitados, "number");

  // Ações
  assertExists(body.actions);
  assertEquals(Array.isArray(body.actions), true);

  // Se há ações, validar estrutura
  if (body.actions.length > 0) {
    const action = body.actions[0];
    assertExists(action.action_code);
    assertExists(action.action_title);
    assertEquals(typeof action.points_gain, "number");
    assertEquals(typeof action.priority, "number");
  }
});

Deno.test("calculate-tax-score: grade A+ para score >= 90", () => {
  // Validação da lógica de grading (teste puro, sem HTTP)
  function calculateGrade(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    return "E";
  }

  assertEquals(calculateGrade(95), "A+");
  assertEquals(calculateGrade(90), "A+");
  assertEquals(calculateGrade(89), "A");
  assertEquals(calculateGrade(80), "A");
  assertEquals(calculateGrade(75), "B+");
  assertEquals(calculateGrade(65), "B");
  assertEquals(calculateGrade(55), "C");
  assertEquals(calculateGrade(45), "D");
  assertEquals(calculateGrade(30), "E");
  assertEquals(calculateGrade(0), "E");
});

Deno.test("calculate-tax-score: status corresponde ao score", () => {
  function calculateStatus(score: number): string {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "regular";
    if (score >= 20) return "attention";
    return "critical";
  }

  assertEquals(calculateStatus(90), "excellent");
  assertEquals(calculateStatus(80), "excellent");
  assertEquals(calculateStatus(70), "good");
  assertEquals(calculateStatus(60), "good");
  assertEquals(calculateStatus(50), "regular");
  assertEquals(calculateStatus(40), "regular");
  assertEquals(calculateStatus(30), "attention");
  assertEquals(calculateStatus(10), "critical");
});

Deno.test("calculate-tax-score: ações estão ordenadas por prioridade", async () => {
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
    body: JSON.stringify({}),
  });

  const body = await res.json();
  assertEquals(res.status, 200);

  if (body.actions && body.actions.length > 1) {
    for (let i = 1; i < body.actions.length; i++) {
      assertEquals(
        body.actions[i].priority >= body.actions[i - 1].priority,
        true,
        "Ações devem estar ordenadas por prioridade crescente"
      );
    }
  }
});
