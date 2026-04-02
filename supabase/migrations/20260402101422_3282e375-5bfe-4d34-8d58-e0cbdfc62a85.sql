-- Add RLS policies for rate_limits table (used by edge functions via service_role)
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
