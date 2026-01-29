
# Adicionar Chatham House Rule à Comunidade

## O Que É
A **Chatham House Rule** é uma regra de confidencialidade internacionalmente reconhecida: participantes podem usar as informações compartilhadas, mas não devem revelar a identidade ou afiliação de quem falou.

## Proposta Visual

Adicionar um banner elegante logo após o header da página, antes dos cards de comunidade:

```
┌─────────────────────────────────────────────────────────────┐
│  🤝  Chatham House Rule                                     │
│                                                             │
│  "O que é compartilhado aqui, fica aqui."                  │
│                                                             │
│  Informações podem ser usadas livremente, mas a            │
│  identidade de quem compartilhou deve ser preservada.      │
└─────────────────────────────────────────────────────────────┘
```

## Alteração Técnica

### Arquivo: `src/pages/Comunidade.tsx`

**1. Adicionar ícone Shield ao import:**
```typescript
import { Users, Lock, Sparkles, ExternalLink, MessageCircle, Calendar, BookOpen, Shield } from "lucide-react";
```

**2. Inserir componente após o header (linha 28), antes do grid de cards:**

```tsx
{/* Chatham House Rule Banner */}
<div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
  <div className="flex items-start gap-3">
    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
    <div>
      <p className="text-sm font-medium text-foreground mb-1">
        Chatham House Rule
      </p>
      <p className="text-sm text-muted-foreground">
        "O que é compartilhado aqui, fica aqui." Informações podem ser 
        usadas livremente, mas a identidade de quem compartilhou deve 
        ser preservada.
      </p>
    </div>
  </div>
</div>
```

## Resultado

- Transmite **confiança e exclusividade**
- Incentiva discussões mais **abertas e honestas**
- Posiciona a comunidade como **espaço seguro** para CFOs
- Diferencia das comunidades genéricas de WhatsApp

## Impacto
- Zero breaking changes
- ~15 linhas de código
- Aumenta valor percebido da comunidade
