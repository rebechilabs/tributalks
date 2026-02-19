
# Alinhar Planejar com "Versao Final" -- Gaps Restantes

## Diagnostico

O fluxo esta 90% implementado. Restam 3 gaps concretos entre o estado atual e a especificacao final.

## Gap 1 -- economia_percentual_min/max nao chega ao frontend

A tabela `tax_opportunities` tem os campos `economia_percentual_min` e `economia_percentual_max`. O `OpportunityData` no frontend tambem tem esses campos tipados. Porem, a Edge Function `match-opportunities` nao inclui esses valores na resposta (linhas 893-924). O resultado: o card sempre cai no fallback "Impacto Alto/Medio/Baixo" em vez de mostrar a faixa percentual.

**Correcao**: Adicionar `economia_percentual_min` e `economia_percentual_max` ao payload de resposta da Edge Function, lendo de `m.opportunity.economia_percentual_min` e `m.opportunity.economia_percentual_max`.

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/match-opportunities/index.ts` | Adicionar 2 campos ao objeto de resposta (linhas ~893-924) |

## Gap 2 -- Botoes interativos no fallback de zero resultados

O spec pede que quando nenhuma oportunidade for encontrada apos retry, a Clara exiba a mensagem de governanca com dois botoes: "Sim, seguir" e "Refinar com mais perguntas". Hoje o `StepResults` mostra apenas o texto sem opcoes interativas.

**Correcao**: Adicionar dois botoes ao `StepResults` quando `isFallback === true`:
- "Sim, seguir" -- mantém as oportunidades fallback visiveis (estado atual)
- "Refinar com mais perguntas" -- navega de volta ao step de perguntas (callback pro PlanejarFlow)

Isso requer:
- `StepResults` receber um novo prop `onRefine?: () => void`
- `PlanejarFlow` passar uma funcao que volta para `step = 'questions'` resetando o fluxo

| Arquivo | Alteracao |
|---------|-----------|
| `StepResults.tsx` | Adicionar botoes "Sim, seguir" / "Refinar com mais perguntas" quando fallback |
| `PlanejarFlow.tsx` | Passar prop `onRefine` ao StepResults |

## Gap 3 -- Explainability payload estruturado

O spec descreve um payload `explainability` com `matched_rules`, `why_it_matters` e `missing_data`. A Edge Function ja retorna `match_reasons` (array de strings) e `missing_criteria` (array de strings), que sao equivalentes funcionais. O Dossie Tributario ja consome `match_reasons` na aba "Visao Geral".

A diferenca e que `matched_rules` deveria ter pares `{field, expected, actual}` para gerar textos personalizados como "regime_atual = simples (match)". Isso exigiria refatorar a funcao `evaluateOpportunity` na Edge Function para retornar objetos estruturados em vez de strings.

**Recomendacao**: Manter como esta para este ciclo. Os `match_reasons` ja geram texto util no Dossie. A estrutura `matched_rules` pode ser adicionada em fase 2 sem impacto no frontend (o componente ja tem fallback para strings simples).

## Resumo de alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `supabase/functions/match-opportunities/index.ts` | Edge Function | Adicionar economia_percentual_min/max ao payload de resposta |
| `src/components/planejar/StepResults.tsx` | Frontend | Botoes interativos no fallback (Sim/Refinar) |
| `src/components/planejar/PlanejarFlow.tsx` | Frontend | Prop onRefine para voltar ao step de perguntas |

Nenhuma migracao de banco necessaria. Nenhum componente novo.
