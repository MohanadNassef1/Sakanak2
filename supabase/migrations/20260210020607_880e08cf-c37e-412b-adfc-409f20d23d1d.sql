
-- Create email_logs table to track all sent emails
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by uuid NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  recipient_user_id uuid,
  subject text NOT NULL,
  email_type text NOT NULL DEFAULT 'broadcast',
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can access email logs
CREATE POLICY "Admins can view all email logs"
  ON public.email_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Index for faster queries
CREATE INDEX idx_email_logs_created_at ON public.email_logs (created_at DESC);
CREATE INDEX idx_email_logs_status ON public.email_logs (status);
CREATE INDEX idx_email_logs_email_type ON public.email_logs (email_type);
