-- Create tributbot_messages table for rate limiting
CREATE TABLE public.tributbot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tributbot_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuários podem ver suas próprias mensagens"
ON public.tributbot_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias mensagens"
ON public.tributbot_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient daily count queries
CREATE INDEX idx_tributbot_messages_user_date 
ON public.tributbot_messages (user_id, created_at);