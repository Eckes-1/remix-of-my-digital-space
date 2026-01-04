-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true ));

-- Insert default categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('技术', 'tech', '技术相关文章'),
  ('生活', 'life', '生活随笔'),
  ('读书', 'reading', '读书笔记');

-- Add draft_content column to posts for auto-save
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS draft_content TEXT;

-- Update site_settings with new fields (blur and siteName)
-- Update existing hero settings to include blur
UPDATE public.site_settings 
SET value = jsonb_set(value, '{blur}', '70')
WHERE key = 'hero' AND NOT (value ? 'blur');

-- Insert site name setting if not exists
INSERT INTO public.site_settings (key, value)
VALUES ('site', '{"name": "墨迹随笔", "textReplacements": []}')
ON CONFLICT (key) DO NOTHING;