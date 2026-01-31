
# Corrigir "Premium" para "Professional"

## Problema

O termo "Premium" aparece em dois lugares na página de Contato, mas o plano correto é "Professional".

---

## Correções

| Local | Linha | Texto Atual | Texto Corrigido |
|-------|-------|-------------|-----------------|
| FAQ | 77 | `"Como agendar minhas consultorias (Premium)?"` | `"Como agendar minhas consultorias (Professional)?"` |
| Horário | 288 | `"• Premium: prioritário"` | `"• Professional: prioritário"` |

---

## Código

```tsx
// Linha 77 - FAQ
// Antes
"Como agendar minhas consultorias (Premium)?",

// Depois
"Como agendar minhas consultorias (Professional)?",
```

```tsx
// Linha 288 - Horário de Atendimento
// Antes
<p className="text-sm">• Premium: prioritário</p>

// Depois
<p className="text-sm">• Professional: prioritário</p>
```

---

## Arquivo Alterado

- `src/pages/Contato.tsx` (linhas 77 e 288)
