-- Create enum for gender (immutable field)
CREATE TYPE public.user_gender AS ENUM ('male', 'female');

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gender user_gender NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  nationality TEXT,
  occupation TEXT,
  is_smoker BOOLEAN DEFAULT false,
  has_pets BOOLEAN DEFAULT false,
  pet_type TEXT,
  about TEXT,
  looking_for TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  verification_status verification_status DEFAULT 'unverified',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile except gender"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Verified users can view other verified users' basic info (for roommate matching)
CREATE POLICY "Verified users can view other verified profiles"
ON public.profiles
FOR SELECT
USING (
  verification_status = 'verified' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND verification_status = 'verified'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to prevent gender modification
CREATE OR REPLACE FUNCTION public.prevent_gender_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.gender IS DISTINCT FROM NEW.gender THEN
    RAISE EXCEPTION 'Gender cannot be changed after registration';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to prevent gender changes
CREATE TRIGGER prevent_gender_modification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_gender_change();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, gender)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    (NEW.raw_user_meta_data->>'gender')::user_gender
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();