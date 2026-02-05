
# Plano: Expandir Edição de Dados Cadastrais das Empresas

## Situação Atual

O modal `EditCompanyModal.tsx` já existe e funciona, mas permite editar apenas 2 campos:
- Nome Fantasia
- Regime Tributário

A tabela `company_profile` possui muitos mais campos editáveis que são relevantes para o usuário.

## Campos a Adicionar ao Modal de Edição

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `razao_social` | text | Razão Social (editável) |
| `uf_sede` | text | Estado sede |
| `municipio_sede` | text | Município sede |
| `setor` | text | Setor de atuação |
| `segmento` | text | Segmento |
| `porte` | text | Porte da empresa |
| `num_funcionarios` | integer | Número de funcionários |
| `faturamento_anual` | numeric | Faturamento anual |

## Campos que Permanecem Bloqueados
- **CNPJ** - não pode ser alterado (conforme solicitado)

## Alterações Necessárias

### 1. `src/contexts/CompanyContext.tsx`
Expandir a interface `Company` para incluir os novos campos:
```typescript
export interface Company {
  id: string;
  user_id: string;
  cnpj_principal: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  regime_tributario: string | null;
  uf_sede: string | null;
  municipio_sede: string | null;
  setor: string | null;
  segmento: string | null;
  porte: string | null;
  num_funcionarios: number | null;
  faturamento_anual: number | null;
  created_at?: string;
}
```

Atualizar a query para buscar esses campos adicionais.

### 2. `src/components/setup/EditCompanyModal.tsx`
Expandir o modal para incluir os novos campos editáveis:

- Adicionar estados para cada campo
- Adicionar inputs/selects organizados em seções:
  - **Identificação**: Razão Social, Nome Fantasia
  - **Localização**: UF, Município
  - **Caracterização**: Regime Tributário, Setor, Segmento, Porte
  - **Estrutura**: Número de funcionários, Faturamento anual
- Atualizar o `handleSave` para enviar todos os campos

### 3. Opções de Select

**UF (Estados):**
- AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO

**Porte:**
- MEI, Micro Empresa, Pequena Empresa, Média Empresa, Grande Empresa

**Setor:**
- Comércio, Indústria, Serviços, Agronegócio, Tecnologia, Construção, Saúde, Educação, Financeiro, Outro

## Layout do Modal Expandido

```text
┌──────────────────────────────────────────────────┐
│ 🏢 Editar Empresa                                │
├──────────────────────────────────────────────────┤
│ CNPJ (bloqueado)     [██████████████████████████]│
│                                                  │
│ ── Identificação ──                              │
│ Razão Social         [________________________] │
│ Nome Fantasia        [________________________] │
│                                                  │
│ ── Tributação ──                                 │
│ Regime Tributário    [▼ Simples Nacional      ] │
│                                                  │
│ ── Localização ──                                │
│ UF           [▼ SP   ]  Município [___________] │
│                                                  │
│ ── Caracterização ──                             │
│ Porte        [▼ Pequena Empresa]                 │
│ Setor        [▼ Serviços       ]                 │
│ Segmento     [________________________]          │
│                                                  │
│ ── Estrutura ──                                  │
│ Funcionários [_____]   Faturamento Anual [_____]│
│                                                  │
│              [Cancelar]  [Salvar Alterações]     │
└──────────────────────────────────────────────────┘
```

## Benefícios

1. **Dados mais completos** - Usuários podem manter informações atualizadas
2. **Melhor experiência** - Não precisa excluir/recriar empresa para corrigir dados
3. **Integração com ferramentas** - Campos como UF e Município são usados pelo prefill inteligente
4. **Flexibilidade** - Permite ajustes conforme a empresa evolui
