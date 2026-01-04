-- Add sort_order column for custom post ordering
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_posts_sort_order ON public.posts(sort_order DESC);