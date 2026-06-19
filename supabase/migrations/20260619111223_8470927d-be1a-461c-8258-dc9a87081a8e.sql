
DROP POLICY IF EXISTS "Tenants can create viewing requests" ON public.viewing_requests;
CREATE POLICY "Tenants can create viewing requests"
ON public.viewing_requests
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = auth.uid()
  AND tenant_id <> landlord_id
  AND public.is_user_verified(auth.uid())
);

DROP POLICY IF EXISTS "Anyone can submit a rating" ON public.site_ratings;
CREATE POLICY "Anyone can submit a rating"
ON public.site_ratings
FOR INSERT
WITH CHECK (
  ((auth.uid() IS NULL) AND (user_id IS NULL) AND (user_email IS NULL))
  OR (
    (auth.uid() IS NOT NULL)
    AND (user_id = auth.uid())
    AND (user_email IS NOT NULL)
    AND (user_email = public.current_user_email())
  )
);
