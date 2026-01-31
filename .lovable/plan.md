

# Plano: Corrigir Vulnerabilidade de Autenticação na Edge Function match-opportunities

## Problema Identificado

A função `match-opportunities` aceita `user_id` do body da requisição **sem validar a autenticação** do chamador:

```typescript
// ❌ VULNERÁVEL - Qualquer um pode passar qualquer user_id
const { user_id } = await req.json()
```

Com isso, um atacante pode:
1. Invocar a função com qualquer `user_id`
2. Acessar dados sensíveis do perfil da empresa (CNPJ, faturamento, regime, emails de sócios)
3. Acessar oportunidades tributárias calculadas para outro usuário

---

## Observação sobre os Outros Alertas

| Alerta | Status | Motivo |
|--------|--------|--------|
| Profiles table exposure | ✅ Falso positivo | RLS policy `auth.uid() = user_id` está correta |
| Company profile exposure | ✅ Falso positivo | RLS policy `auth.uid() = user_id` está correta |
| Organization seats | ✅ Baixo risco | Policies adequadas para owner e member |

O problema real é que a **Edge Function usa SERVICE_ROLE_KEY** que bypassa RLS. Corrigindo a autenticação na função, os dados ficam protegidos.

---

## Correção Proposta

### Arquivo: `supabase/functions/match-opportunities/index.ts`

**Substituir linhas 727-748** com validação JWT:

```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // PASSO 1: Validar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        error: 'unauthorized',
        message: 'Token de autenticação obrigatório'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // PASSO 2: Validar token e obter usuário autenticado
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'invalid_token',
        message: 'Token de autenticação inválido ou expirado'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PASSO 3: Usar o ID do usuário autenticado (não do body)
    const user_id = user.id
```

---

## Fluxo de Segurança Corrigido

```text
┌─────────────────────────────────────────────────────────────┐
│                      ANTES (Vulnerável)                      │
├─────────────────────────────────────────────────────────────┤
│  Cliente → POST { user_id: "qualquer-id" } → Edge Function  │
│                                                              │
│  Problema: Aceita qualquer user_id sem validação            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DEPOIS (Seguro)                         │
├─────────────────────────────────────────────────────────────┤
│  Cliente → POST + Authorization: Bearer <JWT> → Edge Fn     │
│                         │                                    │
│                         ▼                                    │
│              Validar JWT com getUser(token)                  │
│                         │                                    │
│                         ▼                                    │
│              Usar user.id do token (não do body)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Resumo das Alterações

| Arquivo | Modificação |
|---------|-------------|
| `match-opportunities/index.ts` | Adicionar validação JWT e usar user_id do token |
| **Linhas afetadas** | 727-748 (início do handler serve) |
| **Risco resolvido** | Acesso não autorizado a dados de outros usuários |

---

## Verificação Pós-Implementação

Após a correção, os alertas serão marcados como resolvidos:
- ✅ Match Opportunities Function Lacks Authentication
- ✅ Customer Personal Information (consequência da correção)
- ✅ Confidential Business Data (consequência da correção)

