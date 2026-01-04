import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSettings {
  title: string;
  description: string;
  badge: string;
  backgroundImage: string | null;
  backgroundType: 'gradient' | 'image';
}

export interface TypewriterSettings {
  enabled: boolean;
  titleSpeed: number;
  descSpeed: number;
  loop: boolean;
  loopDelay: number;
}

export const useHeroSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero')
        .single();
      
      if (error) throw error;
      return data.value as unknown as HeroSettings;
    },
  });
};

export const useTypewriterSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'typewriter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'typewriter')
        .single();
      
      if (error) throw error;
      return data.value as unknown as TypewriterSettings;
    },
  });
};

export const useUpdateHeroSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: HeroSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.parse(JSON.stringify(settings)) })
        .eq('key', 'hero');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'hero'] });
    },
  });
};

export const useUpdateTypewriterSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: TypewriterSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.parse(JSON.stringify(settings)) })
        .eq('key', 'typewriter');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'typewriter'] });
    },
  });
};
