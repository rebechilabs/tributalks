
# Plano: Substituir Emojis Restantes na Landing Page

## Resumo

Trocar os últimos emojis que ainda existem nos componentes da Landing Page por ícones Lucide React.

---

## Arquivos a Modificar

### 1. JourneysSection.tsx

| Linha | Emoji Atual | Ícone Lucide | Contexto |
|-------|-------------|--------------|----------|
| 9, 28, 48 | 🎯, 📊, 🎛️ | Remover `emoji` property | Já tem `icon` com componente correto |
| 64 | ⭐ MAIS POPULAR | `Star` + texto | Badge do plano popular |
| 157 | 💡 ROI médio | `Lightbulb` | Dica de ROI no footer do card |

### 2. HeroSection.tsx

| Linha | Emoji Atual | Ícone Lucide | Contexto |
|-------|-------------|--------------|----------|
| 142 | ⭐ 4.8/5 | `Star` (já importado) | Avaliação média no social proof |

---

## Mudanças Detalhadas

### JourneysSection.tsx

**Passo 1**: Remover propriedade `emoji` dos objetos `journeys` (linhas 9, 28, 48)

**Passo 2**: Alterar renderização do ícone (linha 103):
```tsx
// Antes
<div className="text-4xl mb-4">{journey.emoji}</div>

// Depois
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
  <journey.icon className="w-6 h-6 text-primary" />
</div>
```

**Passo 3**: Alterar badge "MAIS POPULAR" (linha 64, 96):
```tsx
// Antes
badge: "⭐ MAIS POPULAR"
{journey.badge}

// Depois
badge: "MAIS POPULAR"
<Star className="w-4 h-4" /> {journey.badge}
```

**Passo 4**: Alterar ROI hint (linha 157):
```tsx
// Antes
💡 {journey.roi}

// Depois
<Lightbulb className="w-4 h-4 inline mr-1" /> {journey.roi}
```

### HeroSection.tsx

**Passo 1**: Alterar avaliação média (linha 142):
```tsx
// Antes
<strong className="text-2xl text-foreground">⭐ 4.8/5</strong>

// Depois
<div className="flex items-center gap-1">
  <Star className="w-5 h-5 text-primary fill-primary" />
  <strong className="text-2xl text-foreground">4.8/5</strong>
</div>
```

---

## Resultado Esperado

- Zero emojis em toda a Landing Page
- Consistência visual com ícones SVG escaláveis
- Ícones configuráveis em tamanho/cor via props
- Melhor controle de design e acessibilidade

---

## Estimativa

~15-20 minutos de implementação
