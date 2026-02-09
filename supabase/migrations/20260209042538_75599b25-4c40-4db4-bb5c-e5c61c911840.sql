-- Add is_disabled column to profiles for soft delete functionality
ALTER TABLE public.profiles 
ADD COLUMN is_disabled boolean NOT NULL DEFAULT false;

-- Add disabled_at timestamp to track when user was disabled
ALTER TABLE public.profiles 
ADD COLUMN disabled_at timestamp with time zone DEFAULT NULL;

-- Add disabled_by to track which admin disabled the user
ALTER TABLE public.profiles 
ADD COLUMN disabled_by uuid DEFAULT NULL;

-- Add disabled_reason to store why user was disabled
ALTER TABLE public.profiles 
ADD COLUMN disabled_reason text DEFAULT NULL;

-- Create a function to check if a user is disabled
CREATE OR REPLACE FUNCTION public.is_user_disabled(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_disabled FROM public.profiles WHERE user_id = check_user_id),
    false
  );
$$;