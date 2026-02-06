

# Plano: Restaurar Hero com Imagem Personalizada

## Resumo

Substituir a imagem de fundo do Hero pela imagem fornecida pelo usuário e reverter o overlay para a opacidade original (mais escura).

---

## Alterações

### 1. Imagem de Fundo (Hero)

**Arquivo:** `src/components/connect/ConnectHeroSection.tsx`

**Substituições na linha 14:**

| Elemento | Valor Atual | Novo Valor |
|----------|-------------|------------|
| Overlay | `rgba(0,0,0,0.4), rgba(0,0,0,0.6)` | `rgba(0,0,0,0.6), rgba(0,0,0,0.85)` |
| URL da Imagem | Unsplash `photo-1510851896000-498520af2236` | `https://files.manuscdn.com/user_upload_by_module/session_file/310419663029166293/qaMmEmCHnLviShNr.jpg` |

### 2. Overlay Inferior

**Linha 21:**

| Valor Atual | Novo Valor |
|-------------|------------|
| `to-black/70` | `to-black/90` |

---

## Sobre o Formulário

O formulário já possui:
- Estado de loading com spinner dourado
- Timeout de 10 segundos
- Botão de fallback "Aplicar em nova aba"

A lentidão é do próprio Typeform (serviço externo). O mecanismo de fallback já está implementado para lidar com isso.

---

## Código Final (linha 14)

```typescript
backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663029166293/qaMmEmCHnLviShNr.jpg')`,
```

