
# Integrar SintegraWS + Expandir Dados de CNPJ

## Resumo

Adicionar o SintegraWS como fonte complementar de Inscricao Estadual e, ao mesmo tempo, capturar dados que ja estao disponiveis nas APIs atuais (BrasilAPI e CNPJ.ws) mas estao sendo descartados -- como CNAEs secundarios, endereco completo, email e telefone.

## Custo estimado

O SintegraWS opera com pacotes pre-pagos. O pacote mais comum custa aproximadamente **R$ 179,90 por 1.000 consultas** (R$ 0,18 por consulta), com creditos validos por 1 ano.

## O que muda

### 1. Configurar o secret SINTEGRA_API_KEY

Sera necessario cadastrar a chave de API do SintegraWS como secret do projeto. Voce precisara criar uma conta em sintegraws.com.br e adquirir um pacote de creditos.

### 2. Expandir a resposta do endpoint /cnpj na Edge Function

Campos adicionais que serao retornados:

```text
+ inscricoes_estaduais: { inscricao_estadual: string, uf: string }[]
+ cnaes_secundarios: { codigo: number, descricao: string }[]
+ data_inicio_atividade: string
+ data_situacao_cadastral: string
+ logradouro: string
+ numero: string
+ complemento: string
+ bairro: string
+ email: string
+ telefone: string
```

### 3. Adicionar consulta ao SintegraWS na Edge Function

- Criar funcao `lookupSintegra(cnpj)` que consulta `https://www.sintegraws.com.br/api/v1/consulta-cnpj.php`
- Essa funcao sera chamada **apos** a consulta principal (BrasilAPI/CNPJ.ws) para complementar o campo `inscricoes_estaduais` caso a fonte primaria nao tenha retornado IEs
- Se o secret `SINTEGRA_API_KEY` nao estiver configurado, o sistema continua funcionando normalmente sem o Sintegra (graceful degradation)

### 4. Atualizar o hook useCnpjLookup no frontend

Expandir a interface `CnpjData` para incluir todos os novos campos retornados pela Edge Function.

### 5. Atualizar componentes consumidores

- **CnpjInput**: exibir IE e endereco no card de confirmacao
- **QuickAddCnpj**: mostrar IE junto com UF e porte
- **CompanySetupForm / AddCompanyModal**: auto-preencher campos adicionais quando disponivel

### 6. Adicionar colunas na tabela company_profile

Migracao SQL para persistir os novos dados:
- `inscricao_estadual` (text)
- `data_inicio_atividade` (date)

## Detalhes Tecnicos

### Arquivos modificados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/gov-data-api/index.ts` | Expandir `CnpjResponse`, atualizar mapeamentos BrasilAPI/CNPJ.ws, adicionar `lookupSintegra()` |
| `src/hooks/useCnpjLookup.ts` | Expandir interface `CnpjData` |
| `src/components/common/CnpjInput.tsx` | Exibir IE e endereco no resultado |
| `src/components/profile/QuickAddCnpj.tsx` | Mostrar IE no card de confirmacao |

### Fluxo de consulta atualizado

```text
1. Usuario digita CNPJ
2. Edge Function consulta BrasilAPI (gratis)
   - Se falhar: consulta CNPJ.ws (gratis, fallback)
3. Se inscricoes_estaduais estiver vazio E SINTEGRA_API_KEY existir:
   - Consulta SintegraWS (pago, complementar)
   - Adiciona IE ao resultado
4. Retorna dados enriquecidos ao frontend
```

### Endpoint SintegraWS

```text
GET https://www.sintegraws.com.br/api/v1/consulta-cnpj.php
  ?token={SINTEGRA_API_KEY}
  &cnpj={cnpj}
  &plugin=ST

Resposta relevante:
  inscricao_estadual: string
  data_situacao_cadastral_ie: string
```

### Migracao SQL

```sql
ALTER TABLE company_profile 
  ADD COLUMN IF NOT EXISTS inscricao_estadual text,
  ADD COLUMN IF NOT EXISTS data_inicio_atividade date;
```
