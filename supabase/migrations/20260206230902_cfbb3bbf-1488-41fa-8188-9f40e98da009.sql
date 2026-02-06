-- Add rental confirmation fields for dual confirmation
ALTER TABLE public.viewing_requests 
ADD COLUMN IF NOT EXISTS tenant_rental_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS landlord_rental_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tenant_rental_confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS landlord_rental_confirmed_at timestamp with time zone;