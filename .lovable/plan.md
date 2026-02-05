

# Plano: Remover MercadoPago do Projeto

## Arquivos Identificados

### 1. Deletar Completamente
- **`supabase/functions/mercadopago-webhook/`** - Edge function completa do webhook

### 2. Modificar
- **`supabase/config.toml`** - Remover configuração da função (linhas 87-88)

### 3. Secrets para Remover (via Lovable Cloud)
Os seguintes secrets podem ser removidos do projeto:
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_CLIENT_ID`
- `MERCADOPAGO_CLIENT_SECRET`

## Ações

| Ação | Arquivo/Recurso |
|------|-----------------|
| Deletar diretório | `supabase/functions/mercadopago-webhook/` |
| Remover config | `supabase/config.toml` (linhas 87-88) |
| Deletar função deployada | `mercadopago-webhook` (via ferramenta) |

## Observação
O Stripe webhook (`stripe-webhook/index.ts`) permanece intacto e continua sendo o único gateway de pagamento do projeto.

