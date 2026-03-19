-- Cleanup: remove duplicate triggers introduced during security hardening (existing triggers already enforce these rules)

DROP TRIGGER IF EXISTS trg_profiles_prevent_gender_change ON public.profiles;
DROP TRIGGER IF EXISTS trg_profiles_protect_sensitive_fields ON public.profiles;
DROP TRIGGER IF EXISTS trg_reservations_protect_fields ON public.reservations;
