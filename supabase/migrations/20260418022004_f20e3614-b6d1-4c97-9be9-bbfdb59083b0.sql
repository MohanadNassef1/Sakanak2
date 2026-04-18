
-- Fix 1: PRIVILEGE_ESCALATION on user_roles
-- Scope the permissive ALL policy to {authenticated} so RESTRICTIVE policies always apply.
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix 2: MISSING_REALTIME_AUTHORIZATION
-- Add RLS policies on realtime.messages so users can only subscribe to channels they participate in.
-- Channel naming convention used by app:
--   - "conversation-<conversation_id>" for direct messages (ChatWindow)
--   - "messages-<conversation_id>" (legacy)
--   - "support-<conversation_id>" for support chat
--   - "viewing-<viewing_id>" for viewing messages
--   - "unread-badge", "unread-viewing-badge" — global broadcast (table-level RLS still filters rows)
-- Enable RLS on realtime.messages (managed table — usually already enabled, ensure it)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to subscribe only to channels they participate in
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
    -- Global unread-badge channels (no row data leaked; table-level RLS filters payloads)
    OR realtime.topic() IN ('unread-badge', 'unread-viewing-badge')
  );

-- Fix 3: MISSING_RLS_PROTECTION on email_send_log metadata
-- The table is already admin/service-role only. Add a comment documenting that
-- metadata MUST NOT contain user PII beyond operational necessity.
COMMENT ON COLUMN public.email_send_log.metadata IS
  'Operational metadata only (template variables, queue ids, etc). MUST NOT store user PII beyond what is strictly required to debug deliverability.';
COMMENT ON COLUMN public.email_send_log.recipient_email IS
  'Recipient email address. Access restricted to admins and service role via RLS.';
