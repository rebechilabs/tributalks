
# Remover checks dos sub-itens de Workflows

## Objetivo
Alterar a exibição dos 4 Workflows Guiados no plano Professional para que apareçam como sub-itens (sem check verde), indicando visualmente que eles são componentes do item pai "4 Workflows Guiados:".

## Mudança

### Arquivo: `src/components/landing/PricingSection.tsx`

Adicionar nova propriedade `isSubItem` na interface e nos dados:

```typescript
interface PlanFeature {
  text: string;
  included: boolean | "limited";
  limitText?: string;
  isSubItem?: boolean;  // Nova propriedade
}
```

Marcar os 4 workflows como sub-itens:

| Antes | Depois |
|-------|--------|
| `{ text: "  1. Diagnóstico Tributário Completo", included: true }` | `{ text: "1. Diagnóstico Tributário Completo", included: true, isSubItem: true }` |
| `{ text: "  2. Preparação para a Reforma", included: true }` | `{ text: "2. Preparação para a Reforma", included: true, isSubItem: true }` |
| `{ text: "  3. Análise de Contratos Societários", included: true }` | `{ text: "3. Análise de Contratos Societários", included: true, isSubItem: true }` |
| `{ text: "  4. Simulação de Preços", included: true }` | `{ text: "4. Simulação de Preços", included: true, isSubItem: true }` |

Atualizar a renderização para não exibir ícone quando for sub-item, apenas indentação:

```tsx
<li key={feature.text} className="flex items-start gap-2">
  {feature.isSubItem ? (
    <span className="w-5 flex-shrink-0" /> {/* Espaço vazio para indentação */}
  ) : plan.isEnterprise && feature.included === true ? (
    <Diamond className="w-5 h-5 text-primary flex-shrink-0" />
  ) : feature.included === true ? (
    <Check className="w-5 h-5 text-success flex-shrink-0" />
  ) : /* ... resto do código */}
```

## Resultado Visual

**Antes:**
```
✓ 4 Workflows Guiados:
✓ 1. Diagnóstico Tributário Completo
✓ 2. Preparação para a Reforma
✓ 3. Análise de Contratos Societários
✓ 4. Simulação de Preços
```

**Depois:**
```
✓ 4 Workflows Guiados:
    1. Diagnóstico Tributário Completo
    2. Preparação para a Reforma
    3. Análise de Contratos Societários
    4. Simulação de Preços
```

---

## Detalhes Técnicos

- Arquivo modificado: `src/components/landing/PricingSection.tsx`
- Impacto: Apenas visual, sem alteração de lógica ou dados
- Linhas afetadas: ~10-14 (interface), ~89-92 (dados), ~236-245 (renderização)
