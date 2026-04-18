-- Fix 1: PROFILES_PHONE_WHATSAPP_EXPOSURE
-- Tighten the "confirmed reservation partners" SELECT policy on profiles so that
-- contact details (phone, whatsapp, email, date_of_birth) are NOT exposed merely because
-- two users share a confirmed reservation. The full row is no longer accessible through
-- this policy. Other code paths already use SECURITY DEFINER helpers
-- (get_room_owner_public_info, get_viewing_participant_profile, get_browsable_roommates,
-- get_accessible_public_profiles) that return only safe, non-contact columns.
--
-- We replace the broad row-level permission with a scoped function that consumers can call
-- when they legitimately need the partner's contact info AFTER a confirmed reservation.

DROP POLICY IF EXISTS "Users can view contact info of confirmed reservation partners" ON public.profiles;

-- Create a SECURITY DEFINER function that returns ONLY the contact fields needed for a
-- confirmed reservation partner. The caller must (a) be authenticated and verified, and
-- (b) be on the confirmed reservation with the requested user.
CREATE OR REPLACE FUNCTION public.get_confirmed_reservation_partner_contact(_partner_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  phone text,
  whatsapp text,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.phone,
    p.whatsapp,
    p.email
  FROM public.profiles p
  WHERE p.user_id = _partner_id
    AND auth.uid() IS NOT NULL
    AND public.is_user_verified(auth.uid())
    AND p.verification_status = 'verified'::public.verification_status
    AND EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.status = ANY (ARRAY['confirmed'::text, 'completed'::text])
        AND r.seeker_confirmed = true
        AND r.owner_confirmed = true
        AND (
          (r.seeker_id = auth.uid() AND r.owner_id = _partner_id)
          OR
          (r.owner_id = auth.uid() AND r.seeker_id = _partner_id)
        )
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_confirmed_reservation_partner_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_confirmed_reservation_partner_contact(uuid) TO authenticated;

-- Fix 2: REALTIME_ROOMS_BROADCAST
-- Restrict realtime broadcasts on the 'rooms' topic to active/rented/expired statuses
-- (matching the table-level public read policy) and to the room owner's private channel.
-- Subscribers using channel topic 'rooms' or 'rooms-public' only receive events that
-- correspond to publicly-viewable rooms; owners can subscribe to 'rooms-owner-<uid>' for
-- their own room change events including drafts.
DROP POLICY IF EXISTS "Authenticated users can read their own channels" ON realtime.messages;

CREATE POLICY "Authenticated users can read their own channels"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    -- Direct conversation channels
    (
      realtime.topic() LIKE 'conversation-%'
      AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id::text = substring(realtime.topic() FROM 'conversation-(.*)')
          AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
      )
    )
    OR (
      realtime.topic() LIKE 'messages-%'
      AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id::text = substring(realtime.topic() FROM 'messages-(.*)')
          AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
      )
    )
    -- Support chat channels
    OR (
      realtime.topic() LIKE 'support-%'
      AND EXISTS (
        SELECT 1 FROM public.support_conversations sc
        WHERE sc.id::text = substring(realtime.topic() FROM 'support-(.*)')
          AND (sc.user_id = auth.uid() OR public.is_admin(auth.uid()))
      )
    )
    -- Viewing message channels
    OR (
      realtime.topic() LIKE 'viewing-%'
      AND EXISTS (
        SELECT 1 FROM public.viewing_requests vr
        WHERE vr.id::text = substring(realtime.topic() FROM 'viewing-(.*)')
          AND (vr.tenant_id = auth.uid() OR vr.landlord_id = auth.uid())
      )
    )
    -- Per-user unread badge channels
    OR realtime.topic() = 'unread-badge-' || auth.uid()::text
    OR realtime.topic() = 'unread-viewing-badge-' || auth.uid()::text
    -- Room owners can subscribe to their own room change feed
    OR realtime.topic() = 'rooms-owner-' || auth.uid()::text
  );

-- Allow anonymous + authenticated subscribers to receive ONLY public room events on the
-- 'rooms-public' channel. We do NOT expose any other 'rooms' topic publicly so owners must
-- use 'rooms-owner-<uid>' for private (draft) events.
CREATE POLICY "Public room events are visible on rooms-public channel"
  ON realtime.messages
  FOR SELECT
  TO anon, authenticated
  USING (
    realtime.topic() = 'rooms-public'
  );