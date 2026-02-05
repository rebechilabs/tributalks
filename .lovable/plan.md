
# Plano: Corrigir Erro da Página "Configure seu Ambiente"

## Diagnóstico

O erro ocorre porque a página `/setup` tenta usar um campo `telefone` que **não existe** na tabela `profiles` do banco de dados.

### Código com Problema

```typescript
// src/pages/Setup.tsx (linhas 26 e 41)
const [userPhone, setUserPhone] = useState(profile?.telefone || "");  // ← Campo não existe

// src/pages/Setup.tsx (linha 56)
.update({
  nome: userName.trim(),
  telefone: userPhone.trim() || null,  // ← Erro ao salvar: coluna não existe
  setup_complete: true,
})
```

### Evidência
Consultei a tabela `profiles` diretamente e confirmei que a coluna `telefone` não existe.

## Solução

### Opção Recomendada: Remover o campo telefone do Setup.tsx

Como o telefone é marcado como "opcional" e não é essencial para o onboarding, a solução mais rápida é removê-lo do formulário.

**Arquivos a modificar:**

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Setup.tsx` | Remover campos relacionados a telefone |
| `src/hooks/useAuth.tsx` | Remover `telefone` da interface Profile (limpeza) |

### Mudanças Específicas

**1. src/pages/Setup.tsx**
- Remover o estado `userPhone` (linha 26)
- Remover o `useEffect` que preenche `userPhone` (linhas 40-41)
- Remover `telefone` do update do Supabase (linha 56)
- Remover o campo de input "Telefone (opcional)" (linhas 135-143)

**2. src/hooks/useAuth.tsx**
- Remover `telefone?: string | null` da interface `Profile` (linha 10)

## Benefícios

1. **Resolve o erro imediatamente** - Sem necessidade de migração de banco
2. **Simplifica o onboarding** - Menos campos = mais conversão
3. **Código mais limpo** - Remove referência a campo inexistente
4. **Zero downtime** - Mudança apenas no frontend

## Alternativa Futura

Se o campo telefone for necessário no futuro, podemos:
1. Criar migração para adicionar coluna `telefone TEXT` na tabela `profiles`
2. Restaurar os campos no Setup.tsx

## Resumo

O erro é causado por uma incompatibilidade entre o código (que espera um campo `telefone`) e o banco de dados (que não tem esse campo). A correção remove essa dependência do formulário de setup.
