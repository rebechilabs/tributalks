
# Aplicar Suporte Multi-Empresa ao Wizard de Perfil

## Resumo

O arquivo enviado adiciona suporte para multiplas empresas no wizard de perfil (`PerfilEmpresa.tsx`), alem de incluir campos setoriais que faltavam no `loadProfile` e `saveProgress`. Porem, o arquivo tem alguns bugs que precisam ser corrigidos antes de aplicar.

## Problemas no Arquivo Enviado (que serao corrigidos)

1. **`selectedCompany` nao existe** no `CompanyContext` — o nome correto e `currentCompany`
2. **`selectedCompany.name` e `selectedCompany.cnpj`** nao existem na interface `Company` — os campos corretos sao `nome_fantasia` e `cnpj_principal`
3. **`company_id` nao existe** na tabela `company_profile` — a propria coluna `id` da tabela e o identificador da empresa. O filtro correto para multi-empresa e `.eq('id', currentCompany.id)`
4. **O `match-opportunities` nao aceita `company_id` no body** — ele usa o JWT para buscar o perfil. Para suporte multi-empresa, precisaria ser adaptado separadamente

## O Que Sera Implementado

### 1. Corrigir imports e hooks
- Trocar `selectedCompany` por `currentCompany` (do `useCompany()`)

### 2. Filtro multi-empresa com `getProfileFilter()`
- Quando `currentCompany` existe, filtrar por `id = currentCompany.id`
- Fallback para `user_id = user.id` quando nao ha empresa selecionada

### 3. Banner da empresa selecionada
- Mostrar qual empresa esta sendo configurada na tela intro
- Usar `currentCompany.nome_fantasia || currentCompany.cnpj_principal`

### 4. Campos setoriais no loadProfile e saveProgress
- Adicionar todos os campos setor-especificos que o arquivo enviado inclui (artesanato, saude, construcao, transporte, etc.)
- Garantir que o save e load cobrem os mesmos campos

### 5. Dependencia do useEffect em `currentCompany.id`
- Recarregar perfil ao trocar de empresa

## Detalhes Tecnicos

### Arquivo modificado:
- `src/pages/PerfilEmpresa.tsx`

### Mapeamento de correcoes:
```text
selectedCompany          →  currentCompany
selectedCompany.name     →  currentCompany.nome_fantasia
selectedCompany.cnpj     →  currentCompany.cnpj_principal
company_id column        →  id (PK da tabela)
{ column: "company_id" } →  { column: "id" }
```

### Logica do getProfileFilter:
```text
if currentCompany exists:
  filter by id = currentCompany.id
else:
  filter by user_id = user.id
```

### Nenhuma migracao de banco necessaria
A tabela `company_profile` ja tem a coluna `id` como PK — nao precisa de `company_id`.
