import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface HeroSettings {
  title: string;
  description: string;
  badge: string;
  backgroundImage: string | null;
  backgroundType: 'gradient' | 'image';
  blur: number;
}

export interface SiteSettings {
  name: string;
}

export interface TypewriterSettings {
  enabled: boolean;
  titleSpeed: number;
  descSpeed: number;
  loop: boolean;
  loopDelay: number;
}

const useRealtimeSettings = (key: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`site-settings-${key}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: `key=eq.${key}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['site-settings', key] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [key, queryClient]);
};

export const useHeroSettings = () => {
  useRealtimeSettings('hero');

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
    staleTime: 30000,
  });
};

export const useTypewriterSettings = () => {
  useRealtimeSettings('typewriter');

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
    staleTime: 30000,
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

export const useSiteSettings = () => {
  useRealtimeSettings('site');

  return useQuery({
    queryKey: ['site-settings', 'site'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site')
        .single();
      
      if (error) throw error;
      return data.value as unknown as SiteSettings;
    },
    staleTime: 30000,
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.parse(JSON.stringify(settings)) })
        .eq('key', 'site');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'site'] });
    },
  });
};
