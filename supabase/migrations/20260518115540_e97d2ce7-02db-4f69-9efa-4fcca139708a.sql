DROP POLICY IF EXISTS "Verified tenants can create viewing requests" ON public.viewing_requests;

CREATE POLICY "Tenants can create viewing requests"
ON public.viewing_requests
FOR INSERT
TO authenticated
WITH CHECK (tenant_id = auth.uid() AND tenant_id <> landlord_id);