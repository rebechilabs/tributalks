

# Plano: Destaque para Campanha de Indicação

## Resumo

Mover a campanha "Indicar Amigos" para uma posição de destaque no topo do Sidebar, logo após o Dashboard, com visual diferenciado para chamar atenção.

---

## Mudanças Propostas

### Arquivo: `src/components/dashboard/Sidebar.tsx`

#### 1. Criar Card de Destaque para Indicação
Adicionar um card promocional visualmente destacado logo abaixo do logo, antes da navegação principal:

```text
┌─────────────────────────────┐
│  🎁 Indique e Ganhe!        │
│  Ganhe até 20% de desconto  │
│  [Indicar Agora]            │
└─────────────────────────────┘
```

**Características visuais:**
- Background com gradiente dourado/primário
- Ícone de presente animado (pulse suave)
- Texto de benefício claro
- CTA destacado
- Badge "Novo" ou contador de indicações pendentes

#### 2. Remover do Grupo "IA e Documentos"
- Remover o item `{ label: 'Indicar Amigos', href: '/indicar', icon: Gift, badge: 'Novo' }` da lista atual
- Evitar duplicação no menu

#### 3. Adicionar Indicador de Progresso (Opcional)
Se o usuário já tiver indicações, mostrar o nível atual de desconto:
- "Você tem 5% de desconto" com barra de progresso para o próximo nível

---

## Código Proposto

### Novo Componente: Card de Indicação

```tsx
{/* Referral Highlight Card - Logo abaixo do logo */}
<div className="mx-3 mb-4 p-3 rounded-lg bg-gradient-to-br from-amber-500/20 via-primary/20 to-amber-500/10 border border-amber-500/30">
  <Link to="/indicar" className="block group">
    <div className="flex items-center gap-2 mb-1">
      <Gift className="w-5 h-5 text-amber-500 animate-pulse" />
      <span className="text-sm font-bold text-foreground">Indique e Ganhe!</span>
      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500 text-white font-medium">
        Novo
      </span>
    </div>
    <p className="text-xs text-muted-foreground mb-2">
      Ganhe até 20% de desconto na sua mensalidade
    </p>
    <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-amber-500 text-white text-xs font-semibold group-hover:bg-amber-600 transition-colors">
      <Sparkles className="w-3 h-3" />
      Indicar Agora
    </div>
  </Link>
</div>
```

---

## Estrutura Final do Sidebar

```text
┌─────────────────────────────┐
│  [Logo TribuTalks]          │
├─────────────────────────────┤
│  🎁 INDIQUE E GANHE!        │  ← NOVO: Card destacado
│  Ganhe até 20% de desconto  │
│  [Indicar Agora]            │
├─────────────────────────────┤
│  • Dashboard                │
├─────────────────────────────┤
│  1️⃣ Entender               │
│  • Score Tributário         │
│  • Clara AI                 │
├─────────────────────────────┤
│  2️⃣ Simular                │
│  • Split Payment            │
│  • (...)                    │
├─────────────────────────────┤
│  (... resto do menu ...)    │
└─────────────────────────────┘
```

---

## Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Posição | 7º grupo (IA e Docs) | Topo, logo após o logo |
| Visibilidade | Item comum no menu | Card promocional destacado |
| Estilo | Texto simples | Gradiente + animação + CTA |
| Ação | Click para navegar | CTA claro "Indicar Agora" |

---

## Benefícios

- **Maior conversão**: Posição de destaque aumenta cliques
- **Visual atrativo**: Gradiente dourado chama atenção sem ser invasivo
- **CTA claro**: "Indicar Agora" incentiva ação imediata
- **Não polui o menu**: Remove duplicação do grupo "IA e Documentos"

