-- Add has_private_bathroom column to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS has_private_bathroom boolean DEFAULT false;