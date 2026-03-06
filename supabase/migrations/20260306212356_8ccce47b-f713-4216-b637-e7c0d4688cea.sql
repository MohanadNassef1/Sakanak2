
-- 1. Add is_public column to site_settings (default true for existing rows)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- 2. Drop old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;

-- 3. Create new restricted SELECT policy for public settings only
CREATE POLICY "Anyone can read public site settings"
ON public.site_settings FOR SELECT
USING (is_public = true);

-- 4. Admins can read all settings (already covered by ALL policy, but explicit for clarity)
CREATE POLICY "Admins can read all site settings"
ON public.site_settings FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 5. Add documentation comment
COMMENT ON TABLE public.site_settings IS 'Site configuration. Set is_public=false for sensitive settings. Only public settings are readable by anonymous users.';
