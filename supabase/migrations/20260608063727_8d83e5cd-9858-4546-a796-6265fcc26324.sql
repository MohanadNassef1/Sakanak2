
CREATE TABLE public.ai_chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  chat_type text NOT NULL CHECK (chat_type IN ('finder','lister')),
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  language text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_chat_logs_user ON public.ai_chat_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_chat_logs_session ON public.ai_chat_logs(session_id, created_at);
CREATE INDEX idx_ai_chat_logs_created ON public.ai_chat_logs(created_at DESC);

GRANT SELECT ON public.ai_chat_logs TO authenticated;
GRANT ALL ON public.ai_chat_logs TO service_role;

ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all ai chat logs"
  ON public.ai_chat_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
