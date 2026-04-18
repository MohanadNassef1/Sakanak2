-- 1) Tighten the public room realtime broadcast.
-- The previous policy let any anonymous or authenticated user subscribe to 'rooms-public'
-- and receive ALL row changes from the rooms table — including draft/paused listings.
-- Drop that broad policy. Owners continue to receive their own room events on the
-- per-user 'rooms-owner-<uid>' channel (covered by the existing authenticated policy
-- on realtime.messages).
DROP POLICY IF EXISTS "Public room events are visible on rooms-public channel" ON realtime.messages;

-- 2) Enforce expiry on email unsubscribe tokens.
-- Tokens older than 30 days can no longer be marked as used.
CREATE OR REPLACE FUNCTION public.enforce_unsubscribe_token_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block updates that try to "use" an expired token
  IF NEW.used_at IS NOT NULL AND OLD.used_at IS NULL THEN
    IF OLD.created_at < now() - interval '30 days' THEN
      RAISE EXCEPTION 'Unsubscribe token has expired';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_unsubscribe_token_expiry_trigger ON public.email_unsubscribe_tokens;
CREATE TRIGGER enforce_unsubscribe_token_expiry_trigger
  BEFORE UPDATE ON public.email_unsubscribe_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_unsubscribe_token_expiry();

-- Document the expectation on the table.
COMMENT ON TABLE public.email_unsubscribe_tokens IS
  'Stores plaintext unsubscribe tokens. Tokens are short-lived (30 day soft expiry enforced by trigger). Service-role only access; rotate SUPABASE_SERVICE_ROLE_KEY if compromised.';