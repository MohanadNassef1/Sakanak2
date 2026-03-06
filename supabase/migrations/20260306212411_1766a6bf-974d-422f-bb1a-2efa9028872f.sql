
-- Optimize rate_limits cleanup: batch delete with LIMIT to avoid full table scans
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only clean up ~100 rows at a time to avoid lock contention
  DELETE FROM public.rate_limits
  WHERE id IN (
    SELECT id FROM public.rate_limits
    WHERE created_at < now() - interval '24 hours'
    LIMIT 100
  );
  RETURN NEW;
END;
$function$;
