

# Plano: Clarear Mais a Imagem do Hero

## Alteração

Reduzir ainda mais a opacidade do overlay escuro para deixar a imagem da sala de reunião mais visível.

---

## Mudança Técnica

**Arquivo:** `src/components/connect/ConnectHeroSection.tsx`  
**Linha:** 14

| Atual | Novo |
|-------|------|
| `rgba(0,0,0,0.3), rgba(0,0,0,0.6)` | `rgba(0,0,0,0.2), rgba(0,0,0,0.5)` |

```typescript
backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url('/images/hero-meeting-room.png')`,
```

---

## Resultado

A imagem ficará mais clara e visível, mantendo contraste suficiente para leitura do texto branco.

