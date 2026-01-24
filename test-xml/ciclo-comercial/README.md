# XMLs de Teste - Ciclo Comercial Completo

## ⚠️ ATENÇÃO
Estes arquivos são **FICTÍCIOS** e destinados **EXCLUSIVAMENTE PARA TESTES** do fluxo Importar XMLs → Radar de Créditos.
**NÃO UTILIZAR EM AMBIENTE DE PRODUÇÃO.**

---

## Empresa de Teste

| Campo | Valor |
|-------|-------|
| **CNPJ** | 12.345.678/0001-90 |
| **Razão Social** | COMERCIO VAREJISTA TESTE LTDA |
| **Nome Fantasia** | LOJA TESTE |
| **IE** | 987654321098 |
| **Endereço** | Av. Paulista, 1000 - Bela Vista - São Paulo/SP |
| **Regime Tributário** | Lucro Real (CRT=3) |

---

## Arquivos e Cenários

### 1. `01-compra-mercadoria.xml`
| Campo | Valor |
|-------|-------|
| **Tipo** | Entrada (compra) |
| **NF-e** | 101 |
| **Data** | 15/01/2025 |
| **Fornecedor** | FORNECEDOR ATACADISTA LTDA (CNPJ 98.765.432/0001-99) |
| **Valor Total** | R$ 27.000,00 |
| **CFOP** | 1102 (Compra para comercialização) |
| **Produtos** | 10 Geladeiras + 15 Fogões |
| **ICMS** | R$ 4.860,00 |
| **PIS** | R$ 445,50 |
| **COFINS** | R$ 2.052,00 |

**Regras de crédito esperadas:**
- `PIS_COFINS_INSUMOS` - Crédito de PIS/COFINS sobre compras para revenda
- `ICMS_COMPRA_REVENDA` - Crédito de ICMS sobre compras

---

### 2. `02-venda-mercadoria.xml`
| Campo | Valor |
|-------|-------|
| **Tipo** | Saída (venda PJ) |
| **NF-e** | 201 |
| **Data** | 18/01/2025 |
| **Cliente** | CLIENTE EMPRESARIAL LTDA (CNPJ 11.222.333/0001-44) |
| **Valor Total** | R$ 12.600,00 |
| **CFOP** | 5102 (Venda de mercadoria) |
| **Produtos** | 3 Geladeiras + 5 Fogões |
| **ICMS** | R$ 2.268,00 |
| **PIS** | R$ 207,90 |
| **COFINS** | R$ 957,60 |

**Regras de crédito esperadas:** Nenhuma (operação de saída)

---

### 3. `03-venda-consumidor-final.xml`
| Campo | Valor |
|-------|-------|
| **Tipo** | Saída (venda varejo) |
| **NF-e** | 301 |
| **Data** | 20/01/2025 |
| **Cliente** | JOAO DA SILVA CONSUMIDOR (CPF 123.456.789-01) |
| **Valor Total** | R$ 2.500,00 |
| **CFOP** | 5102 (Venda a consumidor final) |
| **Produtos** | 1 Geladeira |
| **ICMS** | R$ 450,00 |
| **PIS** | R$ 41,25 |
| **COFINS** | R$ 190,00 |

**Regras de crédito esperadas:** Nenhuma (operação de saída)

---

### 4. `04-devolucao-cliente.xml`
| Campo | Valor |
|-------|-------|
| **Tipo** | Entrada (devolução recebida) |
| **NF-e** | 101 (do cliente) |
| **Data** | 22/01/2025 |
| **Emitente** | CLIENTE EMPRESARIAL LTDA |
| **Ref. NF-e** | 201 de 18/01/2025 |
| **Valor Total** | R$ 2.200,00 |
| **CFOP** | 1411 (Devolução de venda) |
| **Produtos** | 1 Geladeira (defeito) |
| **ICMS** | R$ 396,00 |
| **PIS** | R$ 36,30 |
| **COFINS** | R$ 167,20 |

**Regras de crédito esperadas:**
- `ICMS_DEVOLUCAO` - Estorno de débito de ICMS
- `PIS_COFINS_DEVOLUCAO` - Estorno de débito de PIS/COFINS

---

### 5. `05-devolucao-fornecedor.xml`
| Campo | Valor |
|-------|-------|
| **Tipo** | Saída (devolução emitida) |
| **NF-e** | 401 |
| **Data** | 23/01/2025 |
| **Destinatário** | FORNECEDOR ATACADISTA LTDA |
| **Ref. NF-e** | 101 de 15/01/2025 |
| **Valor Total** | R$ 1.680,00 (inclui IPI) |
| **CFOP** | 5411 (Devolução de compra) |
| **Produtos** | 2 Fogões (avaria no transporte) |
| **ICMS** | R$ 288,00 |
| **PIS** | R$ 26,40 |
| **COFINS** | R$ 121,60 |
| **IPI Devolvido** | R$ 80,00 |

**Regras de crédito esperadas:**
- Estorno do crédito tomado na entrada original

---

## Resumo do Ciclo

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO COMERCIAL                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FORNECEDOR ──[compra]──► EMPRESA ──[venda]──► CLIENTE     │
│       ▲                      │                    │         │
│       │                      │                    │         │
│  [devolução]            [recebe                   │         │
│       │                 devolução]                │         │
│       └──────────────────────┴────────────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Entradas (crédito):                                        │
│  • 01-compra: R$ 27.000 → gera crédito ICMS/PIS/COFINS     │
│  • 04-devolução cliente: R$ 2.200 → estorno débito         │
│                                                             │
│  Saídas (débito):                                           │
│  • 02-venda PJ: R$ 12.600 → gera débito                    │
│  • 03-venda varejo: R$ 2.500 → gera débito                 │
│  • 05-devolução fornecedor: R$ 1.600 → estorno crédito     │
└─────────────────────────────────────────────────────────────┘
```

---

## Como Testar

1. Acesse **Importar XMLs** na plataforma
2. Faça upload dos 5 arquivos XML
3. Aguarde o processamento
4. Acesse **Radar de Créditos** para verificar os créditos identificados
5. Valide se as regras esperadas foram acionadas corretamente
