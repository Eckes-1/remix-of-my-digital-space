import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, createContext, useContext, useState, ReactNode } from 'react';

export type AnimationStyle = 'elegant' | 'playful' | 'tech' | 'minimal';

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
    // Hover effects
    cardHover: 'hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 ease-out',
    buttonHover: 'hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 ease-out',
    linkHover: 'hover:text-primary transition-colors duration-300',
    imageHover: 'hover:scale-105 transition-transform duration-700 ease-out',
    // Animations
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
    // Special effects
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
};

// Speed multipliers
export const speedMultipliers = {
  slow: 1.5,
  normal: 1,
  fast: 0.6,
};

// Context for animation settings
interface AnimationContextType {
  settings: AnimationSettings;
  updateSettings: (settings: Partial<AnimationSettings>) => void;
  getAnimationClass: (type: keyof typeof animationClasses.elegant) => string;
  isScrollAnimationEnabled: boolean;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const useAnimationSettings = () => {
  const queryClient = useQueryClient();

  // Listen for realtime changes
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
        // Return default settings if not found
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
      // First check if the setting exists
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

// Hook to get animation classes based on current style
export const useAnimationClasses = () => {
  const { data: settings } = useAnimationSettings();
  const style = settings?.style || 'elegant';
  const classes = animationClasses[style];
  
  return {
    ...classes,
    style,
    settings: settings || defaultSettings,
  };
};
