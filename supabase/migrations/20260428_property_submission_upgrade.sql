CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS document_paths TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS expected_investment TEXT,
  ADD COLUMN IF NOT EXISTS partnership_terms TEXT,
  ADD COLUMN IF NOT EXISTS developer_requirements TEXT,
  ADD COLUMN IF NOT EXISTS land_size TEXT,
  ADD COLUMN IF NOT EXISTS proposed_development TEXT;

ALTER TABLE public.properties
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN state SET NOT NULL,
  ALTER COLUMN lga SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN size SET NOT NULL,
  ALTER COLUMN owner_name SET NOT NULL,
  ALTER COLUMN owner_phone SET NOT NULL,
  ALTER COLUMN owner_email SET NOT NULL,
  ALTER COLUMN verification_type SET NOT NULL;

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_title_length_check,
  DROP CONSTRAINT IF EXISTS properties_description_length_check,
  DROP CONSTRAINT IF EXISTS properties_location_length_check,
  DROP CONSTRAINT IF EXISTS properties_price_length_check,
  DROP CONSTRAINT IF EXISTS properties_size_length_check,
  DROP CONSTRAINT IF EXISTS properties_owner_name_length_check,
  DROP CONSTRAINT IF EXISTS properties_owner_email_format_check,
  DROP CONSTRAINT IF EXISTS properties_owner_phone_length_check,
  DROP CONSTRAINT IF EXISTS properties_images_present_check,
  DROP CONSTRAINT IF EXISTS properties_documents_present_check,
  DROP CONSTRAINT IF EXISTS properties_joint_venture_requirements_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_title_length_check CHECK (char_length(btrim(title)) BETWEEN 5 AND 120),
  ADD CONSTRAINT properties_description_length_check CHECK (char_length(btrim(description)) BETWEEN 20 AND 2000),
  ADD CONSTRAINT properties_location_length_check CHECK (char_length(btrim(location)) BETWEEN 5 AND 200),
  ADD CONSTRAINT properties_price_length_check CHECK (char_length(btrim(price)) BETWEEN 2 AND 60),
  ADD CONSTRAINT properties_size_length_check CHECK (char_length(btrim(size)) BETWEEN 2 AND 80),
  ADD CONSTRAINT properties_owner_name_length_check CHECK (char_length(btrim(owner_name)) BETWEEN 2 AND 100),
  ADD CONSTRAINT properties_owner_email_format_check CHECK (
    owner_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  ADD CONSTRAINT properties_owner_phone_length_check CHECK (
    char_length(regexp_replace(owner_phone, '\D', '', 'g')) BETWEEN 10 AND 15
  ),
  ADD CONSTRAINT properties_images_present_check CHECK (coalesce(array_length(images, 1), 0) >= 1),
  ADD CONSTRAINT properties_documents_present_check CHECK (coalesce(array_length(document_paths, 1), 0) >= 1),
  ADD CONSTRAINT properties_joint_venture_requirements_check CHECK (
    property_type <> 'joint_venture'
    OR (
      char_length(btrim(coalesce(land_size, ''))) > 0
      AND char_length(btrim(coalesce(expected_investment, ''))) > 0
      AND char_length(btrim(coalesce(proposed_development, ''))) > 0
      AND char_length(btrim(coalesce(partnership_terms, ''))) >= 10
      AND char_length(btrim(coalesce(developer_requirements, ''))) >= 10
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS properties_user_title_location_unique_idx
  ON public.properties (
    user_id,
    property_type,
    lower(btrim(title)),
    lower(btrim(location))
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  TRUE,
  5242880,
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
  10485760,
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
