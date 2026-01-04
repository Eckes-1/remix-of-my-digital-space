-- Create site_settings table for managing hero and typewriter content
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings" 
ON public.site_settings 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES 
  ('hero', '{"title": "墨迹随笔", "description": "在这里，我分享关于技术、生活与思考的点滴。每一篇文章，都是一段旅程的记录。", "badge": "欢迎来到我的博客", "backgroundImage": null, "backgroundType": "gradient"}'),
  ('typewriter', '{"enabled": true, "titleSpeed": 200, "descSpeed": 80, "loop": true, "loopDelay": 3000}');

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();