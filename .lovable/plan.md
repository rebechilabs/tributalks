
# Plano: Correção da Integração Conta Azul OAuth 2.0

## Problema Identificado
A conexão OAuth está falhando porque:
1. A **URL de redirecionamento** precisa corresponder exatamente ao cadastro no Portal do Desenvolvedor
2. Segundo a memória técnica, a URL cadastrada é `https://tributechai.lovable.app/oauth/callback`
3. Você está testando no ambiente de preview com URL diferente

## Solução Proposta

### Opção A: Testar no Ambiente Publicado
Acesse `https://tributechai.lovable.app/integracoes` e tente conectar a partir de lá. A URL de callback corresponderá ao cadastro.

### Opção B: Atualizar Cadastro no Conta Azul (se necessário)
Se precisar testar no preview, será necessário adicionar a URL de preview no Portal do Desenvolvedor.

### Opção C: Implementar Detecção Automática (Recomendado)
Modificar o sistema para forçar sempre o uso da URL publicada como redirect_uri, independentemente de onde a conexão é iniciada:

**Arquivo**: `src/components/integrations/ERPConnectionWizard.tsx`
```text
Mudar linha 124:
- const redirectUri = `${window.location.origin}/oauth/callback`;
+ const redirectUri = 'https://tributechai.lovable.app/oauth/callback';
```

## Dependência
**Preciso que você reenvie o documento da API Conta Azul** para validar:
- Endpoints corretos (auth.contaazul.com vs api.contaazul.com)
- Escopos necessários
- Formato do refresh token

## Próximos Passos
1. Reenvie o documento da Conta Azul
2. Escolha a opção de solução (A, B ou C)
3. Implemento as correções baseadas na documentação oficial
