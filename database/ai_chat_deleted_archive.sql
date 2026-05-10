-- AI chat/message deletion archive
-- Purpose: retain deleted chats/messages for audit and abuse investigation.

BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_chats_deleted (
  archived_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_chat_id UUID NOT NULL,
  user_id UUID,
  title TEXT,
  original_created_at TIMESTAMPTZ,
  original_updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by UUID
);

CREATE TABLE IF NOT EXISTS public.ai_messages_deleted (
  archived_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id UUID NOT NULL,
  chat_id UUID,
  chat_user_id UUID,
  prompt TEXT,
  response TEXT,
  original_created_at TIMESTAMPTZ,
  original_responded_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by UUID
);

CREATE INDEX IF NOT EXISTS idx_ai_chats_deleted_original_chat_id
  ON public.ai_chats_deleted(original_chat_id);

CREATE INDEX IF NOT EXISTS idx_ai_chats_deleted_user_deleted_at
  ON public.ai_chats_deleted(user_id, deleted_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_deleted_original_message_id
  ON public.ai_messages_deleted(original_message_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_deleted_chat_deleted_at
  ON public.ai_messages_deleted(chat_id, deleted_at DESC);

ALTER TABLE public.ai_chats_deleted ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages_deleted ENABLE ROW LEVEL SECURITY;

-- No RLS policies are created intentionally.
-- With RLS enabled and no policies, anon/authenticated cannot read or write rows.

REVOKE ALL ON TABLE public.ai_chats_deleted FROM anon, authenticated;
REVOKE ALL ON TABLE public.ai_messages_deleted FROM anon, authenticated;

GRANT SELECT ON TABLE public.ai_chats_deleted TO service_role;
GRANT SELECT ON TABLE public.ai_messages_deleted TO service_role;

CREATE OR REPLACE FUNCTION public.archive_deleted_ai_chat()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_chats_deleted (
    original_chat_id,
    user_id,
    title,
    original_created_at,
    original_updated_at,
    deleted_at,
    deleted_by
  ) VALUES (
    OLD.id,
    OLD.user_id,
    OLD.title,
    OLD.created_at,
    OLD.updated_at,
    NOW(),
    auth.uid()
  );

  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.archive_deleted_ai_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_user_id UUID;
BEGIN
  SELECT c.user_id INTO owner_user_id
  FROM public.ai_chats c
  WHERE c.id = OLD.chat_id;

  INSERT INTO public.ai_messages_deleted (
    original_message_id,
    chat_id,
    chat_user_id,
    prompt,
    response,
    original_created_at,
    original_responded_at,
    deleted_at,
    deleted_by
  ) VALUES (
    OLD.id,
    OLD.chat_id,
    owner_user_id,
    OLD.prompt,
    OLD.response,
    OLD.created_at,
    OLD.responded_at,
    NOW(),
    auth.uid()
  );

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_archive_deleted_ai_chat ON public.ai_chats;
CREATE TRIGGER trg_archive_deleted_ai_chat
  BEFORE DELETE ON public.ai_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.archive_deleted_ai_chat();

DROP TRIGGER IF EXISTS trg_archive_deleted_ai_message ON public.ai_messages;
CREATE TRIGGER trg_archive_deleted_ai_message
  BEFORE DELETE ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.archive_deleted_ai_message();

COMMIT;
