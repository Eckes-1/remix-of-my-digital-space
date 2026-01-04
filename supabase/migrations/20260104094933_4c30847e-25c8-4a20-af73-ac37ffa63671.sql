-- Add lyrics field to music_tracks table for LRC lyrics support
ALTER TABLE public.music_tracks ADD COLUMN IF NOT EXISTS lyrics TEXT;