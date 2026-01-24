# XMLs de Teste - Radar de Créditos Tributech

⚠️ **ATENÇÃO: ARQUIVOS FICTÍCIOS PARA HOMOLOGAÇÃO**

Estes arquivos XML são **exclusivamente para testes internos** do fluxo:
- Importar XMLs → Radar de Créditos Recuperáveis

**NÃO USE EM PRODUÇÃO** - CNPJs, endereços e valores são fictícios.

---

## Cenários de Teste

| Arquivo | Cenário | Regras que deve acionar |
|---------|---------|-------------------------|
| `01-venda-mercadoria-frete.xml` | Venda de mercadorias com frete destacado | `PIS_COFINS_FRETE`, `ICMS_FRETE_CIF` |
| `02-energia-eletrica-industrial.xml` | NF de energia elétrica para industrialização | `ICMS_ENERGIA_INDUSTRIAL`, `PIS_COFINS_ENERGIA` |
| `03-produto-monofasico.xml` | Venda de produtos monofásicos (medicamentos) | `PIS_COFINS_MONOFASICO`, `PIS_COFINS_ALIQUOTA_ZERO` |
| `04-servico-iss-retencao.xml` | NF de serviço com ISS retido | `ISS_RETIDO_DUPLICIDADE`, `ISS_LOCAL_PRESTACAO` |
| `05-ativo-imobilizado-difal.xml` | Ativo imobilizado interestadual com DIFAL | `ICMS_DIFAL_ATIVO`, `ICMS_CIAP_48`, `PIS_COFINS_ATIVO` |

---

## Estrutura dos XMLs

Todos seguem a estrutura NF-e 4.0 com os campos relevantes para o Radar:
- `CFOP` - Código Fiscal de Operações e Prestações
- `NCM` - Nomenclatura Comum do Mercosul
- `CST` - Código de Situação Tributária
- `vProd` - Valor do produto
- `vFrete` - Valor do frete
- `vICMS` - Valor do ICMS
- `vPIS` / `vCOFINS` - Valores de PIS e COFINS
- Campos específicos para energia, telecom, DIFAL, etc.

---

## Como usar

1. Copie os arquivos `.xml` para sua máquina
2. Acesse o **Importador de XMLs** no dashboard
3. Faça upload dos arquivos
4. Aguarde o processamento
5. Acesse o **Radar de Créditos** para ver as oportunidades identificadas

---

*Gerado em: Janeiro/2026*
*Tributech - Plataforma de Inteligência Tributária*
