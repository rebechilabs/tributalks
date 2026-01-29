
## Plano: Campo de Newsletter Tributalks News (beehiiv)

### Objetivo
Adicionar um campo compacto de inscrição para a newsletter **Tributalks News** no Footer da Landing Page, exibido para todos os visitantes e usuários logados (exceto Enterprise).

---

### Branding & Copy
- **Nome**: Tributalks News
- **Frequência**: Toda terça-feira às 07h07
- **Título sugerido**: "📬 Tributalks News" 
- **Subtítulo**: "Toda terça às 07h07 • +4 mil assinantes"

---

### Design do Componente

Campo compacto inline no Footer:

```text
┌────────────────────────────────────────────────────────────────┐
│  📬 Tributalks News                                            │
│  Toda terça às 07h07 • +4 mil assinantes                       │
│                                                                │
│  ┌──────────────────────────────┐ ┌────────────────┐          │
│  │ seu@email.com                │ │  Inscrever-se  │          │
│  └──────────────────────────────┘ └────────────────┘          │
│                                                                │
│  ✓ Inscrito! Verifique seu e-mail.                             │
└────────────────────────────────────────────────────────────────┘
```

**Posição no Footer**: Entre o logo/descrição e os links de contato.

---

### Lógica de Visibilidade

| Contexto | Exibe Newsletter? |
|----------|-------------------|
| Visitante (sem login) | ✅ Sim |
| Usuário FREE | ✅ Sim |
| Usuário NAVIGATOR | ✅ Sim |
| Usuário PROFESSIONAL | ✅ Sim |
| Usuário ENTERPRISE | ❌ Não |

A verificação usa o hook `usePlanAccess()` existente para checar `isEnterprise`.

---

### Detalhes Técnicos

#### 1. Edge Function `subscribe-newsletter`

Nova função para processar inscrições via API beehiiv:

**Arquivo**: `supabase/functions/subscribe-newsletter/index.ts`

**Funcionalidades**:
- Recebe: `{ email: string }`
- Valida e-mail (regex + sanitização)
- Rate limiting (3 requisições por 10 min por IP)
- Chama API beehiiv: `POST /v2/publications/{id}/subscriptions`
- Retorna sucesso ou erro tratado

**Configuração beehiiv**:
```http
POST https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "email": "user@example.com",
  "utm_source": "tributech_website",
  "reactivate_existing": true
}
```

#### 2. Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `BEEHIIV_API_KEY` | Chave da API (Settings → Integrations → API) |
| `BEEHIIV_PUBLICATION_ID` | ID da publicação (formato: `pub_xxxxxxxx`) |

#### 3. Componente React `NewsletterForm`

**Arquivo**: `src/components/common/NewsletterForm.tsx`

**Estados**:
- `idle` → Campo de input pronto
- `loading` → Botão com spinner
- `success` → Mensagem de confirmação
- `error` → Mensagem de erro

**Validação**:
- Schema zod para e-mail
- Feedback visual inline
- Botão desabilitado durante loading

#### 4. Integração no Footer

O componente `NewsletterForm` será renderizado condicionalmente no Footer.

Para usuários logados, verifica se **não é Enterprise** antes de exibir.
Para visitantes, sempre exibe.

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/subscribe-newsletter/index.ts` | Criar |
| `supabase/config.toml` | Adicionar função |
| `src/components/common/NewsletterForm.tsx` | Criar |
| `src/components/landing/Footer.tsx` | Integrar componente |

---

### Segurança

- **Rate limiting**: 3 requisições por 10 minutos por IP
- **Validação de e-mail**: Regex RFC 5322 + limite de caracteres
- **Sanitização**: Remoção de caracteres especiais e null bytes
- **API key protegida**: Nunca exposta no frontend (apenas na Edge Function)
- **Mensagens de erro genéricas**: Sem vazamento de informações técnicas

---

### Próximos Passos após Aprovação

1. Implementar Edge Function `subscribe-newsletter`
2. Criar componente `NewsletterForm`
3. Integrar no Footer com lógica de visibilidade
4. Solicitar os secrets (BEEHIIV_API_KEY e BEEHIIV_PUBLICATION_ID)
5. Testar fluxo completo

