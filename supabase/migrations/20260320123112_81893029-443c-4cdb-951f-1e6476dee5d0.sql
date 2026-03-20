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
  v_date_of_birth date;
  v_is_oauth boolean;
BEGIN
  v_is_oauth := (NEW.raw_user_meta_data->>'iss' IS NOT NULL) 
    OR (NEW.raw_app_meta_data->>'provider' IS NOT NULL AND NEW.raw_app_meta_data->>'provider' <> 'email')
    OR (NEW.raw_app_meta_data->'providers' IS NOT NULL AND NEW.raw_app_meta_data->'providers'::text <> '["email"]');

  v_gender := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'gender', '')));
  
  IF v_is_oauth AND v_gender NOT IN ('male', 'female') THEN
    RETURN NEW;
  END IF;

  IF NOT v_is_oauth AND v_gender NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'Invalid gender. Must be male or female.';
  END IF;
  
  v_full_name := TRIM(COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  ));
  IF LENGTH(v_full_name) = 0 OR LENGTH(v_full_name) > 100 THEN
    v_full_name := split_part(NEW.email, '@', 1);
  END IF;
  
  v_nationality := TRIM(COALESCE(NEW.raw_user_meta_data->>'nationality', ''));
  IF LENGTH(v_nationality) > 100 THEN
    v_nationality := '';
  END IF;

  -- Parse date_of_birth from metadata
  BEGIN
    v_date_of_birth := (NEW.raw_user_meta_data->>'date_of_birth')::date;
  EXCEPTION WHEN OTHERS THEN
    v_date_of_birth := NULL;
  END;
  
  BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, gender, nationality, date_of_birth)
    VALUES (
      NEW.id,
      v_full_name,
      NEW.email,
      v_gender::user_gender,
      NULLIF(v_nationality, ''),
      v_date_of_birth
    );
  EXCEPTION WHEN OTHERS THEN
    IF v_is_oauth THEN
      RETURN NEW;
    ELSE
      RAISE;
    END IF;
  END;
  
  RETURN NEW;
END;
$function$;