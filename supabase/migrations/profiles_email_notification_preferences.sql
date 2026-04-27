ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verification_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_connection_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_message_notifications BOOLEAN NOT NULL DEFAULT TRUE;
