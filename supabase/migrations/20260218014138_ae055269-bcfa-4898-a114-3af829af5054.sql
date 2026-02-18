
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_gender text;
  v_full_name text;
  v_nationality text;
  v_is_oauth boolean;
BEGIN
  -- Detect if this is an OAuth signup (no password, has provider info)
  v_is_oauth := (NEW.raw_user_meta_data->>'iss' IS NOT NULL) 
    OR (NEW.raw_app_meta_data->>'provider' IS NOT NULL AND NEW.raw_app_meta_data->>'provider' <> 'email');

  -- Validate gender
  v_gender := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'gender', '')));
  
  -- For OAuth users, skip profile creation entirely (they'll complete it on /complete-profile)
  IF v_is_oauth AND v_gender NOT IN ('male', 'female') THEN
    RETURN NEW;
  END IF;

  IF v_gender NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'Invalid gender. Must be male or female.';
  END IF;
  
  -- Validate full_name (required, 1-100 chars)
  v_full_name := TRIM(COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  ));
  IF LENGTH(v_full_name) = 0 OR LENGTH(v_full_name) > 100 THEN
    v_full_name := split_part(NEW.email, '@', 1);
  END IF;
  
  -- Validate nationality (optional, max 100 chars)
  v_nationality := TRIM(COALESCE(NEW.raw_user_meta_data->>'nationality', ''));
  IF LENGTH(v_nationality) > 100 THEN
    v_nationality := '';
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, email, gender, nationality)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    v_gender::user_gender,
    NULLIF(v_nationality, '')
  );
  
  RETURN NEW;
END;
$function$;
