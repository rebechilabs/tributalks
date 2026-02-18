
# Seletor de Regime Tributario no Header Global

## Resumo

Adicionar um badge clicavel com o regime tributario atual ao lado do seletor de empresa, permitindo troca rapida com propagacao automatica para todas as ferramentas. Tambem sincronizar o campo de regime na pagina de Perfil com o `company_profile`.

## O que sera feito

### 1. Novo componente `RegimeBadgeSelector` (`src/components/company/RegimeBadgeSelector.tsx`)

Badge clicavel exibido ao lado do seletor de empresa na barra do `CompanySelector`:

- Icone de balanca (Scale do lucide-react) + texto do regime atual ("Simples Nacional" / "Lucro Presumido" / "Lucro Real")
- Estilo: fundo escuro (`bg-card`), borda dourada sutil (`border-yellow-500/30`), texto branco
- Hover: borda dourada mais forte (`border-yellow-500/60`)
- Se nenhum regime definido: exibe "Definir regime" em texto muted

Ao clicar, abre dropdown com 3 opcoes:
- Simples Nacional
- Lucro Presumido
- Lucro Real
- Opcao selecionada com icone Check

Ao selecionar um regime diferente do atual:
- Exibir `AlertDialog` de confirmacao: "Alterar regime para X? Isso afetara os calculos de todas as ferramentas."
- Ao confirmar: chamar `updateCompany(currentCompany.id, { regime_tributario: novoRegime })` do CompanyContext
- Invalidar queries relevantes (dre, tax-score, credits, comparativo) via queryClient
- Exibir toast de sucesso: "Regime atualizado para X"

### 2. Integrar no `CompanySelector.tsx`

Adicionar o `RegimeBadgeSelector` dentro da barra existente do CompanySelector, apos o dropdown de empresa e antes do botao "Adicionar CNPJ":

```
[Building2 icon] Empresa: [INDUSTRIA DE PAES... v] [Scale icon Lucro Presumido v] [+ Adicionar CNPJ]
```

O componente so aparece quando `currentCompany` existe e o plano e Navigator+ (mesma condicao do CompanySelector).

### 3. Sincronizar Perfil (`src/pages/Perfil.tsx`)

O campo "Regime tributario" na secao "Informacoes Tributarias" (linha 300-310) salva em `profiles.regime` (tabela de perfil do usuario). Isso e separado de `company_profile.regime_tributario`.

Adicionar logica para que ao salvar o perfil, se o valor de regime mudou, tambem atualizar o `company_profile.regime_tributario` da empresa ativa via `updateCompany`. Isso garante sincronizacao bidirecional.

### 4. Invalidacao de queries ao trocar regime

Quando o regime e alterado via `updateCompany`, o `CompanyContext.refetch()` ja e chamado. Adicionalmente, o `RegimeBadgeSelector` invalidara:
- `home-state`
- `dre`
- `tax-score`
- `credits`
- `comparativo-regimes`

Isso faz com que DRE, Score, Radar e Comparativo recarreguem com o novo regime.

## Secao tecnica

### Arquivos novos
- `src/components/company/RegimeBadgeSelector.tsx` - Componente de badge + dropdown + dialog de confirmacao

### Arquivos editados
- `src/components/company/CompanySelector.tsx` - Inserir RegimeBadgeSelector na barra
- `src/pages/Perfil.tsx` - Sincronizar campo regime com company_profile ao salvar

### Mapeamento de valores
O `company_profile.regime_tributario` armazena: `'simples'`, `'presumido'`, `'real'`
O `profiles.regime` armazena: `'SIMPLES'`, `'PRESUMIDO'`, `'REAL'`
O `RegimeBadgeSelector` usara os valores do company_profile (lowercase) e fara a conversao quando necessario.

Labels de exibicao:
- `simples` -> "Simples Nacional"
- `presumido` -> "Lucro Presumido"
- `real` -> "Lucro Real"

### O que NAO muda
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Tabelas do banco (nenhuma migracao necessaria)
- Edge Functions
- Componentes existentes de DRE, Radar, Comparativo (ja leem regime_tributario do company_profile)
