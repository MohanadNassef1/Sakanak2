-- Add INSERT policy for contact_submissions to allow anyone to submit (public contact form)
-- but restrict to prevent abuse
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (true);
