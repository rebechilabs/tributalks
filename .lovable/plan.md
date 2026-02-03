
# Plano: Identificação de Produtos Monofásicos no Radar XML

## Objetivo
Aprimorar o sistema para identificar corretamente produtos monofásicos nos XMLs importados e alertar quando a empresa está pagando PIS/COFINS indevidamente em produtos onde o imposto já foi recolhido na indústria.

---

## Contexto do Problema

Produtos monofásicos são aqueles onde PIS/COFINS já foi recolhido na primeira etapa da cadeia (indústria/importação). Na revenda, esses produtos devem usar:
- **CST PIS/COFINS 04** = Operação tributável monofásica - revenda a alíquota zero
- **pPIS/pCOFINS = 0.00** e **vPIS/vCOFINS = 0.00**

O problema ocorre quando empresas revendem produtos monofásicos com CST incorreto ou com valores de PIS/COFINS sendo cobrados.

### NCMs Monofásicos Cobertos

| Categoria | NCMs | Base Legal |
|-----------|------|------------|
| Combustíveis | 2710, 2207 | Lei 11.116/2005 |
| Medicamentos | 3003, 3004 | Lei 10.147/2000 |
| Cosméticos | 3303, 3304, 3305 | Lei 10.147/2000 |
| Bebidas Frias | 2201, 2202, 2203, 2204 | Lei 13.097/2015 |
| Autopeças | 8708, 4011 | Lei 10.485/2002 |

---

## Alterações Necessárias

### 1. Edge Function `analyze-credits/index.ts`

**Arquivo:** `supabase/functions/analyze-credits/index.ts`

#### 1.1. Expandir Lista de NCMs Monofásicos
Adicionar mais NCMs à função `isMonophasicNCM()`:
- 8708 (autopeças)
- 4011 (pneus)
- 8507 (baterias)

#### 1.2. Nova Função de Detecção de CST Monofásico
```text
Criar função isMonophasicCST() que verifica se CST indica tributação monofásica:
- CST 04 = Tributação monofásica - revenda a alíquota zero
- CST 05 = Tributação monofásica - revenda sujeita à substituição
- CST 06 = Tributação monofásica - alíquota zero
```

#### 1.3. Atualizar Regra PIS_COFINS_008
Modificar para detectar quando:
- NCM é monofásico
- Operação é de saída (CFOP 5xxx ou 6xxx)
- CST PIS/COFINS NÃO é 04/05/06 **OU** vPIS > 0

Isso indica que a empresa pode estar pagando PIS/COFINS indevidamente.

#### 1.4. Adicionar Regra para Autopeças (PIS_COFINS_010)
Nova regra específica para NCM 8708/4011 (autopeças/pneus).

---

### 2. Banco de Dados - Novas Regras de Crédito

Inserir novas regras na tabela `credit_rules`:

| rule_code | rule_name | NCMs | Descrição |
|-----------|-----------|------|-----------|
| PIS_COFINS_010 | Autopeças - tributação monofásica | 8708, 4011 | Autopeças e pneus com tributação concentrada |
| PIS_COFINS_011 | Cosméticos - tributação monofásica | 3303, 3304, 3305 | Cosméticos com tributação na indústria |

---

### 3. Componente de Alertas - Front-end

**Arquivo:** `src/components/credits/MonophasicAlert.tsx` (novo)

Criar componente que exibe alertas específicos para produtos monofásicos identificados:
- Card com destaque visual (cor diferenciada)
- Lista de NCMs monofásicos encontrados
- Valor estimado de PIS/COFINS pago indevidamente
- Link para base legal

---

### 4. Integração no CreditRadar

**Arquivo:** `src/components/credits/CreditRadar.tsx`

- Adicionar seção específica "Produtos Monofásicos" no topo
- Mostrar contagem de produtos monofásicos identificados
- Filtro específico para regras de monofásicos

---

### 5. Processamento XML Batch

**Arquivo:** `supabase/functions/process-xml-batch/index.ts`

Adicionar campo `is_monophasic` no resultado do parsing para marcar itens com NCM monofásico durante o processamento inicial.

---

## Detalhes Técnicos

### Lógica de Identificação Aprimorada

```text
Para cada item do XML:
1. Verificar se NCM está na lista de monofásicos
2. Se SIM e operação é SAÍDA (CFOP 5xxx/6xxx):
   a. Se CST PIS = 04/05/06 E vPIS = 0 → Correto (não gera alerta)
   b. Se CST PIS ≠ 04/05/06 OU vPIS > 0 → Potencial pagamento indevido
      - Gerar crédito identificado com:
        - potential_recovery = vPIS + vCOFINS
        - confidence_level = 'high'
        - confidence_score = 92
```

### CSTs de PIS/COFINS Relevantes

| CST | Descrição | Gera Crédito? |
|-----|-----------|---------------|
| 01 | Tributação Normal | Sim, se NCM monofásico |
| 02 | Tributação Diferenciada | Sim, se NCM monofásico |
| 04 | Monofásico - Alíquota Zero | Não (correto) |
| 05 | Monofásico - Substituição | Não (correto) |
| 06 | Alíquota Zero | Depende do contexto |

---

## Resumo de Arquivos a Modificar

| Arquivo | Tipo de Alteração |
|---------|------------------|
| `supabase/functions/analyze-credits/index.ts` | Expandir lógica de detecção |
| `supabase/functions/process-xml-batch/index.ts` | Adicionar flag monofásico |
| `src/components/credits/MonophasicAlert.tsx` | Novo componente |
| `src/components/credits/CreditRadar.tsx` | Integrar alertas |
| Migração SQL | Adicionar novas regras |

---

## Resultado Esperado

Após implementação:
1. XMLs com produtos monofásicos serão identificados automaticamente
2. Alertas serão exibidos quando houver pagamento indevido de PIS/COFINS
3. Potencial de recuperação será calculado com alta confiança (92%)
4. Usuário verá seção dedicada "Monofásicos" no Radar de Créditos
