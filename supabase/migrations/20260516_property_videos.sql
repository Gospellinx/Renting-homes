-- ============================================================
-- property_videos table
-- Videos are hosted on Cloudinary and metadata stored here.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.property_videos (
  id            UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Cloudinary fields
  cloudinary_public_id  TEXT NOT NULL,
  video_url             TEXT NOT NULL,      -- Original URL (HLS/DASH or mp4)
  streaming_url         TEXT,               -- Adaptive streaming m3u8 URL (set after processing)
  thumbnail_url         TEXT,               -- Auto-generated poster frame
  duration_seconds      NUMERIC(8, 2),      -- Duration in seconds
  file_size_bytes       BIGINT,             -- Original file size
  format                TEXT,              -- mp4 | mov | webm
  width                 INTEGER,
  height                INTEGER,

  -- Status tracking
  status        TEXT NOT NULL DEFAULT 'processing'
                  CHECK (status IN ('processing', 'ready', 'error')),

  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS property_videos_property_id_idx ON public.property_videos(property_id);
CREATE INDEX IF NOT EXISTS property_videos_user_id_idx    ON public.property_videos(user_id);
CREATE INDEX IF NOT EXISTS property_videos_status_idx     ON public.property_videos(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_property_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS property_videos_set_updated_at ON public.property_videos;
CREATE TRIGGER property_videos_set_updated_at
  BEFORE UPDATE ON public.property_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_property_videos_updated_at();

-- Row Level Security
ALTER TABLE public.property_videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view videos for approved properties (or the owner's own videos)
DROP POLICY IF EXISTS "Anyone can view approved property videos" ON public.property_videos;
CREATE POLICY "Anyone can view approved property videos"
  ON public.property_videos FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.status = 'approved'
    )
  );

-- Only authenticated owners can insert
DROP POLICY IF EXISTS "Users can insert their own videos" ON public.property_videos;
CREATE POLICY "Users can insert their own videos"
  ON public.property_videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only owners can update
DROP POLICY IF EXISTS "Users can update their own videos" ON public.property_videos;
CREATE POLICY "Users can update their own videos"
  ON public.property_videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only owners can delete
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.property_videos;
CREATE POLICY "Users can delete their own videos"
  ON public.property_videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
