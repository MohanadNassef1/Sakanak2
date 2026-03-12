
-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop the per-INSERT cleanup trigger (performance improvement)
DROP TRIGGER IF EXISTS cleanup_rate_limits_trigger ON public.rate_limits;

-- Keep the function for potential manual use but it won't fire automatically
