

# Revisao Completa do Radar de Creditos para Simples Nacional

## Diagnostico

Apos analisar o codigo da edge function `analyze-credits/index.ts`, identifiquei a causa raiz de todos os 5 problemas reportados:

**O motor de creditos NAO consulta o regime tributario do usuario.** Ele aplica todas as 24 regras indiscriminadamente, como se toda empresa fosse Lucro Real/Presumido. Para Simples Nacional, a logica de recuperacao e fundamentalmente diferente.

---

## Problemas e Correcoes

### 1. IPI de R$ 658,46 -- Falso Positivo (Prioridade Alta)

**Causa:** A regra `IPI_001` identifica credito de IPI em qualquer compra de insumos com IPI destacado (`isPurchaseOfInputs(cfop) && valorIpi > 0`). Nao verifica se a empresa e industrial nem se esta no Simples Nacional.

**Correcao:** Quando `regime = 'simples_nacional'` e CNAE indica comercio (47xx), desativar completamente as regras IPI_001, IPI_002 e IPI_003.

### 2. ICMS de R$ 14.241,84 -- Calculo Incorreto (Prioridade Alta)

**Causa:** A regra `ICMS_001` identifica credito para qualquer compra interestadual (CFOP 2xxx) com ICMS destacado e sem credito escriturado. No Simples Nacional, o ICMS e pago de forma unificada no DAS -- nao existe "credito de ICMS de entrada".

**Correcao:** Desativar regras ICMS_001, ICMS_002 e ICMS_005 para Simples Nacional. A unica oportunidade de ICMS no Simples e a **segregacao de receitas com ST** (produtos com CSOSN 500 / CFOP 5405), onde a empresa pagou ICMS-ST antecipado e nao deveria pagar ICMS novamente no DAS sobre essas receitas.

**Nova logica para Simples Nacional:** Criar regra `SIMPLES_ICMS_ST_001` que calcula:
- Receita de produtos com ST (CSOSN 500)
- Parcela de ICMS no DAS (ex: 34% da aliquota efetiva no Anexo I, 4a faixa)
- Credito = Receita ST x Aliquota efetiva x Parcela ICMS

### 3. ICMS-ST de R$ 359,38 -- Esclarecimento

**Causa:** A regra `ICMS_ST_001` pega qualquer item com `valorIcmsSt > 0` e aplica 15% como potencial de recuperacao (comparacao MVA vs preco real). Isso e uma logica de Lucro Presumido/Real.

**Correcao:** Para Simples Nacional, o conceito de "ressarcimento de ICMS-ST por MVA" nao se aplica da mesma forma. O campo ICMS-ST no Radar do Simples deveria representar apenas o valor de ICMS-ST destacado nas notas de entrada (informativo), enquanto a oportunidade real esta na segregacao de receitas (item 2 acima).

### 4. PIS/COFINS de R$ 12.991,39 -- Calculo Incorreto (Prioridade Alta)

**Causa:** As regras `PIS_COFINS_008`, `PIS_COFINS_010` e `PIS_COFINS_011` calculam o credito usando o `valorPis + valorCofins` diretamente dos XMLs. Isso funciona para Lucro Real (regime nao-cumulativo), mas no Simples Nacional:
- PIS/COFINS e pago dentro do DAS, nao ha destaque individual
- A recuperacao e feita via **segregacao de receitas** no PGDAS-D
- O calculo correto e: `Receita Monofasica x Aliquota Efetiva DAS x Parcela PIS+COFINS no DAS`

**Nova logica para Simples Nacional:** Criar regra `SIMPLES_MONO_001` que:
1. Identifica receitas de saida com NCMs monofasicos
2. Busca dados do PGDAS (aliquota efetiva, parcela PIS+COFINS)
3. Calcula: `Receita Monofasica x Aliquota Efetiva x (% PIS + % COFINS no DAS)`

Com os dados do teste: R$ 303.812 x 9,76% x 15,50% = ~R$ 4.596

### 5. Detalhamento na Interface (Prioridade Media)

**Causa:** O componente `CreditRadar.tsx` mostra apenas totais agregados. Os dados por NCM, mes e base legal ja existem na tabela `identified_credits`, mas nao sao exibidos de forma detalhada.

**Correcao:** Adicionar secoes de detalhamento ao Radar:
- Detalhamento mes a mes
- NCMs que geraram cada credito
- Base legal por oportunidade
- Orientacao pratica (retificacao PGDAS, PER/DCOMP)
- Prazo prescricional de 5 anos

---

## Detalhes Tecnicos

### Arquivo: `supabase/functions/analyze-credits/index.ts`

**Mudanca principal:** No inicio da funcao `serve`, buscar o perfil do usuario para obter `regime`, `cnae` e dados do PGDAS:

```text
1. Buscar profile do usuario (regime, cnae, setor)
2. Buscar dados do PGDAS mais recente (aliquota_efetiva, dados_completos)
3. Passar essas informacoes para evaluateRule()
4. Adicionar parametro "regime" a evaluateRule
```

**Nova funcao `evaluateRuleSimplesNacional()`:**
- Desativa regras: IPI_001/002/003, ICMS_001/002/005, PIS_COFINS_001/002/003/004/005/006/007
- Ativa novas regras especificas:
  - `SIMPLES_MONO_001`: PIS/COFINS monofasico via segregacao
  - `SIMPLES_ICMS_ST_001`: ICMS sobre receitas ST indevido no DAS
- Usa dados do PGDAS para aliquota efetiva e reparticao de tributos

**Nova funcao auxiliar `getSimplesTaxDistribution()`:**

```text
Recebe: faixa do Simples, anexo
Retorna: { irpj, csll, cofins, pis, cpp, icms } (percentuais)

Exemplo Anexo I, 4a Faixa:
  IRPJ: 5.50%, CSLL: 3.50%, COFINS: 12.74%
  PIS: 2.76%, CPP: 41.50%, ICMS: 34.00%
```

### Migracao de Banco

Adicionar novas regras na tabela `credit_rules`:

```text
SIMPLES_MONO_001 - Segregacao de receita monofasica PIS/COFINS no Simples
SIMPLES_ICMS_ST_001 - ICMS pago indevidamente no DAS sobre receita com ST
```

### Arquivo: `src/components/credits/CreditRadar.tsx`

Adicionar nova secao de detalhamento com:
- Tabela expandivel por mes
- Coluna de NCM e base legal
- Card de "Como Recuperar" com passos praticos
- Indicacao de prazo prescricional

### Arquivo: `src/components/credits/CreditRadarMetrics.tsx`

Ajustar para mostrar subtotais por tipo de oportunidade:
- Segregacao de receitas monofasicas
- Segregacao de receitas com ST
- Orientacao sobre retificacao do PGDAS-D

---

## Sequencia de Implementacao

1. Criar migracao com novas regras `SIMPLES_MONO_001` e `SIMPLES_ICMS_ST_001`
2. Atualizar `analyze-credits/index.ts` com verificacao de regime e novas regras
3. Atualizar componentes do Radar para exibir detalhamento
4. Testar com os mesmos dados do cenario controlado

