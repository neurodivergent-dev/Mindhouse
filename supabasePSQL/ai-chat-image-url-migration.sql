-- AI Chat Image URL Migration
-- Adds image_url column to store generated (Pollinations) image links per message
ALTER TABLE ai_chat_history ADD COLUMN IF NOT EXISTS image_url TEXT;
