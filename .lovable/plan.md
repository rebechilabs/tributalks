
# Plano: Remover Botão "Começar grátis" do Header

## Problema
O Header da Landing Page possui um botão **"Começar grátis"** que direciona para `/cadastro`, permitindo que usuários se cadastrem sem passar pelo Stripe. Isso contradiz a regra de negócio onde todos os usuários devem iniciar pelo checkout com trial de 7 dias.

## Situação Atual

**Usuário não logado vê:**
- Botão "Entrar" (abre modal de login)
- Botão "Começar grátis" (vai para /cadastro) ← **REMOVER**

**Usuário logado vê:**
- Botão "Acessar Dashboard" ← **OK**

## Solução Proposta

Remover o botão "Começar grátis" e manter apenas:
- **"Entrar"** - para usuários existentes fazerem login
- **"Testar Grátis"** - redirecionar para seção de planos (#planos) onde escolhem o plano e vão para o Stripe

Alternativamente, podemos apontar direto para o checkout do Starter:
- **"Testar 7 dias grátis"** - link direto para `CONFIG.PAYMENT_LINKS.STARTER_MENSAL`

## Mudanças

### Arquivo: `src/components/landing/Header.tsx`

**Desktop (linhas 68-81):**
```tsx
// ANTES
<>
  <Button variant="ghost" onClick={() => setLoginModalOpen(true)}>
    Entrar
  </Button>
  <Link to="/cadastro">
    <Button>Começar grátis</Button>  // ← REMOVER
  </Link>
</>

// DEPOIS
<>
  <Button variant="ghost" onClick={() => setLoginModalOpen(true)}>
    Entrar
  </Button>
  <a href={CONFIG.PAYMENT_LINKS.STARTER_MENSAL} target="_blank">
    <Button>Testar 7 dias grátis</Button>  // ← STRIPE
  </a>
</>
```

**Mobile (linhas 123-140):** Mesma alteração para o menu mobile.

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/Header.tsx` | Substituir link `/cadastro` por link do Stripe |

## Resultado
- Usuários não conseguem mais criar conta sem passar pelo Stripe
- CTA alinhado com a estratégia de conversão da landing page
- Texto "Testar 7 dias grátis" consistente com outros CTAs da página
