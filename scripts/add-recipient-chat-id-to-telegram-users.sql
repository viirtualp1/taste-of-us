-- Store recipient Telegram Chat ID in telegram_users (Profile settings / send-menu).
-- Run in Supabase Dashboard → SQL Editor if the column is missing.

ALTER TABLE telegram_users
ADD COLUMN IF NOT EXISTS recipient_telegram_chat_id TEXT;
