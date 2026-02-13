-- Fix security definer view warning by explicitly setting security_invoker
ALTER VIEW public.public_rooms SET (security_invoker = on);