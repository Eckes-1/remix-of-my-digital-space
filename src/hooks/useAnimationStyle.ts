import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export type AnimationStyle = 'elegant' | 'playful' | 'tech' | 'minimal' | 'neon' | 'retro' | 'aurora' | 'ink';

export interface AnimationSettings {
  style: AnimationStyle;
  enableScrollAnimations: boolean;
  enablePageTransitions: boolean;
  enableHoverEffects: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

const defaultSettings: AnimationSettings = {
  style: 'elegant',
  enableScrollAnimations: true,
  enablePageTransitions: true,
  enableHoverEffects: true,
  animationSpeed: 'normal',
};

// Animation class mappings for different styles
export const animationClasses = {
  elegant: {
    cardHover: 'hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 ease-out',
    buttonHover: 'hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 ease-out',
    linkHover: 'hover:text-primary transition-colors duration-300',
    imageHover: 'hover:scale-105 transition-transform duration-700 ease-out',
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
    glow: 'hover:shadow-primary/30',
    underline: 'relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-300',
  },
  playful: {
    cardHover: 'hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 hover:rotate-1 transition-all duration-300',
    buttonHover: 'hover:shadow-xl hover:shadow-accent/30 hover:scale-105 active:scale-95 transition-all duration-200',
    linkHover: 'hover:text-accent hover:scale-105 transition-all duration-200',
    imageHover: 'hover:scale-110 hover:rotate-2 transition-all duration-500',
    fadeIn: 'animate-bounce-in',
    slideUp: 'animate-slide-up-bounce',
    scaleIn: 'animate-pop-in',
    glow: 'hover:shadow-accent/40',
    underline: 'relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all after:duration-200',
  },
  tech: {
    cardHover: 'hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 hover:border-cyan-500/50 transition-all duration-300',
    buttonHover: 'hover:shadow-lg hover:shadow-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-purple-500/10',
    linkHover: 'hover:text-cyan-400 transition-colors duration-200',
    imageHover: 'hover:scale-105 hover:brightness-110 transition-all duration-500',
    fadeIn: 'animate-glitch-in',
    slideUp: 'animate-slide-up-tech',
    scaleIn: 'animate-scale-in',
    glow: 'hover:shadow-cyan-500/30',
    underline: 'relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gradient-to-r after:from-cyan-400 after:to-purple-400 hover:after:w-full after:transition-all after:duration-300',
  },
  minimal: {
    cardHover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    buttonHover: 'hover:opacity-80 transition-opacity duration-150',
    linkHover: 'hover:opacity-70 transition-opacity duration-150',
    imageHover: 'hover:opacity-90 transition-opacity duration-300',
    fadeIn: 'animate-fade-in-subtle',
    slideUp: 'animate-fade-in-subtle',
    scaleIn: 'animate-fade-in-subtle',
    glow: '',
    underline: 'hover:underline',
  },
  // New: Neon Cyberpunk style
  neon: {
    cardHover: 'card-hover-neon',
    buttonHover: 'button-hover-neon',
    linkHover: 'hover:text-pink-400 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] transition-all duration-200',
    imageHover: 'hover:scale-105 hover:saturate-150 hover:contrast-110 transition-all duration-500',
    fadeIn: 'animate-neon-flicker',
    slideUp: 'animate-slide-up-neon',
    scaleIn: 'animate-neon-pulse-in',
    glow: 'hover:shadow-pink-500/50',
    underline: 'relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-pink-500 after:via-purple-500 after:to-cyan-500 hover:after:w-full after:transition-all after:duration-300 after:shadow-[0_0_10px_rgba(236,72,153,0.8)]',
  },
  // New: Retro/Vaporwave style
  retro: {
    cardHover: 'card-hover-retro',
    buttonHover: 'button-hover-retro',
    linkHover: 'hover:text-fuchsia-400 transition-all duration-300',
    imageHover: 'hover:scale-105 hover:hue-rotate-30 transition-all duration-700',
    fadeIn: 'animate-retro-fade',
    slideUp: 'animate-retro-slide',
    scaleIn: 'animate-retro-zoom',
    glow: 'hover:shadow-fuchsia-500/40',
    underline: 'relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:bg-gradient-to-r after:from-fuchsia-500 after:to-cyan-400 hover:after:w-full after:transition-all after:duration-500',
  },
  // New: Aurora/Northern lights style
  aurora: {
    cardHover: 'card-hover-aurora',
    buttonHover: 'button-hover-aurora',
    linkHover: 'hover:text-emerald-400 transition-all duration-400',
    imageHover: 'hover:scale-102 hover:brightness-110 transition-all duration-1000 ease-out',
    fadeIn: 'animate-aurora-fade',
    slideUp: 'animate-aurora-rise',
    scaleIn: 'animate-aurora-bloom',
    glow: 'hover:shadow-emerald-500/30',
    underline: 'relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:via-teal-400 after:to-cyan-400 hover:after:w-full after:transition-all after:duration-500',
  },
  // New: Ink/Brush stroke style (Chinese calligraphy inspired)
  ink: {
    cardHover: 'card-hover-ink',
    buttonHover: 'button-hover-ink',
    linkHover: 'hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-300',
    imageHover: 'hover:scale-102 hover:grayscale-[20%] transition-all duration-700',
    fadeIn: 'animate-ink-spread',
    slideUp: 'animate-ink-brush',
    scaleIn: 'animate-ink-drop',
    glow: '',
    underline: 'relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-foreground hover:after:w-full after:transition-all after:duration-700 after:ease-[cubic-bezier(0.22,1,0.36,1)]',
  },
};

// Speed multipliers
export const speedMultipliers = {
  slow: 1.5,
  normal: 1,
  fast: 0.6,
};

export const useAnimationSettings = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('animation-settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.animation' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['site-settings', 'animation'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['site-settings', 'animation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'animation')
        .single();
      
      if (error) {
        return defaultSettings;
      }
      return data.value as unknown as AnimationSettings;
    },
    staleTime: 30000,
  });
};

export const useUpdateAnimationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: AnimationSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'animation')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: JSON.parse(JSON.stringify(settings)) })
          .eq('key', 'animation');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: 'animation', value: JSON.parse(JSON.stringify(settings)) });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'animation'] });
    },
  });
};

export const useAnimationClasses = () => {
  const { data: settings } = useAnimationSettings();
  const style = settings?.style || 'elegant';
  const classes = animationClasses[style] || animationClasses.elegant;
  
  return {
    ...classes,
    style,
    settings: settings || defaultSettings,
  };
};
