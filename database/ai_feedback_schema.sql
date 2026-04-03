-- AI feedback schema
-- Supports both message-level feedback (like/dislike) and overall experience feedback.

CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback_scope TEXT NOT NULL CHECK (feedback_scope IN ('message', 'overall')),
  chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  feedback_value TEXT CHECK (feedback_value IN ('like', 'dislike')),
  reason TEXT,
  reasons TEXT[],
  details TEXT,
  llm_response TEXT,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_feedback_scope_shape_check CHECK (
    (feedback_scope = 'message' AND message_id IS NOT NULL AND chat_id IS NOT NULL AND feedback_value IS NOT NULL AND rating IS NULL)
    OR
    (feedback_scope = 'overall' AND message_id IS NULL AND feedback_value IS NULL AND rating BETWEEN 1 AND 5)
  ),
  CONSTRAINT ai_feedback_reason_length_check CHECK (reason IS NULL OR char_length(reason) <= 240),
  CONSTRAINT ai_feedback_details_length_check CHECK (details IS NULL OR char_length(details) <= 4000),
  CONSTRAINT ai_feedback_llm_response_length_check CHECK (llm_response IS NULL OR char_length(llm_response) <= 12000)
);

ALTER TABLE public.ai_feedback
  ADD COLUMN IF NOT EXISTS llm_response TEXT;

UPDATE public.ai_feedback AS af
SET llm_response = am.content
FROM public.ai_messages AS am
WHERE af.feedback_scope = 'message'
  AND af.message_id = am.id
  AND (af.llm_response IS NULL OR af.llm_response = '');

CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_created_at
  ON public.ai_feedback(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_chat_created_at
  ON public.ai_feedback(chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_scope_created_at
  ON public.ai_feedback(feedback_scope, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_feedback_user_message_scope
  ON public.ai_feedback(user_id, message_id, feedback_scope);

ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own AI feedback" ON public.ai_feedback;
CREATE POLICY "Users can view own AI feedback" ON public.ai_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own AI feedback" ON public.ai_feedback;
CREATE POLICY "Users can insert own AI feedback" ON public.ai_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own AI feedback" ON public.ai_feedback;
CREATE POLICY "Users can update own AI feedback" ON public.ai_feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_ai_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_ai_feedback ON public.ai_feedback;
CREATE TRIGGER set_updated_at_ai_feedback
  BEFORE UPDATE ON public.ai_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ai_feedback_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.ai_feedback TO authenticated;
