
# Revisão Completa de Segurança RLS - TribuTalks

## Resumo Executivo

Após análise detalhada do banco de dados, identifiquei **17 findings** de segurança, sendo **9 críticos/erros** e **8 avisos**. A maioria das políticas RLS está correta, mas há pontos que precisam de atenção.

---

## ✅ O Que Está Bem Configurado

| Aspecto | Status |
|---------|--------|
| RLS habilitado em todas tabelas | ✅ 100% |
| Tabelas com `user_id` indexado | ✅ Todas |
| Coluna `user_id` NOT NULL | ✅ 29 de 30 tabelas |
| Função `has_role()` SECURITY DEFINER | ✅ Com search_path |
| Sem acesso `anon` a tabelas sensíveis | ✅ Nenhuma |
| Todas tabelas têm políticas | ✅ 100% |

---

## 🔴 Problemas Críticos a Resolver

### 1. Leaked Password Protection Desabilitado
**Risco**: Usuários podem usar senhas vazadas em data breaches.

**Ação necessária**: Solicitar ativação via suporte Lovable para o projeto `rhhzsmupixdhurricppk`.

---

### 2. Função sem `search_path` definido
**Função afetada**: `update_org_seats_updated_at`

**Correção SQL**:
```sql
ALTER FUNCTION public.update_org_seats_updated_at()
SET search_path = public;
```

---

### 3. Políticas INSERT com `WITH CHECK (true)` - Potencialmente Permissivas

| Tabela | Política | Risco |
|--------|----------|-------|
| `contatos` | Anyone can submit contact form | Baixo - intencional para formulário público |
| `notifications` | Service can insert | Médio - permite spam se service role comprometido |

**Recomendação para `notifications`**:
Manter como está, pois edge functions precisam inserir notificações. O risco é aceitável dado que a service key fica no backend.

---

### 4. Tabelas de Referência Públicas (Leitura)

Estas tabelas têm `SELECT` com `USING (true)` - **intencional para dados de referência**:

| Tabela | Justificativa |
|--------|---------------|
| `calculators` | Catálogo público de calculadoras |
| `credit_rules` | Regras de crédito (apenas autenticados) |
| `tax_opportunities` | Oportunidades tributárias genéricas |
| `sector_benchmarks` | Benchmarks de mercado |
| `referral_codes` | Necessário para validar códigos |

**Veredicto**: ✅ Aceitável - são dados de referência, não dados de usuário.

---

### 5. Coluna `user_id` Nullable

| Tabela | Status |
|--------|--------|
| `subscription_events` | `user_id` é `NULL` permitido |

**Risco**: Eventos de webhook Stripe podem chegar sem user_id identificado.

**Recomendação**: Manter nullable, pois webhooks podem falhar em identificar usuário em alguns cenários (ex: checkout não completado).

---

## 🟡 Avisos de Dados Sensíveis

O scan identificou tabelas com dados sensíveis. Todas têm RLS correto (`auth.uid() = user_id`), mas são alertas para monitoramento:

| Tabela | Dados Sensíveis | RLS Status |
|--------|-----------------|------------|
| `profiles` | Email, nome, dados financeiros | ✅ Correto |
| `company_profile` | Faturamento, estrutura societária | ✅ Correto |
| `company_dre` | DRE completo | ✅ Correto |
| `erp_connections` | Credenciais ERP (JSONB) | ✅ Correto |
| `xml_analysis` | CNPJs, fornecedores | ✅ Correto |
| `identified_credits` | Estratégias tributárias | ✅ Correto |
| `organization_seats` | Emails de membros | ✅ Correto |
| `tax_score` | Score de compliance | ✅ Correto |

---

## 📋 Plano de Ação

### Imediato (Alta Prioridade)

1. **Corrigir função sem search_path**
   ```sql
   ALTER FUNCTION public.update_org_seats_updated_at()
   SET search_path = public;
   ```

2. **Ativar Leaked Password Protection**
   - Abrir ticket de suporte Lovable

### Médio Prazo (Recomendado)

3. **Adicionar rate limiting** nas edge functions que permitem INSERT público:
   - `subscribe-newsletter` ✅ já tem
   - `send-contact-email` - verificar

4. **Criptografar credenciais ERP** em repouso
   - Atualmente armazenadas em JSONB plain
   - Considerar usar `pgcrypto` ou vault

### Documentação

5. **Criar política de rotação de service_role key** (mensal ou trimestral)

---

## Matriz de Risco Final

```text
┌─────────────────────────────────────────────────────────────┐
│                    MATRIZ DE RISCO                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  IMPACTO                                                    │
│    ▲                                                        │
│    │                                                        │
│    │  ■ ERP credentials        ■ Leaked Password           │
│ ALTO│    (mitigado por RLS)      (não mitigado)             │
│    │                                                        │
│    │  ■ DRE/Financeiro        ■ search_path função          │
│MÉDIO│    (mitigado por RLS)      (não mitigado)             │
│    │                                                        │
│    │  ■ Referral gaming       ■ Notifications spam          │
│BAIXO│    (aceitável)             (service role)             │
│    │                                                        │
│    └────────────────────────────────────────────────────────►
│         BAIXA              MÉDIA               ALTA         │
│                       PROBABILIDADE                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Conclusão

O banco de dados está **bem configurado** em termos de RLS. Os dois itens que precisam de ação imediata são:

1. ⚠️ Corrigir `search_path` da função `update_org_seats_updated_at`
2. ⚠️ Ativar Leaked Password Protection via suporte

As demais findings são de monitoramento ou trade-offs aceitáveis para a funcionalidade do sistema.

