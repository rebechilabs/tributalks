-- Corrigir políticas de consultorias para usar apenas authenticated
DROP POLICY IF EXISTS "Users can view own consultorias" ON public.consultorias;
CREATE POLICY "Users can view own consultorias"
ON public.consultorias
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consultorias" ON public.consultorias;
CREATE POLICY "Users can insert own consultorias"
ON public.consultorias
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own consultorias" ON public.consultorias;
CREATE POLICY "Users can update own consultorias"
ON public.consultorias
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Corrigir políticas de profiles para usar apenas authenticated
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem criar seu próprio perfil"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);