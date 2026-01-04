-- Create authors table for multi-author support
CREATE TABLE public.authors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add author_id to posts table
ALTER TABLE public.posts ADD COLUMN author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL;

-- Enable RLS on authors
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- RLS policies for authors
CREATE POLICY "Anyone can read authors" 
ON public.authors 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage authors" 
ON public.authors 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Create index for performance
CREATE INDEX idx_posts_author_id ON public.posts(author_id);