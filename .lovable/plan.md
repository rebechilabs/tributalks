
# Plano: Adicionar Valuation como Item Separado no Sidebar

## Objetivo
Expor o **Valuation (3 metodologias)** como uma ferramenta independente no sidebar, dentro do módulo **COMANDAR**, permitindo acesso direto sem precisar entrar no NEXUS.

---

## Mudanças Propostas

### 1. Criar Página Dedicada para Valuation

**Novo arquivo:** `src/pages/ValuationPage.tsx`

Página focada exclusivamente na estimativa de valuation, contendo:
- O componente `ExecutiveValuationCard` expandido como hero principal
- Explicação das 3 metodologias (EBITDA, DCF, Receita)
- Informações sobre como o Score Tributário impacta o valor
- CTAs para melhorar dados (DRE, Score)

---

### 2. Atualizar Configuração do Menu

**Arquivo:** `src/data/menuConfig.ts`

Adicionar item "Valuation" no módulo COMANDAR para os planos Professional e Enterprise:

```
COMANDAR
├── NEXUS (8 KPIs)
├── Valuation ← NOVO
└── Relatórios PDF
```

Características do item:
- Ícone: `TrendingUp`
- Rota: `/dashboard/comandar/valuation`
- Badge: "3 métodos"
- Descrição: "Estimativa de valor da empresa"

---

### 3. Configurar Rota

**Arquivo:** `src/App.tsx`

Adicionar rota protegida `/dashboard/comandar/valuation` apontando para a nova página.

---

### 4. Atualizar Página do Módulo COMANDAR

**Arquivo:** `src/pages/dashboard/ComandarPage.tsx`

Adicionar card para Valuation na grid de ferramentas do módulo, entre NEXUS e Relatórios PDF.

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/ValuationPage.tsx` | Criar (nova página dedicada) |
| `src/data/menuConfig.ts` | Adicionar item "Valuation" no COMANDAR |
| `src/App.tsx` | Adicionar rota `/dashboard/comandar/valuation` |
| `src/pages/dashboard/ComandarPage.tsx` | Adicionar card na grid |

---

## Resultado Final

O usuário Professional/Enterprise verá no sidebar:

```
COMANDAR
├── NEXUS                    (8 KPIs)
├── Valuation               (3 métodos) ← NOVO ITEM
└── Relatórios PDF
```

Clicar em "Valuation" levará diretamente à calculadora de valuation com as 3 metodologias (EBITDA, DCF, Receita Múltipla).
