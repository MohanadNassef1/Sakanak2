-- 1) Remove the overly broad SELECT policy on profiles that exposed
--    sensitive columns (phone, whatsapp, email, date_of_birth, nationality)
--    to any verified counterpart of a confirmed viewing.
DROP POLICY IF EXISTS "Users can view profiles of confirmed viewing participants" ON public.profiles;

-- The existing SECURITY DEFINER function `get_viewing_participant_profile`
-- already returns only non-sensitive viewing-context fields and is the
-- correct way for the app to read counterpart profiles. Sensitive contact
-- fields remain gated behind `get_confirmed_reservation_partner_contact`,
-- which only returns them after a mutually confirmed reservation.

-- 2) Harden rate_limits: explicitly deny non-service-role access on every command.
--    The existing "Service role can manage rate limits" ALL policy continues to
--    allow service-role full access; these additional restrictive policies
--    block authenticated and anonymous reads/writes.
CREATE POLICY "Block non-service-role select on rate_limits"
  ON public.rate_limits
  AS RESTRICTIVE
  FOR SELECT
  TO public
  USING (auth.role() = 'service_role');

CREATE POLICY "Block non-service-role insert on rate_limits"
  ON public.rate_limits
  AS RESTRICTIVE
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Block non-service-role update on rate_limits"
  ON public.rate_limits
  AS RESTRICTIVE
  FOR UPDATE
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Block non-service-role delete on rate_limits"
  ON public.rate_limits
  AS RESTRICTIVE
  FOR DELETE
  TO public
  USING (auth.role() = 'service_role');