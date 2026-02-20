
# Inserir oportunidade "ISS Fixo para Sociedades Uniprofissionais (Regime SUP)"

## O que sera feito

Inserir um novo registro na tabela `tax_opportunities` com todos os dados fornecidos, configurado para aparecer corretamente no Motor Diagnostico apenas para empresas de servicos no Lucro Presumido ou Lucro Real.

## Como o motor de matching funciona

O motor (`match-opportunities`) avalia cada oportunidade usando tres campos JSONB:
- **criterios**: criterios obrigatorios basicos (todos devem ser atendidos)
- **criterios_obrigatorios**: criterios mandatorios adicionais
- **criterios_pontuacao**: criterios opcionais que aumentam o score

Para excluir Simples Nacional e filtrar apenas servicos, usaremos `criterios` com:
- `regime_tributario_in: ["lucro_presumido", "lucro_real"]` -- exclui Simples
- `segmento: "servicos"` -- apenas empresas de servicos

## Detalhes tecnicos

### Dados do INSERT

| Campo | Valor |
|---|---|
| code | `ISS_SUP_001` |
| name | ISS Fixo para Sociedades Uniprofissionais (Regime SUP) |
| name_simples | ISS fixo por socio em vez de percentual sobre faturamento |
| category | `planejamento` |
| subcategory | `iss_municipal` |
| tipo_tributo | `ISS` |
| tributos_afetados | `{ISS}` |
| economia_percentual_min | 60 |
| economia_percentual_max | 90 |
| economia_base | `servicos` |
| economia_descricao_simples | Economia de 60% a 90% no ISS ao pagar valor fixo por socio |
| complexidade | `baixa` |
| tempo_implementacao | 2-8 semanas |
| tempo_retorno | Imediato apos enquadramento |
| risco_fiscal | `nenhum` |
| risco_descricao | Direito garantido por norma federal (DL 406/68) e jurisprudencia consolidada (STJ Tema 1.323, STF Tema 918) |
| base_legal | Decreto-Lei 406/1968, art. 9, paragrafos 1 e 3; Sumula 663 STF; RE 940.769 / Tema 918 STF; REsp 2.162.487 e 2.162.486 / Tema 1.323 STJ (2025); LC 116/2003 |
| base_legal_resumo | DL 406/68 garante ISS fixo por profissional para sociedades uniprofissionais |
| requer_contador | true |
| requer_advogado | true (pode ser necessario mandado de seguranca) |
| destaque | true |
| novo | true |

### Criterios de matching (campo `criterios`)

```json
{
  "regime_tributario_in": ["lucro_presumido", "lucro_real"],
  "segmento": "servicos",
  "vende_servicos": true
}
```

Isso garante que:
- Simples Nacional e excluido (so LP e LR)
- Apenas empresas do macro-segmento servicos sao elegives
- A empresa precisa vender servicos

### Criterios de pontuacao (campo `criterios_pontuacao`)

```json
{
  "setor_in": ["servicos_profissionais", "saude", "educacao", "corretagem_seguros"],
  "engine_overrides": {
    "priority_boost": [
      {
        "when": { "field": "setor", "op": "in", "value": ["servicos_profissionais", "saude"] },
        "match_score_boost": 15,
        "impact_label": "alto_impacto",
        "urgency": "revisar_agora"
      }
    ],
    "warnings": ["STJ consolidou em 2025: Ltda. nao impede enquadramento no regime SUP"]
  }
}
```

### Campos descritivos completos

- **description**: A descricao resumida fornecida
- **description_ceo**: Versao executiva para o card
- **exemplo_pratico**: O exemplo dos 10 medicos com R$ 3M de faturamento
- **faq**: Perguntas frequentes sobre elegibilidade e procedimento

### Passo a passo

1. Executar um INSERT na tabela `tax_opportunities` com todos os campos acima
2. Nenhuma alteracao de schema e necessaria -- a tabela ja tem todas as colunas
3. Nenhuma alteracao no codigo e necessaria -- o motor de matching ja processa os criterios automaticamente
