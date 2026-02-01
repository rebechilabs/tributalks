
# Plano: Correções de Segurança RLS para Tracking de Presença

## Problemas Identificados

### 1. Políticas RLS com roles incorretas
A migration atual criou políticas para `public` role ao invés de `authenticated`:
```sql
-- Atual (vulnerável)
CREATE POLICY "Users can manage own presence"
ON public.user_presence FOR ALL
USING (auth.uid() = user_id)  -- Sem "TO authenticated"

CREATE POLICY "Admins can view all presence"  
ON public.user_presence FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role))  -- Sem "TO authenticated"
```

### 2. Admins não conseguem ver profiles de outros usuários
O hook `useAdminPresence` tenta buscar dados de `profiles` para enriquecer a lista de usuários online, mas a política atual de `profiles` só permite que cada usuário veja seu próprio perfil. Admins não conseguem ver nomes, emails e planos dos usuários.

### 3. Edge Function expõe IP na resposta
A edge function `track-presence` retorna o IP do cliente na resposta, o que é uma informação sensível que não deveria ser exposta.

---

## Correções Necessárias

### Migration SQL

```sql
-- 1. Remover políticas existentes com roles incorretas
DROP POLICY IF EXISTS "Users can manage own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Admins can view all presence" ON public.user_presence;

-- 2. Recriar com roles explícitas (authenticated)
CREATE POLICY "Users can manage own presence"
ON public.user_presence
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all presence"
ON public.user_presence
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Adicionar política para admins lerem profiles de todos usuários
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
```

### Edge Function
Remover a exposição do IP na resposta:

```typescript
// De:
return new Response(JSON.stringify({ 
  success: true, 
  geo: geoData,
  ip: clientIp  // ← REMOVER
}), ...);

// Para:
return new Response(JSON.stringify({ 
  success: true, 
  geo: geoData
}), ...);
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| Nova migration SQL | Recria políticas RLS com `TO authenticated` explícito |
| Nova migration SQL | Adiciona política para admins verem todos profiles |
| `track-presence/index.ts` | Remove exposição do IP do cliente na resposta |

---

## Seção Técnica

### Por que `TO authenticated` é importante?
Sem especificar a role, a política aplica-se a `public`, o que pode permitir acessos não intencionais em certas configurações. Usar `TO authenticated` garante que apenas usuários logados possam interagir com a tabela.

### Por que usar `public.has_role()` ao invés de `has_role()`?
A função `has_role` é uma **SECURITY DEFINER** function que já existe no projeto. Usar o prefixo `public.` é uma boa prática para evitar ambiguidade e garantir que estamos usando a função correta do schema público.

### Impacto da política de profiles para admins
A nova política permite que admins vejam os dados de todos os profiles (nome, email, plano, país) necessários para o painel de monitoramento "Ao Vivo". Isso não afeta a privacidade para usuários normais, que continuam vendo apenas seus próprios dados.
