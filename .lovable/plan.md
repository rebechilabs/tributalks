

# Alterar Regime para Simples Nacional e Reprocessar Creditos

## Etapa 1 -- Atualizar o regime nas tabelas do banco

Executar dois UPDATEs no banco de dados:

```sql
UPDATE profiles 
SET regime = 'SIMPLES' 
WHERE user_id = '37307539-3b5a-452e-afdd-201965336fba';

UPDATE company_profile 
SET regime_tributario = 'simples' 
WHERE user_id = '37307539-3b5a-452e-afdd-201965336fba';
```

Dados atuais confirmados:
- `profiles.regime` = `PRESUMIDO` (sera alterado para `SIMPLES`)
- `company_profile.regime_tributario` = `presumido` (sera alterado para `simples`)

A edge function `analyze-credits` ja detecta corretamente o regime usando `normalizedRegime.startsWith('simples')`, entao ambos os valores funcionam.

## Etapa 2 -- Reprocessar creditos

Apos a alteracao do regime, chamar a edge function `analyze-credits` para reprocessar os XMLs ja importados. Isso ativara as regras:

- **SIMPLES_MONO_001** -- PIS/COFINS sobre produtos monofasicos
- **SIMPLES_ICMS_ST_001** -- ICMS sobre receita com ST

E bloqueara automaticamente as 18 regras incompativeis (IPI_001-003, ICMS_001/002/005, PIS_COFINS_001-011, etc).

## Etapa 3 -- Verificar resultados

Conferir os logs da edge function e os valores salvos em `identified_credits` para validar que os totais mudaram conforme esperado (~R$ 5.236 total).

## Detalhes tecnicos

- Tabelas afetadas: `profiles`, `company_profile`
- Edge function: `analyze-credits` (nenhuma alteracao de codigo necessaria)
- Nenhuma migracao de schema necessaria -- apenas UPDATE de dados existentes

