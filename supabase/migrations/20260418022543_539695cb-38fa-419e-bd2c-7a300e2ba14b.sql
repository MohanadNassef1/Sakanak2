-- Fix 1: REALTIME_UNSCOPED_BROADCAST
-- Replace the unscoped 'unread-badge' / 'unread-viewing-badge' allowance with per-user topics.
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
    -- Per-user unread badge channels: 'unread-badge-<uid>' and 'unread-viewing-badge-<uid>'
    OR realtime.topic() = 'unread-badge-' || auth.uid()::text
    OR realtime.topic() = 'unread-viewing-badge-' || auth.uid()::text
  );

-- Fix 2: MISSING_UPDATE_POLICY on storage.objects for room-photos bucket
DROP POLICY IF EXISTS "Users can update their own room photos" ON storage.objects;
CREATE POLICY "Users can update their own room photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'room-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'room-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Fix 3: PRIVILEGE_ESCALATION on user_roles
-- Remove the broad permissive "Admins can manage roles" ALL policy.
-- Explicit per-command admin policies (insert/update/delete) already exist as RESTRICTIVE,
-- so we add matching PERMISSIVE per-command policies to grant admins exactly what they need.
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Admins can insert role assignments
CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update role assignments
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can delete role assignments
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));