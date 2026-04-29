CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT NOT NULL,
  price TEXT NOT NULL,
  size TEXT NOT NULL,
  amenities TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  images TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  document_paths TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  verification_type TEXT NOT NULL,
  expected_investment TEXT,
  partnership_terms TEXT,
  developer_requirements TEXT,
  land_size TEXT,
  proposed_development TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT properties_status_check CHECK (status IN ('pending_review', 'approved', 'rejected', 'archived')),
  CONSTRAINT properties_type_check CHECK (property_type IN ('land', 'rental', 'building', 'shop_rental', 'joint_venture')),
  CONSTRAINT properties_title_length_check CHECK (char_length(btrim(title)) BETWEEN 5 AND 120),
  CONSTRAINT properties_description_length_check CHECK (char_length(btrim(description)) BETWEEN 20 AND 2000),
  CONSTRAINT properties_location_length_check CHECK (char_length(btrim(location)) BETWEEN 5 AND 200),
  CONSTRAINT properties_price_length_check CHECK (char_length(btrim(price)) BETWEEN 2 AND 60),
  CONSTRAINT properties_size_length_check CHECK (char_length(btrim(size)) BETWEEN 2 AND 80),
  CONSTRAINT properties_owner_name_length_check CHECK (char_length(btrim(owner_name)) BETWEEN 2 AND 100),
  CONSTRAINT properties_owner_email_format_check CHECK (
    owner_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  CONSTRAINT properties_owner_phone_length_check CHECK (
    char_length(regexp_replace(owner_phone, '\D', '', 'g')) BETWEEN 10 AND 15
  ),
  CONSTRAINT properties_images_present_check CHECK (coalesce(array_length(images, 1), 0) >= 1),
  CONSTRAINT properties_documents_present_check CHECK (coalesce(array_length(document_paths, 1), 0) >= 1),
  CONSTRAINT properties_joint_venture_requirements_check CHECK (
    property_type <> 'joint_venture'
    OR (
      char_length(btrim(coalesce(land_size, ''))) > 0
      AND char_length(btrim(coalesce(expected_investment, ''))) > 0
      AND char_length(btrim(coalesce(proposed_development, ''))) > 0
      AND char_length(btrim(coalesce(partnership_terms, ''))) >= 10
      AND char_length(btrim(coalesce(developer_requirements, ''))) >= 10
    )
  )
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

CREATE UNIQUE INDEX IF NOT EXISTS properties_user_title_location_unique_idx
  ON public.properties (
    user_id,
    property_type,
    lower(btrim(title)),
    lower(btrim(location))
  );

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

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  TRUE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  FALSE,
  20971520,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
CREATE POLICY "Users can upload property images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can update property images" ON storage.objects;
CREATE POLICY "Users can update property images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can delete property images" ON storage.objects;
CREATE POLICY "Users can delete property images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can upload property documents" ON storage.objects;
CREATE POLICY "Users can upload property documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can view property documents" ON storage.objects;
CREATE POLICY "Users can view property documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'property-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can update property documents" ON storage.objects;
CREATE POLICY "Users can update property documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'property-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can delete property documents" ON storage.objects;
CREATE POLICY "Users can delete property documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
