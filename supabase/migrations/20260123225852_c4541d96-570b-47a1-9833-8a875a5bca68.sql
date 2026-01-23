-- Adicionar política explícita para subscription_events - bloquear INSERT de usuários
CREATE POLICY "Only service role can insert subscription events"
ON public.subscription_events
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Nota: Webhooks usam service_role que bypassa RLS automaticamente