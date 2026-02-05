
# Plano: Corrigir Erro de Adicionar Empresa no Setup

## Diagnóstico Definitivo

O erro no banco de dados é:
```
duplicate key value violates unique constraint "company_profile_user_id_key"
```

### Causa Raiz
A tabela `company_profile` possui uma constraint `UNIQUE` na coluna `user_id`:
```sql
UNIQUE (user_id)  -- ← ISTO IMPEDE MÚLTIPLAS EMPRESAS POR USUÁRIO!
```

Isso contradiz completamente o requisito de multi-CNPJ do sistema, onde usuários podem ter 1-4+ empresas dependendo do plano.

## Solução

Remover a constraint UNIQUE da coluna `user_id` para permitir que um usuário tenha múltiplas empresas.

### Migração SQL Necessária

```sql
-- Remove a constraint UNIQUE que impede múltiplas empresas por usuário
ALTER TABLE public.company_profile 
DROP CONSTRAINT company_profile_user_id_key;
```

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| 1 empresa por usuário (bloqueado por UNIQUE) | Múltiplas empresas por usuário (conforme plano) |
| Erro ao adicionar 2ª empresa | Funciona corretamente |

## Impacto
- **Zero risco de perda de dados** - apenas remove a restrição
- **Não afeta RLS** - políticas de segurança continuam funcionando
- **Alinha com requisitos** - sistema multi-CNPJ funciona conforme esperado

## Arquivos Afetados
Nenhum arquivo de código precisa ser alterado. O código em `CompanyContext.tsx` e `CompanySetupForm.tsx` já está correto — o problema é apenas a constraint no banco de dados.
