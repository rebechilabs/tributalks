-- Enable RLS on subscription_events table
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (webhooks use service role)
-- No policy needed for INSERT as webhooks use service_role which bypasses RLS

-- Policy: Users can only view their own subscription events
CREATE POLICY "Users can view own subscription events"
ON public.subscription_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: No public access - only authenticated users can see their own events
-- DELETE and UPDATE are not allowed for regular users (handled by no policy = denied)