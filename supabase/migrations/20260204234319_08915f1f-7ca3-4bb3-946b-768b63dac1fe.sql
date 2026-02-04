-- Update handle_new_user function to include nationality from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, gender, nationality)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    (NEW.raw_user_meta_data->>'gender')::user_gender,
    NEW.raw_user_meta_data->>'nationality'
  );
  RETURN NEW;
END;
$function$;