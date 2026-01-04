-- Add admin reply columns to comments table
ALTER TABLE public.comments 
ADD COLUMN admin_reply text,
ADD COLUMN replied_at timestamp with time zone,
ADD COLUMN replied_by uuid REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX idx_comments_replied_at ON public.comments(replied_at);