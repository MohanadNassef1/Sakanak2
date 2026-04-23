-- Prevent tenants from updating their own decline reports (evidence tampering)
CREATE POLICY "Tenants cannot update decline reports"
ON public.decline_reports
FOR UPDATE
TO public
USING (false)
WITH CHECK (false);

-- Prevent tenants from deleting their own decline reports (evidence destruction)
CREATE POLICY "Tenants cannot delete decline reports"
ON public.decline_reports
FOR DELETE
TO public
USING (false);
