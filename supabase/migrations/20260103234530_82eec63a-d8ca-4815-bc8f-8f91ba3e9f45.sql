-- Add view_count column to posts table
ALTER TABLE public.posts ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(post_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE slug = post_slug AND published = true;
END;
$$;