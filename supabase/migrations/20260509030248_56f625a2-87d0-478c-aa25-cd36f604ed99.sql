-- Add hear_about_us column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hear_about_us TEXT NULL;

-- Update handle_new_user trigger to extract hear_about_us from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_gender TEXT;
  v_nationality TEXT;
  v_dob TEXT;
  v_referral_code TEXT;
  v_phone TEXT;
  v_area1 TEXT;
  v_area2 TEXT;
  v_personality_tags TEXT[];
  v_occupation_status TEXT;
  v_university TEXT;
  v_faculty TEXT;
  v_job_title TEXT;
  v_hear_about_us TEXT;
BEGIN
  v_full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
  v_gender := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'gender', '')), '');
  v_nationality := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'nationality', '')), '');
  v_dob := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'date_of_birth', '')), '');
  v_referral_code := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'referral_code', '')), '');
  v_phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');
  v_area1 := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'interested_area_1', '')), '');
  v_area2 := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'interested_area_2', '')), '');
  v_occupation_status := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'occupation_status', '')), '');
  v_university := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'university', '')), '');
  v_faculty := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'faculty', '')), '');
  v_job_title := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'job_title', '')), '');
  v_hear_about_us := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'hear_about_us', '')), '');

  -- Parse personality_tags from JSON array if present
  BEGIN
    IF NEW.raw_user_meta_data->>'personality_tags' IS NOT NULL THEN
      v_personality_tags := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'personality_tags'));
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_personality_tags := NULL;
  END;

  -- Generate referral code from full name + random suffix
  DECLARE
    v_generated_code TEXT;
    v_code_exists BOOLEAN;
  BEGIN
    v_generated_code := UPPER(REGEXP_REPLACE(COALESCE(v_full_name, 'USER'), '[^A-Za-z]', '', 'g')) || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    -- Ensure uniqueness
    LOOP
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = v_generated_code) INTO v_code_exists;
      EXIT WHEN NOT v_code_exists;
      v_generated_code := UPPER(REGEXP_REPLACE(COALESCE(v_full_name, 'USER'), '[^A-Za-z]', '', 'g')) || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    END LOOP;

    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      gender,
      nationality,
      date_of_birth,
      age,
      referral_code,
      referred_by,
      phone,
      interested_area_1,
      interested_area_2,
      personality_tags,
      occupation_status,
      university,
      faculty,
      job_title,
      hear_about_us
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(v_full_name, SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(v_gender, 'male'),
      v_nationality,
      v_dob::DATE,
      CASE WHEN v_dob IS NOT NULL THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, v_dob::DATE))::INT ELSE NULL END,
      v_generated_code,
      NULLIF(UPPER(COALESCE(v_referral_code, '')), ''),
      v_phone,
      v_area1,
      v_area2,
      COALESCE(v_personality_tags, ARRAY[]::TEXT[]),
      v_occupation_status,
      v_university,
      v_faculty,
      v_job_title,
      v_hear_about_us
    )
    ON CONFLICT (user_id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$;