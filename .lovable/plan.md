

## Correção da Integração Newsletter Beehiiv

### Problema Identificado
O secret `BEEHIIV_PUBLICATION_ID` está configurado sem o prefixo obrigatório `pub_`, causando erro 400 na API do Beehiiv.

### Solução

**Atualizar o secret com o valor correto:**

| Secret | Valor Atual (incorreto) | Valor Novo (correto) |
|--------|------------------------|---------------------|
| `BEEHIIV_PUBLICATION_ID` | `6921f1bc-3fad-44cd-9179-4e2f2e59462f` | `pub_6921f1bc-3fad-44cd-9179-4e2f2e59462f` |

### Ação Necessária
1. Atualizar o secret `BEEHIIV_PUBLICATION_ID` para incluir o prefixo `pub_`
2. Testar o formulário de inscrição na newsletter

### Resultado Esperado
- Formulário de newsletter funcionando corretamente
- Inscrições sendo enviadas para o Beehiiv com sucesso

---

**Nenhuma alteração de código necessária** - apenas a correção do valor do secret.

