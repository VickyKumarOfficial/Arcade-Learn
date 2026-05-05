-- AI chat migration: switch ai_messages to prompt/response columns
-- Safe additive changes; no data is deleted.

BEGIN;

-- Ensure UUID generation is available.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- AI chat header table (idempotent create)
CREATE TABLE IF NOT EXISTS public.ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI message table (idempotent create)
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.ai_chats(id) ON DELETE CASCADE,
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Add prompt/response columns if table already exists with old schema
ALTER TABLE IF EXISTS public.ai_messages
  ADD COLUMN IF NOT EXISTS prompt TEXT;

ALTER TABLE IF EXISTS public.ai_messages
  ADD COLUMN IF NOT EXISTS response TEXT;

ALTER TABLE IF EXISTS public.ai_messages
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Backfill from legacy columns when possible (only if type/content exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ai_messages'
      AND column_name = 'content'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ai_messages'
      AND column_name = 'type'
  ) THEN
    EXECUTE 'UPDATE public.ai_messages SET prompt = content WHERE prompt IS NULL AND type = ''user''';
    EXECUTE 'UPDATE public.ai_messages SET response = content WHERE response IS NULL AND type = ''ai''';
  END IF;
END;
$$;

-- If response exists and responded_at is empty, set responded_at to created_at
UPDATE public.ai_messages
SET responded_at = created_at
WHERE response IS NOT NULL
  AND responded_at IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON public.ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_updated_at ON public.ai_chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_chat_id ON public.ai_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);

-- RLS
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- AI chats policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_chats' AND policyname = 'Users can view own chats'
  ) THEN
    CREATE POLICY "Users can view own chats" ON public.ai_chats
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_chats' AND policyname = 'Users can insert own chats'
  ) THEN
    CREATE POLICY "Users can insert own chats" ON public.ai_chats
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_chats' AND policyname = 'Users can update own chats'
  ) THEN
    CREATE POLICY "Users can update own chats" ON public.ai_chats
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_chats' AND policyname = 'Users can delete own chats'
  ) THEN
    CREATE POLICY "Users can delete own chats" ON public.ai_chats
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- AI messages policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_messages' AND policyname = 'Users can view messages from own chats'
  ) THEN
    CREATE POLICY "Users can view messages from own chats" ON public.ai_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.ai_chats
          WHERE ai_chats.id = ai_messages.chat_id
            AND ai_chats.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_messages' AND policyname = 'Users can insert messages to own chats'
  ) THEN
    CREATE POLICY "Users can insert messages to own chats" ON public.ai_messages
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.ai_chats
          WHERE ai_chats.id = ai_messages.chat_id
            AND ai_chats.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_messages' AND policyname = 'Users can update messages in own chats'
  ) THEN
    CREATE POLICY "Users can update messages in own chats" ON public.ai_messages
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.ai_chats
          WHERE ai_chats.id = ai_messages.chat_id
            AND ai_chats.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_messages' AND policyname = 'Users can delete messages from own chats'
  ) THEN
    CREATE POLICY "Users can delete messages from own chats" ON public.ai_messages
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.ai_chats
          WHERE ai_chats.id = ai_messages.chat_id
            AND ai_chats.user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

COMMIT;

-- Optional cleanup (run only after code is updated and old data is migrated):
-- ALTER TABLE public.ai_messages DROP COLUMN IF EXISTS type;
-- ALTER TABLE public.ai_messages DROP COLUMN IF EXISTS content;
