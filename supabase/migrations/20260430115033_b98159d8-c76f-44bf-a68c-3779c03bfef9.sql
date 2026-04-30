CREATE TABLE public.inbound_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  text_body TEXT,
  html_body TEXT,
  in_reply_to TEXT,
  message_id TEXT,
  raw_payload JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view inbound emails"
ON public.inbound_emails FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update inbound emails"
ON public.inbound_emails FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete inbound emails"
ON public.inbound_emails FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can insert inbound emails"
ON public.inbound_emails FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_inbound_emails_received_at ON public.inbound_emails(received_at DESC);
CREATE INDEX idx_inbound_emails_from_email ON public.inbound_emails(from_email);
CREATE INDEX idx_inbound_emails_to_email ON public.inbound_emails(to_email);