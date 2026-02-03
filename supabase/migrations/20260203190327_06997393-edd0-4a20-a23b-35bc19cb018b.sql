-- Create enum for room types
CREATE TYPE public.room_type AS ENUM ('private_room', 'shared_room', 'studio', 'apartment');

-- Create enum for listing status
CREATE TYPE public.listing_status AS ENUM ('draft', 'active', 'rented', 'expired');

-- Create rooms/listings table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  room_type room_type NOT NULL DEFAULT 'private_room',
  price_per_month DECIMAL(10,2) NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  address TEXT,
  photos TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  rules TEXT[] DEFAULT '{}',
  available_from DATE NOT NULL DEFAULT CURRENT_DATE,
  min_stay_months INTEGER DEFAULT 1,
  max_roommates INTEGER DEFAULT 1,
  current_roommates INTEGER DEFAULT 0,
  preferred_gender TEXT DEFAULT 'any',
  allows_smoking BOOLEAN DEFAULT false,
  allows_pets BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status listing_status NOT NULL DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites/saved rooms table
CREATE TABLE public.saved_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, room_id)
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_rooms ENABLE ROW LEVEL SECURITY;

-- RLS policies for rooms
CREATE POLICY "Anyone can view active rooms"
  ON public.rooms FOR SELECT
  USING (status = 'active');

CREATE POLICY "Owners can view their own rooms"
  ON public.rooms FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Verified users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND verification_status = 'verified'
    )
  );

CREATE POLICY "Owners can update their own rooms"
  ON public.rooms FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own rooms"
  ON public.rooms FOR DELETE
  USING (owner_id = auth.uid());

-- RLS policies for saved rooms
CREATE POLICY "Users can view their saved rooms"
  ON public.saved_rooms FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can save rooms"
  ON public.saved_rooms FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unsave rooms"
  ON public.saved_rooms FOR DELETE
  USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;