
# Atualizar Link Stripe + Remover Nomes de Empresas (OAB)

## Resumo das Alterações

Duas correções importantes:
1. Adicionar link Stripe correto para Professional Mensal
2. Remover todos os nomes de empresas dos testemunhos para cumprir o código de ética da OAB

---

## 1. Atualizar Link Stripe

### Arquivo: `src/config/site.ts`

**Linha 11** - Atualizar o link do Professional Mensal:

```typescript
// Antes
PROFESSIONAL_MENSAL: "/cadastro?plan=professional",

// Depois
PROFESSIONAL_MENSAL: "https://buy.stripe.com/dRmfZa2R4e9U4DFeDcbo40a",
```

---

## 2. Remover Nomes de Empresas dos Testemunhos

### Arquivo: `src/components/landing/SocialProofSection.tsx`

**Linhas 3-37** - Remover campo `company` e ajustar estrutura:

| Antes | Depois |
|-------|--------|
| Carlos Mendes, CFO, Logística Norte | C.M., CFO, Setor de Logística |
| Fernanda Lima, CFO, TechSul | F.L., CFO, Setor de Tecnologia |
| Ricardo Alves, Dir. Financeiro, Indústria ABC | R.A., Dir. Financeiro, Setor Industrial |

**Mudanças específicas**:
- Trocar nomes completos por iniciais (C.M., F.L., R.A.)
- Remover campo `company` 
- Renomear para mostrar setor em vez de empresa
- Ajustar exibição para `{testimonial.role}, {testimonial.sector}`

---

### Arquivo: `src/data/caseStudies.ts`

**Todos os 4 estudos de caso** - Substituir nomes de empresas por descrições genéricas:

| Antes | Depois |
|-------|--------|
| Distribuidora Alimentos SP | Distribuidora de Alimentos |
| Clínica Oftalmológica Rio | Clínica Oftalmológica |
| Metalúrgica Belo Horizonte | Indústria Metalúrgica |
| TechFlow SaaS | Startup de Software B2B |

**Nos testimoniais**:

| Antes | Depois |
|-------|--------|
| Carlos Mendes, Diretor Financeiro | C.M., Diretor Financeiro |
| Dra. Fernanda Lima, Sócia-Administradora | F.L., Sócia-Administradora |
| Roberto Andrade, Controller | R.A., Controller |
| Marina Costa, CEO & Co-founder | M.C., CEO |

**Nos slugs e fullStory**:
- Atualizar slugs para versões genéricas
- Remover menções específicas de nomes no texto narrativo

---

## Arquivos Afetados

| Arquivo | Alteração |
|---------|-----------|
| `src/config/site.ts` | Link Stripe Professional Mensal |
| `src/components/landing/SocialProofSection.tsx` | Anonimizar testemunhos |
| `src/data/caseStudies.ts` | Anonimizar 4 estudos de caso + testemunhos |

---

## Resultado Final

- Botões de plano Professional abrirão Stripe corretamente
- Todos os testemunhos mostrarão apenas iniciais + cargo + setor
- Nenhum nome de empresa identificável será exibido
- Conformidade total com o código de ética da OAB
