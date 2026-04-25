-- Create properties table used by the upload / verification flow
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT,
  lga TEXT,
  price TEXT,
  size TEXT,
  amenities TEXT[] DEFAULT '{}'::TEXT[],
  images TEXT[] DEFAULT '{}'::TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  verification_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT properties_status_check CHECK (status IN ('pending_review', 'approved', 'rejected', 'archived')),
  CONSTRAINT properties_type_check CHECK (property_type IN ('land', 'rental', 'building', 'shop_rental', 'joint_venture'))
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;
CREATE POLICY "Public can view approved properties"
  ON public.properties
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;
CREATE POLICY "Users can insert their own properties"
  ON public.properties
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties"
  ON public.properties
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties"
  ON public.properties
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS properties_user_id_idx ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS properties_status_idx ON public.properties(status);
CREATE INDEX IF NOT EXISTS properties_property_type_idx ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS properties_state_idx ON public.properties(state);

CREATE OR REPLACE FUNCTION public.update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_set_updated_at ON public.properties;
CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_properties_updated_at();
