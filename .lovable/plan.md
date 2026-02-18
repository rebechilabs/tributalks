

# Corrigir Fonte de Dados do Split Payment

## Problema
O formulario usa dados da tabela `profiles` (perfil pessoal) em vez da `company_profile` (empresa selecionada). Ao trocar de empresa, os dados nao atualizam.

## Descoberta importante durante a analise
A tabela `company_profile` tem campos diferentes de `profiles`:
- `faturamento_anual` (nao `faturamento_mensal`) -- sera dividido por 12
- `regime_tributario` (nao `regime`)
- `razao_social` (nao `empresa`)
- **Nao tem** `percentual_vendas_pj` -- fallback para `profiles` sempre

## Mudancas (arquivo unico: `src/pages/calculadora/SplitPayment.tsx`)

### 1. Adicionar import do useEffect
Adicionar `useEffect` ao import do React (linha 1).

### 2. Alterar inicializacao do formData (linhas 80-86)
Priorizar `currentCompany`, com fallback para `profile`:

```typescript
const faturamentoMensalInicial = currentCompany?.faturamento_anual
  ? (currentCompany.faturamento_anual / 12).toString()
  : profile?.faturamento_mensal?.toString() || "";

const [formData, setFormData] = useState({
  empresa: currentCompany?.razao_social || profile?.empresa || "",
  faturamento_mensal: faturamentoMensalInicial,
  regime: currentCompany?.regime_tributario || profile?.regime || "",
  setor: currentCompany?.setor || profile?.setor || "",
  percentual_vendas_pj: profile?.percentual_vendas_pj?.toString() || "0.80",
});
```

### 3. Adicionar useEffect para reagir a troca de empresa
Logo apos a declaracao do `formData`, inserir:

```typescript
useEffect(() => {
  if (currentCompany) {
    setFormData(prev => ({
      ...prev,
      empresa: currentCompany.razao_social || prev.empresa,
      faturamento_mensal: currentCompany.faturamento_anual
        ? (currentCompany.faturamento_anual / 12).toString()
        : prev.faturamento_mensal,
      regime: currentCompany.regime_tributario || prev.regime,
      setor: currentCompany.setor || prev.setor,
    }));
    setResult(null);
    setSaved(false);
  }
}, [currentCompany?.id]);
```

Nota: `percentual_vendas_pj` nao e atualizado no useEffect porque esse campo nao existe na `company_profile` -- mantem o valor do `profiles`.

### O que NAO muda
- Logica de calculo (`calcularSplitPayment`)
- Layout / componentes visuais
- Fluxo de save da simulacao
- Nenhum outro arquivo

## Mapeamento de campos

| formData field | company_profile | profiles (fallback) |
|---|---|---|
| empresa | razao_social | empresa |
| faturamento_mensal | faturamento_anual / 12 | faturamento_mensal |
| regime | regime_tributario | regime |
| setor | setor | setor |
| percentual_vendas_pj | (nao existe) | percentual_vendas_pj |

