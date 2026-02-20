

# Manter Resultado do DRE Calculado

## Resumo

Quando o usuario acessa a pagina do DRE (`/dashboard/entender/dre`), atualmente sempre aparece o formulario (wizard). A mudanca fara com que, se ja existir um DRE calculado, a pagina mostre os **resultados** (DREDashboard) ao inves do formulario. O formulario so aparecera se o usuario clicar em "Atualizar DRE" ou se nao houver nenhum DRE calculado.

## Como vai funcionar

1. Usuario acessa a pagina do DRE
2. Sistema verifica se ja existe um registro na tabela `company_dre`
3. **Se existir**: mostra o DREDashboard (resultados) com botao "Atualizar DRE" que leva ao wizard
4. **Se nao existir**: mostra o DREWizard normalmente

## Mudancas

### 1. `src/pages/DRE.tsx`
- Adicionar verificacao se ja existe DRE calculado (consulta a tabela `company_dre`)
- Se existir, mostrar `DREDashboard` ao inves de `DREWizard`
- Adicionar estado local para permitir alternar para o wizard quando o usuario quiser editar
- Botao "Atualizar DRE" (ja existe no DREDashboard) continuara levando ao formulario

### 2. `src/components/dre/DREDashboard.tsx`
- Adicionar prop opcional `onEdit` que, ao clicar em "Atualizar DRE", chama o callback ao inves de navegar
- Isso permite que a pagina DRE alterne entre dashboard e wizard sem trocar de rota

### 3. `src/components/dre/DREWizard.tsx`
- Adicionar prop opcional `onBack` para permitir voltar ao dashboard sem recarregar a pagina

## O que NAO muda

- A rota `/dashboard/dre-resultados` continua funcionando normalmente
- Nenhuma logica de calculo e alterada
- Os dados continuam sendo salvos e lidos da mesma tabela `company_dre`
- O NextStepCta adicionado anteriormente permanece

## Secao Tecnica

O fluxo na pagina `DRE.tsx` ficara assim:

```text
DRE.tsx
  |
  |--> useEffect: busca company_dre do usuario
  |
  |--> hasDRE = true?
  |      |-- SIM --> DREDashboard (com onEdit={() => setShowWizard(true)})
  |      |-- NAO --> DREWizard (com onComplete={() => refetch + setShowWizard(false)})
  |
  |--> showWizard = true?
         |-- SIM --> DREWizard (com onBack={() => setShowWizard(false)})
```

A consulta sera simples: `SELECT id FROM company_dre WHERE user_id = ? LIMIT 1`, reutilizando o hook `useAuth` ja existente para obter o usuario.
