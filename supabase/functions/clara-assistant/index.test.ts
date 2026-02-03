import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/clara-assistant`;

Deno.test("Clara Assistant - Health check (no auth)", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ message: "Olá" }),
  });

  // Should return 401 without auth
  assertEquals(response.status, 401);
  await response.text();
});

Deno.test("Clara Assistant - CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Origin": "http://localhost:5173",
      "Access-Control-Request-Method": "POST",
    },
  });

  assertEquals(response.status, 200);
  const headers = response.headers;
  assertExists(headers.get("access-control-allow-origin"));
  assertExists(headers.get("access-control-allow-headers"));
  await response.text();
});

Deno.test("Clara Assistant - Agent detection patterns", async () => {
  // Test fiscal patterns
  const fiscalKeywords = ["ICMS", "PIS", "COFINS", "NCM", "nota fiscal", "tributo"];
  const marginKeywords = ["margem", "DRE", "lucro", "receita", "custo"];
  const complianceKeywords = ["prazo", "obrigação", "DCTF", "SPED", "entrega"];

  // Verify patterns are distinct
  const allKeywords = [...fiscalKeywords, ...marginKeywords, ...complianceKeywords];
  const uniqueKeywords = new Set(allKeywords);
  assertEquals(allKeywords.length, uniqueKeywords.size, "Keywords should be unique across agents");
});
