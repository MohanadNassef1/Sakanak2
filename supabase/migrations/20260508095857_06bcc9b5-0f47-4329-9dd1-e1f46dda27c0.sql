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
  v_occupation_status text;
  v_university text;
  v_faculty text;
  v_job_title text;
  v_phone text;
  v_area1 text;
  v_area2 text;
  v_personality_tags text[];
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

  BEGIN
    v_date_of_birth := (NEW.raw_user_meta_data->>'date_of_birth')::date;
  EXCEPTION WHEN OTHERS THEN
    v_date_of_birth := NULL;
  END;

  v_occupation_status := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'occupation_status', '')));
  IF v_occupation_status NOT IN ('student', 'working') THEN
    v_occupation_status := NULL;
  END IF;
  v_university := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'university', '')), '');
  v_faculty := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'faculty', '')), '');
  v_job_title := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'job_title', '')), '');

  v_phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');
  IF v_phone IS NOT NULL AND v_phone !~ '^01[0-9]{9}$' THEN
    v_phone := NULL;
  END IF;

  v_area1 := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'interested_area_1', '')), '');
  v_area2 := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'interested_area_2', '')), '');

  BEGIN
    IF NEW.raw_user_meta_data ? 'personality_tags'
       AND jsonb_typeof(NEW.raw_user_meta_data->'personality_tags') = 'array' THEN
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'personality_tags')
      ) INTO v_personality_tags;
    ELSE
      v_personality_tags := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_personality_tags := NULL;
  END;

  BEGIN
    INSERT INTO public.profiles (
      user_id, full_name, email, gender, nationality, date_of_birth,
      occupation_status, university, faculty, job_title, occupation,
      phone, interested_area_1, interested_area_2, personality_tags
    )
    VALUES (
      NEW.id,
      v_full_name,
      NEW.email,
      v_gender::user_gender,
      NULLIF(v_nationality, ''),
      v_date_of_birth,
      v_occupation_status,
      v_university,
      v_faculty,
      v_job_title,
      CASE WHEN v_occupation_status = 'student' THEN 'Student'
           WHEN v_occupation_status = 'working' THEN 'Working'
           ELSE NULL END,
      v_phone,
      v_area1,
      v_area2,
      COALESCE(v_personality_tags, ARRAY[]::text[])
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