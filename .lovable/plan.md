

## Plano: Renomear Simpronto para "Comparativo de Regimes Tributários"

### Resumo
Eliminar o nome "Simpronto" da aplicação e consolidar tudo como **"Comparativo de Regimes Tributários"**, mantendo a mesma funcionalidade de cálculo dos 5 regimes:
1. Simples Nacional (atual)
2. Simples 2027 "Por Dentro"
3. Simples 2027 "Por Fora"
4. Lucro Presumido
5. Lucro Real

---

### Mudanças Necessárias

#### 1. Atualizar Menu em Todos os Planos
**Arquivo:** `src/data/menuConfig.ts`

Remover o item "Simpronto" duplicado e manter apenas "Comparativo de Regimes Tributários" com a descrição atualizada:

| Antes | Depois |
|-------|--------|
| `Comparativo de Regimes` → redireciona para Simpronto | Manter |
| `Simpronto` → `/dashboard/entender/simpronto` | Remover |

Novo item único:
```typescript
{ 
  label: 'Comparativo de Regimes', 
  href: '/dashboard/entender/comparativo', 
  icon: Scale, 
  description: '5 regimes tributários',
  badge: '2027' 
}
```

---

#### 2. Atualizar Rotas
**Arquivo:** `src/App.tsx`

| Rota Antes | Rota Depois |
|------------|-------------|
| `/dashboard/entender/simpronto` → SimprontoPage | `/dashboard/entender/comparativo` → SimprontoPage |
| `/dashboard/entender/comparativo` → redirect simpronto | Remover redirect (rota principal agora) |
| `/calculadora/comparativo-regimes` → redirect simpronto | Redirecionar para `/dashboard/entender/comparativo` |

Adicionar redirect de simpronto para compatibilidade:
```typescript
<Route path="/dashboard/entender/simpronto" element={<Navigate to="/dashboard/entender/comparativo" replace />} />
```

---

#### 3. Atualizar useRouteInfo.ts
**Arquivo:** `src/hooks/useRouteInfo.ts`

Renomear label da rota:
```typescript
'/dashboard/entender/comparativo': { 
  label: 'Comparativo de Regimes', 
  group: 'entender',
  groupLabel: 'Entender Meu Negócio',
  icon: Scale
}
```

Remover entrada de `/dashboard/entender/simpronto` (ou manter como alias).

---

#### 4. Atualizar Título da Página SimprontoPage
**Arquivo:** `src/pages/dashboard/SimprontoPage.tsx`

```typescript
// Antes
<h1 className="text-2xl font-bold">Simpronto</h1>

// Depois  
<h1 className="text-2xl font-bold">Comparativo de Regimes Tributários</h1>
```

Atualizar DashboardLayout title:
```typescript
<DashboardLayout title="Comparativo de Regimes">
```

---

#### 5. Atualizar RecommendationCard
**Arquivo:** `src/components/simpronto/RecommendationCard.tsx`

```typescript
// Antes
<CardTitle>Recomendação Simpronto</CardTitle>

// Depois
<CardTitle>Regime Recomendado</CardTitle>
```

---

#### 6. Atualizar HelpButton Slug
**Arquivo:** `src/pages/dashboard/SimprontoPage.tsx`

```typescript
// Antes
<HelpButton toolSlug="simpronto" />

// Depois
<HelpButton toolSlug="comparativo-regimes" />
```

---

#### 7. Atualizar GROUP_PATHS
**Arquivo:** `src/hooks/useRouteInfo.ts`

```typescript
// Antes
entender: [..., '/dashboard/entender/simpronto'],

// Depois
entender: [..., '/dashboard/entender/comparativo'],
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/data/menuConfig.ts` | Remover item Simpronto, atualizar href do Comparativo |
| `src/App.tsx` | Trocar rota principal para `/comparativo`, adicionar redirect de `/simpronto` |
| `src/hooks/useRouteInfo.ts` | Renomear rota e atualizar GROUP_PATHS |
| `src/pages/dashboard/SimprontoPage.tsx` | Atualizar título e textos |
| `src/components/simpronto/RecommendationCard.tsx` | Remover "Simpronto" do título |

---

### Arquivos que NÃO Precisam Mudar

Os arquivos internos podem manter o nome técnico "simpronto" para evitar refatoração massiva:
- `src/types/simpronto.ts` - tipos internos
- `src/utils/simprontoCalculations.ts` - funções de cálculo
- `src/components/simpronto/` - componentes internos
- Tabela `simpronto_simulations` no banco - dados já salvos

**Justificativa:** O nome interno não aparece para o usuário, apenas o label visual muda.

---

### Resultado Final

**Menu:**
```
ENTENDER MEU NEGÓCIO
├─ DRE Inteligente
├─ Score Tributário
└─ Comparativo de Regimes [2027]  ← único item, sem duplicação
```

**Página:**
```
Comparativo de Regimes Tributários
Compare 5 regimes tributários em minutos...

[Wizard de 2 passos]

[Resultado com "Regime Recomendado"]
```

