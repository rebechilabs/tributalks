

# Plano: Destaque para "Indique e Ganhe"

## Objetivo
Reorganizar o layout da página Conexão para dar destaque ao card "Indique e Ganhe", colocando-o em uma linha separada abaixo, ocupando toda a largura.

## Layout Atual
```text
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Notícias │ │TribuTalks│ │Comunidade│ │ Indique  │
│          │ │  News    │ │          │ │ e Ganhe  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## Layout Proposto
```text
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│    Notícias   │ │ TribuTalks    │ │  Comunidade   │
│               │ │    News       │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
┌─────────────────────────────────────────────────────┐
│                 INDIQUE E GANHE                     │
│     Ganhe até 20% de desconto indicando amigos      │
│                    [Acessar →]                      │
└─────────────────────────────────────────────────────┘
```

## Mudanças Técnicas

### Arquivo: `src/pages/dashboard/ConexaoPage.tsx`

1. **Separar as ferramentas em dois grupos**:
   - `topTools`: Notícias, TribuTalks News, Comunidade
   - `featuredTool`: Indique e Ganhe (card destacado)

2. **Ajustar estrutura do grid**:
   - Grid superior: `grid-cols-1 md:grid-cols-3` para os 3 cards
   - Card inferior: layout horizontal com largura total

3. **Criar card especial para destaque**:
   - Layout horizontal: ícone à esquerda, texto no centro, botão à direita
   - Background com gradiente sutil para destaque visual
   - Badge "Novo" em evidência
   - Efeito hover mais pronunciado

## Estrutura do Código

```tsx
<div className="max-w-5xl w-full space-y-6">
  {/* Linha 1: 3 cards menores */}
  <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
    {topTools.map((tool) => (
      <ModuleToolCard key={tool.href} {...tool} />
    ))}
  </div>
  
  {/* Linha 2: Card grande em destaque */}
  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
    <div className="flex items-center gap-6 p-6">
      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
        <Gift className="w-7 h-7 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold">Indique e Ganhe</h3>
          <Badge>Novo</Badge>
        </div>
        <p className="text-muted-foreground">
          Ganhe até 20% de desconto indicando amigos
        </p>
      </div>
      <Button asChild>
        <Link to="/indicar">Acessar <ArrowRight /></Link>
      </Button>
    </div>
  </Card>
</div>
```

## Resumo

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/dashboard/ConexaoPage.tsx` | Reorganizar layout: 3 cards em cima + 1 card largo embaixo com destaque visual |

## Resultado
- "Indique e Ganhe" ganha destaque visual significativo
- Layout hierárquico que direciona atenção para o programa de indicação
- Card maior com gradiente e ícone ampliado
- Mantém consistência visual com o restante da plataforma

