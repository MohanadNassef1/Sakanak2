-- Add input validation to handle_new_user() function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gender text;
  v_full_name text;
  v_nationality text;
BEGIN
  -- Validate gender (required, must be male or female)
  v_gender := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'gender', '')));
  IF v_gender NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'Invalid gender. Must be male or female.';
  END IF;
  
  -- Validate full_name (required, 1-100 chars)
  v_full_name := TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  IF LENGTH(v_full_name) = 0 OR LENGTH(v_full_name) > 100 THEN
    RAISE EXCEPTION 'Invalid full_name. Must be 1-100 characters.';
  END IF;
  
  -- Validate nationality (optional, max 100 chars)
  v_nationality := TRIM(COALESCE(NEW.raw_user_meta_data->>'nationality', ''));
  IF LENGTH(v_nationality) > 100 THEN
    RAISE EXCEPTION 'Nationality exceeds maximum length.';
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
$$;