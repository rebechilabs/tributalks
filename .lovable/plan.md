

# Corrigir Parsing do PGDAS para Extrair Todos os Valores

## Problema

A edge function `process-pgdas` falha ao extrair **receita bruta** e **valor devido** porque os regex não correspondem ao formato real do arquivo:

| Campo | Regex atual espera | Arquivo real contém |
|-------|-------------------|---------------------|
| Receita | `Receita Bruta:` (seguido direto do valor) | `RECEITA BRUTA TOTAL NO MES: R$ 200,000.00` |
| Valor DAS | `Valor do DAS:` | `VALOR TOTAL DO DAS: R$ 19,520.00` |

Alem disso, o parser de numeros assume formato BR (200.000,00) mas o arquivo usa formato misto (200,000.00), causando conversao incorreta.

## Solucao

Atualizar a funcao `parsePgdasContent` na edge function com:

1. **Regex mais flexiveis** que capturem variacoes do formato PGDAS
2. **Parser de numeros inteligente** que detecte automaticamente formato BR vs US
3. **Novos campos extraidos**: RBT12, reparticao de tributos (IRPJ, CSLL, COFINS, PIS, CPP, ICMS), receitas monofasicas e com ST

## Detalhes Tecnicos

**Arquivo:** `supabase/functions/process-pgdas/index.ts`

### Mudancas no parsing:

**Receita Bruta** - novo regex:
```
/RECEITA\s+BRUTA[\s\w]*?:\s*R?\$?\s*([\d.,]+)/i
```
Captura "RECEITA BRUTA TOTAL NO MES:", "Receita Bruta:", etc.

**Valor do DAS** - novo regex:
```
/VALOR\s+(?:TOTAL\s+)?(?:DO\s+)?DAS[:\s]*R?\$?\s*([\d.,]+)/i
```
Captura "VALOR TOTAL DO DAS:", "Valor do DAS:", etc.

**Parser de numeros** - nova funcao auxiliar:
```typescript
function parseMoneyValue(raw: string): number {
  // Detecta formato: se tem virgula antes do ponto = US (200,000.00)
  // Se tem ponto antes da virgula = BR (200.000,00)
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  
  if (lastComma > lastDot) {
    // BR format: 200.000,00
    return parseFloat(raw.replace(/\./g, "").replace(",", "."));
  } else {
    // US format: 200,000.00
    return parseFloat(raw.replace(/,/g, ""));
  }
}
```

**Campos adicionais extraidos:**
- RBT12 (Receita Bruta Acumulada)
- Faixa do Simples
- Aliquota nominal
- Reparticao de tributos (IRPJ, CSLL, COFINS, PIS, CPP, ICMS)
- Receita monofasica e com ST

Estes campos adicionais serao salvos no campo `dados_completos` (jsonb) da tabela para uso futuro no Radar de Creditos.

### Migracao de banco

Adicionar coluna `dados_completos` (jsonb) na tabela `pgdas_arquivos` para armazenar todos os dados extraidos sem precisar alterar o schema sempre que um novo campo for necessario.

