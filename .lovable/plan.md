
# Reestruturar Comunidade com Newsletter + Badges

## Visão Geral

Reorganizar a página de Comunidade para incluir:
1. **Newsletter TribuTalks News** - Disponível para TODOS os planos (primeiro da lista)
2. **Grupo WhatsApp** - Exclusivo NAVIGATOR
3. **Comunidade Circle** - Exclusivo PROFESSIONAL+ com badge "NOVO"
4. **Biblioteca de Conteúdos** - Mantém NAVIGATOR+

---

## Alterações no Arquivo: `src/pages/Comunidade.tsx`

### 1. Adicionar imports necessários

```typescript
import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/common/NewsletterForm";
```

### 2. Nova estrutura de cards (ordem)

| # | Card | Acesso | Badge |
|---|------|--------|-------|
| 1 | Newsletter TribuTalks News | TODOS | - |
| 2 | Grupo WhatsApp | NAVIGATOR | NAVIGATOR |
| 3 | Comunidade Circle | PROFESSIONAL+ | NOVO |
| 4 | Biblioteca de Conteúdos | NAVIGATOR+ | NAVIGATOR+ |

### 3. Card da Newsletter (novo - antes do WhatsApp)

```tsx
{/* Newsletter - Todos os planos */}
<Card className="border-primary/20">
  <CardContent className="pt-6">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Mail className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground">TribuTalks News</h3>
          <Badge variant="outline" className="text-xs">Todos os planos</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Newsletter semanal com análises exclusivas sobre a Reforma Tributária. 
          Toda terça-feira às 07h07 no seu email.
        </p>
        <NewsletterForm variant="compact" />
      </div>
    </div>
  </CardContent>
</Card>
```

### 4. Atualizar Circle Community com badge "NOVO"

Linha ~96 - Adicionar badge "NOVO" após o badge PROFESSIONAL+:

```tsx
<div className="flex items-center gap-2 mb-1">
  <h3 className="font-semibold text-foreground">Comunidade Circle</h3>
  <Badge variant="secondary" className="text-xs">{PLAN_LABELS.PROFESSIONAL}+</Badge>
  <Badge className="text-xs bg-primary text-primary-foreground">NOVO</Badge>
</div>
```

---

## Resultado Visual Final

```text
┌─────────────────────────────────────────────┐
│  📧 TribuTalks News                         │
│  [Todos os planos]                          │
│  Newsletter semanal...                      │
│  [Formulário de inscrição]                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  💬 Grupo WhatsApp                          │
│  [NAVIGATOR]                                │
│  Networking informal...                     │
│  [Entrar no grupo]                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  👥 Comunidade Circle                       │
│  [PROFESSIONAL+] [NOVO]                     │
│  Networking premium...                      │
│  [Acessar comunidade]                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📚 Biblioteca de Conteúdos                 │
│  [NAVIGATOR+]                               │
│  Guias, templates...                        │
└─────────────────────────────────────────────┘
```

---

## Benefícios

- **Newsletter para todos**: Mesmo usuários Starter recebem valor desde o primeiro dia
- **Hierarquia clara**: Progressão natural de benefícios conforme o plano
- **Badge "NOVO"**: Destaca a comunidade Circle como novidade, incentivando upgrade
- **Consistência visual**: Usa o componente NewsletterForm já existente
