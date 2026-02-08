-- Add allowed_gender to rooms table (replaces preferred_gender logic for stricter control)
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS allowed_gender text DEFAULT 'any' CHECK (allowed_gender IN ('any', 'males_only', 'females_only', 'families'));

-- Add occupation_status and job_title to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'occupation_status') THEN
    CREATE TYPE occupation_status AS ENUM ('student', 'working', 'unemployed');
  END IF;
END $$;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS occupation_status text DEFAULT NULL CHECK (occupation_status IS NULL OR occupation_status IN ('student', 'working', 'unemployed'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS job_title text DEFAULT NULL;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_student_verified boolean DEFAULT false;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS personality_tags text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.rooms.allowed_gender IS 'Allowed gender for tenants: any, males_only, females_only, families';
COMMENT ON COLUMN public.profiles.occupation_status IS 'User occupation: student, working, or unemployed';
COMMENT ON COLUMN public.profiles.job_title IS 'Job title for working users';
COMMENT ON COLUMN public.profiles.is_student_verified IS 'Whether student status has been verified';
COMMENT ON COLUMN public.profiles.personality_tags IS 'User personality tags (max 5)';