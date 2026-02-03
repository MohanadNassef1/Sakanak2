-- Add payout_details column to rooms table for storing owner's payment info
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS payout_details text;