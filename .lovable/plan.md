
# Renomear GPS da Reforma → PIT + Comunidade → TribuTalks Connect

## Resumo da Mudança de Marca

| Antes | Depois |
|-------|--------|
| GPS da Reforma Tributária | PIT - Plataforma de Inteligência Tributária |
| Comunidade Circle | TribuTalks Connect |
| GPS Tributário (landing) | Plataforma de Inteligência Tributária |

---

## Arquivos a Alterar

### 1. **src/data/menuConfig.ts** (menu lateral)

**Linhas 77 e 129** - Alterar título da seção:

```typescript
// Antes
title: 'GPS da Reforma',

// Depois  
title: 'PIT',
```

**Linha 306-309** - Atualizar descrição da comunidade:

```typescript
comunidade: {
  title: 'TribuTalks Connect',
  description: 'Comunidade exclusiva Professional+',
  // ...
}
```

---

### 2. **src/pages/Dashboard.tsx**

**Linha 57** - Comentário:
```typescript
// Antes: GPS da Reforma - primeira seção após Clara
// Depois: PIT - primeira seção após Clara
```

**Linha 442** - Título da seção:
```typescript
// Antes
GPS da Reforma

// Depois
PIT
```

---

### 3. **src/components/onboarding/GuidedTour.tsx**

**Linha 60** - Target selector:
```typescript
// Antes
target: '[data-tour="gps-reforma-group"]',

// Depois
target: '[data-tour="pit-group"]',
```

**Linha 65** - Título do tour:
```typescript
// Antes
<span className="font-semibold">GPS da Reforma</span>

// Depois
<span className="font-semibold">PIT</span>
```

---

### 4. **src/components/common/FloatingAssistant.tsx**

**Linha 80** - Mensagem do NAVIGATOR:
```typescript
// Antes
Você tem acesso completo ao GPS da Reforma Tributária

// Depois
Você tem acesso completo à PIT - Plataforma de Inteligência Tributária
```

**Linha 416** - Mensagem de saudação:
```typescript
// Antes
GPS Tributário

// Depois
PIT
```

---

### 5. **src/components/landing/FeaturesSection.tsx**

**Linha 106** - Badge da seção:
```typescript
// Antes
Ferramentas do GPS Tributário

// Depois
Ferramentas da PIT
```

---

### 6. **src/components/landing/PricingSection.tsx**

**Linha 68** - Feature list:
```typescript
// Antes
{ text: "GPS da Reforma (Notícias)", included: true },

// Depois
{ text: "PIT (Notícias da Reforma)", included: true },
```

**Linha 72** - Nome da comunidade:
```typescript
// Antes
Comunidade Circle Tributalks

// Depois
TribuTalks Connect
```

---

### 7. **src/data/commandPaletteTools.ts**

**Linha 80** - Path (corrigir):
```typescript
// Antes
path: '/gps-reforma/noticias',

// Depois
path: '/noticias',
```

**Linhas 87-93** - Nome da comunidade:
```typescript
// Antes
name: 'Comunidade Circle',

// Depois
name: 'TribuTalks Connect',
```

**Linha 172** - Path da timeline:
```typescript
// Antes
path: '/gps-reforma',

// Depois  
path: '/dashboard/timeline-reforma',
```

---

### 8. **src/data/toolsManual.ts**

**Linhas 591-618** - Atualizar ferramenta comunidade:

```typescript
// Antes
name: "Comunidade Circle",
fullDescription: `A Comunidade Circle é o espaço...

// Depois
name: "TribuTalks Connect",
fullDescription: `A TribuTalks Connect é a comunidade exclusiva...
```

---

### 9. **src/pages/Comunidade.tsx**

**Linha 118** - Título do card:
```typescript
// Antes
<h3>Comunidade Circle</h3>

// Depois
<h3>TribuTalks Connect</h3>
```

**Linha 145-146** - Card bloqueado:
```typescript
title="TribuTalks Connect"
description="Networking exclusivo para CFOs..."
```

---

### 10. **src/pages/Upgrade.tsx**

**Linha 39** - Lista de features:
```typescript
// Antes
'Comunidade Circle',

// Depois
'TribuTalks Connect',
```

---

### 11. **src/components/cases/CaseStudyPdf.tsx**

**Linha 168** - Footer do PDF:
```typescript
// Antes
"TribuTalks - GPS da Reforma Tributária"

// Depois
"TribuTalks - PIT - Plataforma de Inteligência Tributária"
```

---

### 12. **src/components/checklist/ChecklistReportPdf.tsx**

**Linha 243** - Footer do PDF:
```typescript
// Antes
'| GPS da Reforma Tributária'

// Depois
'| PIT - Plataforma de Inteligência Tributária'
```

---

### 13. **supabase/functions/mercadopago-webhook/index.ts** (E-mail de boas-vindas)

**Linha 463** - Texto do e-mail:
```typescript
// Antes
Junte-se ao GPS da Reforma Tributária

// Depois
Junte-se à TribuTalks Connect
```

**Linha 467** - Título do CTA:
```typescript
// Antes
🚀 Entre na Comunidade Exclusiva

// Depois
🚀 Entre na TribuTalks Connect
```

**Linha 475** - Link (manter URL, mas atualizar texto):
```typescript
// URL permanece: tributalksconnect.circle.so/c/boas-vindas-ao-gps
// Mas texto do link atualizado
```

**Linha 492** - Assinatura:
```typescript
// Antes
TribuTalks - O GPS da Reforma Tributária

// Depois
TribuTalks - PIT - Plataforma de Inteligência Tributária
```

---

## Resumo Visual das Mudanças

### Menu Lateral (Sidebar)
```text
┌─────────────────────────────┐
│ Clara AI              ⌘K   │
├─────────────────────────────┤
│ Diagnóstico                 │
│   • Meu Score               │
│   • Dashboard               │
├─────────────────────────────┤
│ PIT                    ← RENOMEADO
│   • Notícias da Reforma     │
│   • Timeline 2026-2033      │
│   • Checklist de Prontidão  │
├─────────────────────────────┤
│ Central Inteligente         │
│   • Analisador de Docs      │
│   • Workflows               │
│   • TribuTalks Connect ← RENOMEADO
└─────────────────────────────┘
```

### Landing Page (Pricing)
```text
Navigator inclui:
  ✓ PIT (Notícias da Reforma)  ← RENOMEADO
  ✓ TribuTalks Connect         ← RENOMEADO
```

---

## Arquivos Afetados (Total: 13)

| Categoria | Arquivo |
|-----------|---------|
| Navegação | menuConfig.ts, commandPaletteTools.ts |
| Dashboard | Dashboard.tsx |
| Onboarding | GuidedTour.tsx |
| Assistente | FloatingAssistant.tsx |
| Landing | FeaturesSection.tsx, PricingSection.tsx |
| Páginas | Comunidade.tsx, Upgrade.tsx |
| Docs | toolsManual.ts |
| PDFs | CaseStudyPdf.tsx, ChecklistReportPdf.tsx |
| Backend | mercadopago-webhook/index.ts |

---

## Resultado Final

- **PIT** será o nome da plataforma/seção de ferramentas
- **TribuTalks Connect** será o nome da comunidade Circle
- Todas as referências a "GPS da Reforma" serão atualizadas
- E-mail de boas-vindas Professional usará nova nomenclatura
