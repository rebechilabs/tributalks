

# Permitir Edição Inline no Quadro de Dados da Empresa (StepIntro)

## Resumo

Adicionar um botao de edicao (icone Pencil) em cada linha preenchida do quadro de dados da empresa na Etapa 1. Ao clicar, o campo entra em modo de edicao inline, permitindo corrigir o valor sem precisar passar pelo fluxo de perguntas novamente. Campos vazios continuam com o comportamento atual (respondidos na Etapa 2).

## Como funciona

### Comportamento por tipo de campo

| Campo | Tipo de edicao |
|-------|---------------|
| Regime Tributario | Dropdown com 3 opcoes (Simples, Presumido, Real) |
| Setor | Dropdown com 8 opcoes |
| Faturamento Anual | Input numerico com mascara R$ |
| Funcionarios | Dropdown com faixas (0-9, 10-49, etc.) |
| Estado (UF) | Dropdown com 27 UFs |
| Exportacao | Toggle Sim/Nao |
| Importacao | Toggle Sim/Nao |

### Fluxo do usuario

1. Usuario ve o quadro com os dados preenchidos
2. Clica no icone de lapis ao lado do valor que quer corrigir
3. O valor vira um campo editavel (select, input ou toggle, conforme o tipo)
4. Usuario altera e clica no botao de confirmacao (icone Check) ou pressiona Enter
5. O valor e salvo imediatamente no banco via `supabase.from('company_profile').update()`
6. O campo volta ao modo leitura com o novo valor e badge verde

### Cancelar edicao

- Icone X ao lado do Check para cancelar
- Pressionar Escape tambem cancela

## Detalhes Tecnicos

### Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/planejar/StepIntro.tsx` | Adicionar estado de edicao por campo, renderizar inputs inline, logica de save |

### Mudancas no StepIntro.tsx

1. Adicionar `editingField` state (string ou null) para controlar qual campo esta em modo edicao
2. Adicionar `editValue` state para o valor temporario durante edicao
3. Expandir o array `FIELDS` com metadata de tipo de edicao e opcoes (reutilizar as mesmas opcoes do StepQuestions)
4. Renderizar icone Pencil em cada linha preenchida (ao lado do CheckCircle2)
5. Quando `editingField === key`, renderizar o campo de edicao apropriado no lugar do valor
6. Funcao `handleSave` que faz update no Supabase e chama `refetch` (recebido via props)
7. Adicionar `companyId`, `userId` e `onFieldUpdated` (callback para refetch) nas props

### Novas props do StepIntro

```text
interface StepIntroProps {
  company: CompanyData | null;
  missingCount: number;
  onNext: () => void;
  companyId: string | null;    // novo
  userId: string | null;       // novo
  onFieldUpdated: () => void;  // novo - chama refetch no PlanejarFlow
}
```

### PlanejarFlow.tsx

Passar as novas props para StepIntro:
- `companyId={companyProfile?.id as string}`
- `userId={user?.id}`
- `onFieldUpdated={refetch}`

### Sem migracoes de banco

Nenhuma alteracao no banco necessaria — os campos ja existem.

