
# Blindar RLS das Tabelas de Migracao

## Problema Encontrado

As politicas RLS de `company_profile` e `tax_opportunities` estao configuradas com `TO public` (role padrao quando omitido), o que permite que usuarios anonimos (nao autenticados) tentem acessar os dados. Embora a condicao `auth.uid() = user_id` bloqueie na pratica (retorna NULL para anon), a melhor pratica e restringir explicitamente a `authenticated`.

### Estado Atual

| Tabela | Politica | Role Atual | Problema |
|--------|----------|------------|----------|
| `company_profile` | SELECT own | `public` | Deveria ser `authenticated` |
| `company_profile` | INSERT own | `public` | Deveria ser `authenticated` |
| `company_profile` | UPDATE own | `public` | Deveria ser `authenticated` |
| `company_profile` | DELETE own | `public` | Deveria ser `authenticated` |
| `tax_opportunities` | Admin manage (ALL) | `public` | Deveria ser `authenticated` |
| `tax_opportunities` | Read opportunities | `authenticated` | OK |

O trigger `infer_macro_segmento` nao e `SECURITY DEFINER` — esta correto pois roda no contexto do usuario que faz o INSERT/UPDATE.

## Plano de Execucao

### 1. Migracao SQL

Dropar as 5 politicas com role `public` e recriar com `TO authenticated`:

```text
-- company_profile: restringir a authenticated
DROP POLICY IF EXISTS "Users can view own profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.company_profile;

CREATE POLICY "Users can view own profile"
ON public.company_profile FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.company_profile FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.company_profile FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
ON public.company_profile FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- tax_opportunities: admin policy restringir a authenticated
DROP POLICY IF EXISTS "Only admins can manage opportunities" ON public.tax_opportunities;

CREATE POLICY "Only admins can manage opportunities"
ON public.tax_opportunities FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### 2. Adicionar politica RESTRICTIVE para anon

Bloquear explicitamente acesso anonimo nas duas tabelas:

```text
CREATE POLICY "Deny anon access to company_profile"
ON public.company_profile AS RESTRICTIVE FOR ALL
TO anon
USING (false);

CREATE POLICY "Deny anon access to tax_opportunities"
ON public.tax_opportunities AS RESTRICTIVE FOR ALL
TO anon
USING (false);
```

## Resultado Esperado

- 0 politicas com `TO public` nas tabelas de migracao
- Acesso anonimo explicitamente bloqueado
- Nenhuma mudanca funcional para usuarios autenticados
- Nenhuma alteracao de codigo frontend necessaria

## Secao Tecnica

A unica alteracao e uma migracao SQL. Nenhum arquivo de codigo precisa ser modificado. As colunas novas (`setor_secundario`, `folha_faixa`, `tags_operacao`, `applicability`) ficam protegidas pelas mesmas politicas da tabela — RLS opera no nivel da linha, nao da coluna.
