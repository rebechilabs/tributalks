

# Correções nos Termos de Uso

## Resumo

Atualizar a página de Termos de Uso para alinhar com a estrutura de planos atual e corrigir inconsistências identificadas.

---

## Alterações Necessárias

### 1. Seção 3.3 - Correção de Typo
| Atual | Correto |
|-------|---------|
| "TribuTech" | "TribuTalks" |

**Linha 53**

---

### 2. Seção 4.1 - Atualização dos Planos e Preços

| Atual | Correto |
|-------|---------|
| Free, Básico (R$ 99), Profissional (R$ 197), Premium (R$ 500) | Grátis, Starter (R$ 297/mês), Navigator (R$ 1.997/mês), Professional (R$ 2.997/mês) e Enterprise (sob consulta) |

**Linha 59**

---

### 3. Seção 6 - Consultorias (Reformulação Completa)

**Título atual:** "6. CONSULTORIAS (PLANO PREMIUM)"

**Novo título:** "6. CONSULTORIAS (PLANO ENTERPRISE)"

| Item | Atual | Novo |
|------|-------|------|
| 6.1 | "O plano Premium inclui 2 sessões de 30 min/mês" | "O plano Enterprise inclui consultorias ilimitadas com especialistas da Rebechi & Silva Advogados Associados" |
| 6.2 | Mantido | Mantido (natureza orientativa) |
| 6.3 | "Sessões não cumulativas" | **REMOVER** (não aplicável a ilimitado) |
| 6.4 | Mantido | Mantido (disponibilidade de horários) |
| 6.5 | Mantido | Mantido (política de cancelamento 24h) |

**Linhas 87-94**

---

### 4. Seção 9.4 - Atualização dos Nomes de Planos no SLA

| Atual | Correto |
|-------|---------|
| "planos Básico e Profissional" e "plano Premium" | "planos Starter e Professional" e "plano Enterprise" |

**Linha 134**

---

## Arquivo a Modificar

`src/pages/Termos.tsx`

---

## Resultado Esperado

Os Termos de Uso refletirão a estrutura de planos atual:
- **Grátis**: Acesso limitado (sem Clara AI)
- **Starter**: R$ 297/mês (30 mensagens/dia Clara)
- **Navigator**: R$ 1.997/mês (100 mensagens/dia Clara)
- **Professional**: R$ 2.997/mês (ilimitado Clara)
- **Enterprise**: Sob consulta (ilimitado + consultorias + white label)

