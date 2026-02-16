-- Add 'contact' column to the 'members' table if it doesn't exist
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS contact TEXT;
