
# Atualizar sectorQuestionBank.ts com o JSON Completo

## Objetivo

Substituir o conteudo atual de `src/data/sectorQuestionBank.ts` pelo banco de perguntas completo fornecido no JSON, mantendo compatibilidade com o codigo existente em `StepQuestions.tsx`.

## Analise de Compatibilidade

O `StepQuestions.tsx` consome do banco:
- `MACRO_SEGMENTS`, `MACRO_TO_SECTORS`, `OPERATION_TAGS` -- sem mudanca
- `SECTOR_DEFAULT_TAGS` -- atualizar valores para coincidir com o JSON
- `SECTOR_QUESTIONS` -- atualizar textos, ids, e estrutura
- `inferMacroFromSector()` -- sem mudanca

O campo `adds_tag` (string) nao e consumido em nenhum componente frontend atualmente. E seguro migrar para `adds_tags_if_true` (array de strings) sem quebrar nada, desde que a interface seja atualizada.

## Alteracoes

### 1. Atualizar `src/data/sectorQuestionBank.ts`

**Interface `SectorQuestion`:**
- Adicionar `id: string`
- Renomear `adds_tag?: string` para `adds_tags_if_true?: string[]`
- Remover `value_if_true` (nao utilizado no JSON)

**`SECTOR_DEFAULT_TAGS`:** Atualizar para coincidir com o JSON:
- `servicos_profissionais`: `['tem_iss', 'b2b_alto', 'alto_volume_servicos']`
- `tecnologia_saas`: `['tem_iss', 'b2b_alto', 'alto_volume_servicos']`
- `logistica_transporte`: `['tem_iss', 'b2b_alto']`
- `ecommerce`: `['tem_icms', 'b2c_alto', 'alto_volume_nfe']`
- `varejo_fisico`: `['tem_icms', 'b2c_alto']`
- `distribuicao_atacado`: `['tem_icms', 'b2b_alto', 'alto_volume_nfe']`
- `alimentacao_bares_restaurantes`: `['b2c_alto']`
- `construcao_incorporacao`: `['alto_volume_servicos']`
- `saude`: `['tem_iss', 'alto_volume_servicos']`
- `corretagem_seguros`: `['tem_iss', 'alto_volume_servicos']`
- `educacao`: `['tem_iss', 'alto_volume_servicos']`
- `agro`: `['tem_icms']`
- `industria_alimentos_bebidas`: `['tem_icms', 'alto_volume_nfe']`
- `industria_metal_mecanica`: `['tem_icms', 'b2b_alto', 'alto_volume_nfe']`
- `imobiliario`: `['tem_iss']`

**Adicionar `SECTOR_PROBABLE_TAGS`:** Novo export com tags provaveis por setor (para uso futuro no matching).

**`SECTOR_QUESTIONS`:** Substituir todas as perguntas de todos os 15 setores pelos textos exatos do JSON, incluindo `id`, `maps_to`, `adds_tags_if_true`, `type`, e `options`.

**Adicionar `SECTOR_SYNONYMS`:** Novo export com o mapa de sinonimos por setor (para uso futuro em busca/NLP).

**Adicionar `UNIVERSAL_TRIGGERS`:** Novo export com os gatilhos universais (regime review e reforma).

### 2. Ajustar `OPERATION_TAGS` em `sectorQuestionBank.ts`

Adicionar novas tags referenciadas no JSON que nao estao nos toggles atuais:
- `b2c_alto` (B2C Alto)
- `b2b_alto` (B2B Alto) -- ja existe como tag adicionavel, mas nao no toggle
- `alto_volume_servicos` (Alto volume servicos)

Isso garante que tags adicionadas automaticamente por `adds_tags_if_true` sejam visiveis no multi-toggle.

### 3. Nenhuma mudanca necessaria em `StepQuestions.tsx`

O campo `adds_tag`/`adds_tags_if_true` nao e consumido pelo frontend atualmente (verificado via search). A funcao `buildSectorExploratoryFields` usa apenas `key`, `text`, `roi`, `type`, `options` -- todos preservados. Nenhuma alteracao de componente e necessaria.

## Secao Tecnica

### Mapeamento de campos JSON para TypeScript

| JSON | TypeScript atual | TypeScript novo |
|------|-----------------|-----------------|
| `id` | nao existe | `id: string` |
| `text` | `text` | `text` (sem mudanca) |
| `type` | `type` | `type` (sem mudanca) |
| `roi` | `roi` | `roi` (sem mudanca) |
| `maps_to` | `maps_to` | `maps_to` (sem mudanca) |
| `adds_tags_if_true` | `adds_tag` (string) | `adds_tags_if_true` (string[]) |
| `options` (array strings) | `options` (array strings) | `options` (sem mudanca) |
| N/A | `value_if_true` | removido |
| N/A | `key` (gerado) | `key` = `id` do JSON |

### Arquivos modificados

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `src/data/sectorQuestionBank.ts` | Reescrever | Interface, defaults, questions, synonyms, triggers |

Nenhuma migracao de banco, nenhuma mudanca em edge function, nenhuma mudanca em componentes frontend.
