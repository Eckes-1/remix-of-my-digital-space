-- Create music_tracks table for custom playlist management
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '未知艺术家',
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active tracks" 
ON public.music_tracks 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage tracks" 
ON public.music_tracks 
FOR ALL
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Create trigger for updated_at
CREATE TRIGGER update_music_tracks_updated_at
BEFORE UPDATE ON public.music_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();