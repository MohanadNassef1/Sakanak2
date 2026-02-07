-- Add missing foreign key constraints to enable profile joins

-- decline_reports -> profiles
ALTER TABLE public.decline_reports
ADD CONSTRAINT decline_reports_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.decline_reports
ADD CONSTRAINT decline_reports_landlord_id_fkey 
FOREIGN KEY (landlord_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- user_warnings -> profiles
ALTER TABLE public.user_warnings
ADD CONSTRAINT user_warnings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- user_bans -> profiles
ALTER TABLE public.user_bans
ADD CONSTRAINT user_bans_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- viewing_requests -> profiles
ALTER TABLE public.viewing_requests
ADD CONSTRAINT viewing_requests_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.viewing_requests
ADD CONSTRAINT viewing_requests_landlord_id_fkey 
FOREIGN KEY (landlord_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;