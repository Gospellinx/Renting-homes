CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(auth.uid(), 'admin')
    OR coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    OR coalesce(auth.jwt() -> 'app_metadata' ->> 'user_type', '') = 'admin'
    OR coalesce(auth.jwt() -> 'user_metadata' ->> 'user_type', '') = 'admin';
$$;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
CREATE POLICY "Admins can manage all properties"
  ON public.properties
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all verification requests" ON public.verification_requests;
CREATE POLICY "Admins can manage all verification requests"
  ON public.verification_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all ad campaigns" ON public.ad_campaigns;
CREATE POLICY "Admins can manage all ad campaigns"
  ON public.ad_campaigns
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all ad sets" ON public.ad_sets;
CREATE POLICY "Admins can manage all ad sets"
  ON public.ad_sets
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all ads" ON public.ads;
CREATE POLICY "Admins can manage all ads"
  ON public.ads
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DO $$
BEGIN
  IF to_regclass('public.property_reports') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins can manage all property reports" ON public.property_reports;
    CREATE POLICY "Admins can manage all property reports"
      ON public.property_reports
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

DROP POLICY IF EXISTS "Admins can view property documents" ON storage.objects;
CREATE POLICY "Admins can view property documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'property-documents'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete property documents" ON storage.objects;
CREATE POLICY "Admins can delete property documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-documents'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
CREATE POLICY "Admins can delete property images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND public.is_admin()
  );
