
# Anonimizar Nomes de Empresas e Pessoas em Depoimentos

## Diagnóstico

Os depoimentos atualmente usam uma mistura inconsistente:
- **HeroSection**: Nome completo "Carlos Mendes" + empresa "Logística Norte"
- **SocialProofSection**: Iniciais "C.M." + setor genérico "Setor de Logística" ✓
- **TestimonialsSection**: Iniciais "C.M." + setor simples "Logística" ✓
- **caseStudies.ts**: Empresas genéricas + iniciais ✓

**Problema principal**: HeroSection ainda usa nome completo e empresa fictícia.

---

## Arquivos a Alterar

### 1. **src/components/landing/HeroSection.tsx**

| Linha | Antes | Depois |
|-------|-------|--------|
| 99 | `CM` (avatar) | `CM` (mantém) |
| 102 | `Carlos Mendes` | `C.M.` |
| 103 | `CFO, Logística Norte` | `CFO, Setor de Logística` |

**Código atualizado (linhas 97-105):**
```tsx
<div className="flex items-center gap-3 mb-4">
  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
    <span className="text-primary font-semibold text-lg">CM</span>
  </div>
  <div>
    <strong className="text-foreground">C.M.</strong>
    <p className="text-sm text-muted-foreground">CFO, Setor de Logística</p>
  </div>
</div>
```

---

## Verificação - Arquivos já corretos

### SocialProofSection.tsx ✓
```typescript
// Já usa formato correto:
{ name: "C.M.", sector: "Setor de Logística" }
{ name: "F.L.", sector: "Setor de Tecnologia" }
{ name: "R.A.", sector: "Setor Industrial" }
```

### TestimonialsSection.tsx ✓
```typescript
// Já usa formato correto:
{ author: "C.M.", sector: "Logística" }
{ author: "F.L.", sector: "Tecnologia" }
{ author: "R.A.", sector: "Indústria" }
```

### caseStudies.ts ✓
```typescript
// Empresas genéricas (sem nome próprio):
"Distribuidora de Alimentos"
"Clínica Oftalmológica"
"Indústria Metalúrgica"
"Startup de Software B2B"

// Autores com iniciais:
{ author: "C.M.", role: "Diretor Financeiro" }
{ author: "F.L.", role: "Sócia-Administradora" }
{ author: "R.A.", role: "Controller" }
{ author: "M.C.", role: "CEO" }
```

---

## Resumo

| Arquivo | Status | Ação |
|---------|--------|------|
| HeroSection.tsx | ❌ Precisa correção | Alterar linhas 102-103 |
| SocialProofSection.tsx | ✅ OK | Nenhuma |
| TestimonialsSection.tsx | ✅ OK | Nenhuma |
| caseStudies.ts | ✅ OK | Nenhuma |

**Total**: Apenas 1 arquivo precisa de alteração (2 linhas)

---

## Padrão de Anonimização Adotado

| Campo | Formato |
|-------|---------|
| Nome | Iniciais com ponto (C.M., F.L., R.A.) |
| Cargo | Mantém completo (CFO, CEO, Controller) |
| Empresa | "Setor de [Área]" genérico |
| Números | Mantém valores para credibilidade |
