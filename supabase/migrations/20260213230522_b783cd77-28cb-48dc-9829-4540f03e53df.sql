-- Revert to security_invoker off since the view needs to show rented rooms to all users
-- The view only exposes non-sensitive public fields (no payout info, no owner details)
ALTER VIEW public.public_rooms SET (security_invoker = off);