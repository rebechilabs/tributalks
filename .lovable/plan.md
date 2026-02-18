

# Migrar Campos de Artesanato e Persistir no Wizard

## Resumo

Adicionar 14 colunas booleanas de artesanato na tabela `company_profile` no banco de dados, e atualizar o wizard (`PerfilEmpresa.tsx`) para ler e salvar esses campos corretamente.

## Etapas

### 1. Executar a migracao no banco de dados
Adicionar as 14 colunas na tabela `company_profile`:
- **Artesanato (Producao)**: `tem_carteira_artesao`, `artesanato_regional`, `mei_artesao`, `venda_direta_consumidor`, `participa_feiras`, `exporta_artesanato`, `usa_insumos_naturais`
- **Comercio de Artesanato**: `compra_artesao_local`, `compra_cooperativas`, `revende_artesanato_regional`, `loja_fisica_artesanato`, `vende_turistas`, `exporta_revenda_artesanato`, `participa_feiras_revenda`

Todas `boolean NOT NULL DEFAULT false`, com comentarios descritivos.

### 2. Atualizar `src/pages/PerfilEmpresa.tsx`
Incluir os 14 campos de artesanato no `loadProfile` (leitura do banco) e no `saveProgress` (escrita no banco), seguindo o mesmo padrao ja usado para os demais setores (saude, construcao, transporte, etc.).

Campos a adicionar no select e no upsert:
```text
tem_carteira_artesao, artesanato_regional, mei_artesao,
venda_direta_consumidor, participa_feiras, exporta_artesanato,
usa_insumos_naturais, compra_artesao_local, compra_cooperativas,
revende_artesanato_regional, loja_fisica_artesanato, vende_turistas,
exporta_revenda_artesanato, participa_feiras_revenda
```

### O que NAO muda
- `ProfileWizardSteps.tsx` ja tem os campos, labels e defaults configurados -- nenhuma alteracao necessaria
- `CompanyContext.tsx` nao precisa de mudanca (nao gerencia campos setoriais)

## Detalhes Tecnicos

### SQL da migracao
Exatamente o SQL fornecido pelo usuario, com `ADD COLUMN IF NOT EXISTS` e `COMMENT ON COLUMN`.

### Alteracoes no PerfilEmpresa.tsx
Adicionar os 14 campos booleanos tanto na query `.select(...)` do `loadProfile` quanto no objeto do `.upsert(...)` do `saveProgress`, mapeando de/para `formData` com o mesmo nome de campo.

