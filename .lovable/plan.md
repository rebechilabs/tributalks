

## Inserção de 7 registros na Knowledge Base + Atualização de status

### O que será feito

**Operação 1 — INSERT de 7 novos registros (todos com status `published`):**

| # | Slug | Prioridade | Tema |
|---|------|-----------|------|
| 1 | `per-dcomp-compensacao` | 9 | PER/DCOMP — Restituição e Compensação |
| 2 | `simples-nacional-faixas-fator-r` | 9 | Simples Nacional — Faixas, Anexos e Fator R |
| 3 | `icms-st-substituicao-tributaria` | 8 | ICMS-ST — Substituição Tributária |
| 4 | `regimes-monofasicos-pis-cofins` | 7 | PIS/COFINS Monofásico |
| 5 | `irpj-csll-lucro-presumido` | 8 | IRPJ e CSLL no Lucro Presumido |
| 6 | `beneficios-fiscais-estaduais` | 6 | Benefícios Fiscais Estaduais |
| 7 | `ibs-cbs-nao-cumulatividade` | 10 | IBS/CBS — Não-Cumulatividade Plena |

Todos na categoria `legislacao`, com `trigger_keywords`, `must_say` e `must_not_say` preenchidos conforme especificado.

**Operacao 2 — UPDATE dos 9 registros com status `active` para `published`:**

Isso corrige o problema identificado anteriormente onde 9 registros estavam invisíveis para o RAG/busca semântica.

### Resultado esperado

- De 15 registros totais (6 published + 9 active) para **22 registros, todos published**
- Nenhum registro existente será alterado em conteúdo — apenas o campo `status` dos 9 ativos

### Detalhes técnicos

- Execução via SQL direto usando a ferramenta de migração de dados do backend
- Os 7 novos registros já entram como `published` (sem necessidade de atualização posterior)
- O UPDATE afeta apenas registros com `status = 'active'`, sem tocar nos já `published`
- Nenhuma alteração de schema — apenas dados

