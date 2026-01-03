-- Create post_likes table
CREATE TABLE public.post_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (post_id, user_ip)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
ON public.post_likes
FOR SELECT
USING (true);

-- Anyone can insert likes (one per IP per post)
CREATE POLICY "Anyone can insert likes"
ON public.post_likes
FOR INSERT
WITH CHECK (true);

-- Add like_count column to posts
ALTER TABLE public.posts ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;

-- Create function to increment like count
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id UUID, p_user_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if like exists
    SELECT EXISTS(
        SELECT 1 FROM public.post_likes 
        WHERE post_id = p_post_id AND user_ip = p_user_ip
    ) INTO v_exists;
    
    IF v_exists THEN
        -- Remove like
        DELETE FROM public.post_likes WHERE post_id = p_post_id AND user_ip = p_user_ip;
        UPDATE public.posts SET like_count = like_count - 1 WHERE id = p_post_id;
        RETURN FALSE;
    ELSE
        -- Add like
        INSERT INTO public.post_likes (post_id, user_ip) VALUES (p_post_id, p_user_ip);
        UPDATE public.posts SET like_count = like_count + 1 WHERE id = p_post_id;
        RETURN TRUE;
    END IF;
END;
$$;

-- Create function to check if user has liked a post
CREATE OR REPLACE FUNCTION public.has_liked_post(p_post_id UUID, p_user_ip TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.post_likes 
        WHERE post_id = p_post_id AND user_ip = p_user_ip
    );
$$;