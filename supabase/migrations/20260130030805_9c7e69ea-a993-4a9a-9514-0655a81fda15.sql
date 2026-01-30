-- Create workflow_progress table to persist user progress
CREATE TABLE public.workflow_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_id TEXT NOT NULL,
  current_step_index INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, workflow_id)
);

-- Enable Row Level Security
ALTER TABLE public.workflow_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own workflow progress"
ON public.workflow_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workflow progress"
ON public.workflow_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflow progress"
ON public.workflow_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflow progress"
ON public.workflow_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_workflow_progress_updated_at
BEFORE UPDATE ON public.workflow_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();