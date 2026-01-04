-- Add scheduled_at column to posts for scheduled publishing
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- Create post_versions table for version history
CREATE TABLE public.post_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  read_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_versions
CREATE POLICY "Admins can manage post versions" ON public.post_versions
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Anyone can read post versions" ON public.post_versions
  FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_post_versions_post_id ON public.post_versions(post_id);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at) WHERE scheduled_at IS NOT NULL AND published = false;