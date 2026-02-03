-- Habilita realtime para clara_autonomous_actions
ALTER PUBLICATION supabase_realtime ADD TABLE public.clara_autonomous_actions;

-- Função para executar ação aprovada automaticamente via pg_net
CREATE OR REPLACE FUNCTION public.trigger_execute_approved_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_anon_key text;
BEGIN
  -- Só executa se o status mudou para 'approved' e não requer aprovação
  -- OU se requires_approval = false e status = 'pending' (execução imediata)
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Busca configurações
    v_url := current_setting('app.settings.supabase_url', true);
    v_anon_key := current_setting('app.settings.supabase_anon_key', true);
    
    -- Se as configurações não estão disponíveis, não faz nada
    -- A execução será feita pelo cron job
    IF v_url IS NULL OR v_anon_key IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Dispara execução assíncrona via pg_net (se disponível)
    BEGIN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/execute-autonomous-action',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key
        ),
        body := jsonb_build_object('action_id', NEW.id)
      );
    EXCEPTION WHEN OTHERS THEN
      -- Se pg_net não está disponível ou falhou, ignora
      -- O cron job vai processar depois
      RAISE NOTICE 'pg_net não disponível, ação será processada pelo cron';
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger que dispara quando uma ação é aprovada
DROP TRIGGER IF EXISTS on_action_approved ON public.clara_autonomous_actions;
CREATE TRIGGER on_action_approved
  AFTER INSERT OR UPDATE OF status ON public.clara_autonomous_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_execute_approved_action();

-- Função para processar ações que não requerem aprovação imediatamente
CREATE OR REPLACE FUNCTION public.auto_approve_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se a ação não requer aprovação, aprova automaticamente
  IF NEW.requires_approval = false AND NEW.status = 'pending' THEN
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para auto-aprovar ações que não requerem aprovação
DROP TRIGGER IF EXISTS on_action_created ON public.clara_autonomous_actions;
CREATE TRIGGER on_action_created
  BEFORE INSERT ON public.clara_autonomous_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_action();