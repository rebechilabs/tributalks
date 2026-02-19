
# Perguntas Exploratórias Inteligentes: Sócios + Ramificação Condicional

## Resumo

Adicionar 2 perguntas sobre sócios (quantos e se possuem outras empresas) e implementar **ramificacao condicional**: dependendo das respostas, a Clara faz perguntas adicionais que aproximam o usuario de oportunidades tributarias especificas (holding, distribuicao de lucros, planejamento societario).

## Novas Perguntas

### Perguntas Base (sempre aparecem)

**1. Quantos socios?** (grid)
Clara: "Quantos socios a empresa possui?"
Opcoes: 1 (so eu) | 2 | 3 | 4 ou mais

**2. Socios com outras empresas?** (grid)
Clara: "Algum dos socios possui participacao em outras empresas?"
Opcoes: Sim | Nao | Nao sei

### Perguntas Condicionais (aparecem conforme respostas)

**Se num_socios >= 2 E socios_outras_empresas = "sim":**

**3. Tem holding?** (grid)
Clara: "Os socios ja possuem uma holding para organizar as participacoes?"
Opcoes: Sim | Nao | Nao sei o que e isso

> Isso abre oportunidade de "Planejamento Societario via Holding" e "Distribuicao Otimizada de Lucros"

**Se num_socios >= 2:**

**4. Como distribuem os lucros?** (grid)
Clara: "Como a empresa distribui os lucros entre os socios hoje?"
Opcoes: Pro-labore fixo | Dividendos periodicos | Mistura dos dois | Nao distribuimos ainda

> Isso abre oportunidade de "Otimizacao Pro-labore vs Dividendos"

## Logica de Ramificacao

A ideia e transformar o `StepQuestions` para suportar perguntas condicionais. Cada pergunta pode ter um campo `condition` que e uma funcao avaliada contra as respostas ja dadas. Se a condicao retorna `true`, a pergunta aparece; se `false`, ela e pulada.

```text
Fluxo:
  num_socios -> socios_outras_empresas
                  |
                  v
          [socios = "sim" E num >= 2?]
            SIM -> tem_holding
            NAO -> pula
                  |
                  v
          [num >= 2?]
            SIM -> distribuicao_lucros
            NAO -> pula
                  |
                  v
          ... continua com desafio_principal, etc.
```

## O que muda

### 1. Migracao: 4 novas colunas

```sql
ALTER TABLE company_profile
  ADD COLUMN IF NOT EXISTS num_socios text,
  ADD COLUMN IF NOT EXISTS socios_outras_empresas text,
  ADD COLUMN IF NOT EXISTS distribuicao_lucros text;
```

Nota: `tem_holding` ja existe na tabela, nao precisa criar.

### 2. StepQuestions.tsx - Perguntas condicionais

Alterar a interface `QuestionField` para incluir um campo opcional `condition`:

```text
interface QuestionField {
  key: string;
  label: string;
  claraText: string;
  type: 'grid' | 'currency' | 'uf' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  condition?: (answers: Record<string, string | number>) => boolean;
}
```

As novas perguntas:

| Pergunta | Posicao | Condicao |
|----------|---------|----------|
| num_socios | Apos uf_sede | Sempre |
| socios_outras_empresas | Apos num_socios | Sempre |
| tem_holding | Apos socios_outras_empresas | num_socios != "1" E socios_outras_empresas = "sim" |
| distribuicao_lucros | Apos tem_holding | num_socios != "1" |

### 3. StepQuestions.tsx - Filtro dinamico

Hoje o componente filtra perguntas assim:
```text
const questions = REQUIRED_FIELDS.filter(f => missingFields.includes(f.key));
```

Precisa mudar para tambem avaliar `condition` dinamicamente conforme o usuario responde. A lista de perguntas sera recalculada a cada resposta para incluir/excluir condicionais.

### 4. PlanejarFlow.tsx

Adicionar `num_socios`, `socios_outras_empresas` e `distribuicao_lucros` ao array `QUALITATIVE_KEYS`.

### 5. match-opportunities (nenhuma mudanca agora)

As novas colunas (`num_socios`, `socios_outras_empresas`, `tem_holding`, `distribuicao_lucros`) ja podem ser usadas pela Edge Function no futuro para scoring de oportunidades como "Holding Familiar" e "Otimizacao de Pro-labore". Nao precisa alterar a Edge Function agora -- os dados sao capturados e ficam disponiveis.

## Detalhes Tecnicos

### Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/planejar/StepQuestions.tsx` | Adicionar campo `condition` na interface, 4 novas perguntas, logica de filtragem dinamica |
| `src/components/planejar/PlanejarFlow.tsx` | Adicionar 3 novas chaves ao QUALITATIVE_KEYS |
| Migracao SQL | 3 novas colunas (num_socios, socios_outras_empresas, distribuicao_lucros) |

### Logica de filtragem dinamica no StepQuestions

O componente precisa recalcular a lista de perguntas visiveis a cada resposta. A abordagem:

1. Filtrar perguntas que estao em `missingFields`
2. Dentro dessas, remover as que tem `condition` retornando `false` baseado nas respostas ate o momento
3. A pergunta atual e sempre `questions[currentIdx]` da lista filtrada
4. Ao responder, recalcular a lista -- se a proxima pergunta condicional agora ficou visivel, ela aparece; se ficou invisivel, pula

### Mapeamento para oportunidades

As respostas alimentam o perfil e no futuro a Edge Function pode usar:
- `num_socios >= 2` + `socios_outras_empresas = sim` + `tem_holding = nao` --> Oportunidade: "Constituicao de Holding Patrimonial"
- `num_socios >= 2` + `distribuicao_lucros = pro_labore` --> Oportunidade: "Otimizacao Pro-labore vs Dividendos"
- `tem_holding = sim` --> Oportunidade: "Revisao de Estrutura Societaria"
