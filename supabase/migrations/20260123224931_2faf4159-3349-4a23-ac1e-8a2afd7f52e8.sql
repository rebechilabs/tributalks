-- 1. Atualizar política de profiles para exigir autenticação explícita
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Adicionar negação explícita para anônimos em contatos (a política admin já existe)
-- A política "Only admins can view contacts" já requer authenticated + has_role

-- 3. Atualizar política de subscription_events para autenticados apenas
DROP POLICY IF EXISTS "Users can view own subscription events" ON public.subscription_events;
CREATE POLICY "Users can view own subscription events"
ON public.subscription_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 4. Atualizar política de noticias_tributarias para exigir autenticação
DROP POLICY IF EXISTS "Authenticated users can view published news" ON public.noticias_tributarias;
CREATE POLICY "Authenticated users can view published news"
ON public.noticias_tributarias
FOR SELECT
TO authenticated
USING (publicado = true);

-- 5. Proteger a tabela user_roles - apenas admins podem modificar
-- Política para INSERT - apenas admins ou service role
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para UPDATE - apenas admins
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política para DELETE - apenas admins
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Política para simulations - exigir autenticação explícita
DROP POLICY IF EXISTS "Usuários podem ver suas próprias simulações" ON public.simulations;
CREATE POLICY "Usuários podem ver suas próprias simulações"
ON public.simulations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 7. Corrigir políticas de calculators - manter público para leitura (é catálogo público)
-- Já está correto - SELECT público é intencional para catálogo

-- 8. Adicionar políticas de admin para noticias (gerenciamento)
CREATE POLICY "Admins can insert news"
ON public.noticias_tributarias
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news"
ON public.noticias_tributarias
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news"
ON public.noticias_tributarias
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));