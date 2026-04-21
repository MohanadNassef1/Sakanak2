-- Drop the existing INSERT policy and recreate with verification check
DROP POLICY IF EXISTS "Verified tenants can create viewing requests" ON public.viewing_requests;

CREATE POLICY "Verified tenants can create viewing requests"
ON public.viewing_requests
FOR INSERT
TO public
WITH CHECK (
  tenant_id = auth.uid()
  AND tenant_id <> landlord_id
  AND is_user_verified(auth.uid())
);