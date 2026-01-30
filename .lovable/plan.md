
# Plano: Ativar Integração com Circle Community

## Resumo

Corrigir a URL do Circle e ativar o acesso para usuários NAVIGATOR+ na página de Comunidade.

---

## Alterações Necessárias

### 1. `src/config/site.ts`

Atualizar a URL do Circle:

```typescript
// De:
CIRCLE_COMMUNITY: "https://tributalks.circle.so",

// Para:
CIRCLE_COMMUNITY: "https://tributalksconnect.circle.so",
```

### 2. `src/pages/Comunidade.tsx`

Alterar o card "Comunidade Circle" para usuários NAVIGATOR+:

- Remover a badge "Em breve"
- Trocar botão desabilitado por link funcional
- Abrir o Circle em nova aba

**Antes:**
```tsx
<Badge variant="outline">Em breve</Badge>
...
<Button disabled className="gap-2">
  Aguardando lançamento
</Button>
```

**Depois:**
```tsx
<Badge variant="secondary">{PLAN_LABELS.NAVIGATOR}+</Badge>
...
<Button asChild className="gap-2">
  <a href={CONFIG.CIRCLE_COMMUNITY} target="_blank" rel="noopener noreferrer">
    Acessar comunidade
    <ExternalLink className="w-4 h-4" />
  </a>
</Button>
```

---

## Comportamento Final

| Plano | Acesso Circle |
|-------|---------------|
| FREE / STARTER | Bloqueado (card locked com CTA upgrade) |
| NAVIGATOR+ | Link ativo abrindo em nova aba |

---

## Observação sobre Autenticação

O Circle usa autenticação própria (email, Google, Twitter, Facebook). Usuários precisarão fazer login separado no Circle ao acessar pela primeira vez.
