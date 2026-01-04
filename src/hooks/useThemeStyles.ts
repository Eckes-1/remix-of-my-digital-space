import { useEffect, useState, useCallback } from 'react';

export interface ThemeStyle {
  id: string;
  name: string;
  description: string;
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

// 10 predefined theme styles
export const THEME_STYLES: ThemeStyle[] = [
  {
    id: 'warm-cream',
    name: '暖奶油',
    description: '温暖的奶油色调，柔和舒适',
    colors: {
      light: {
        '--background': '40 30% 97%',
        '--foreground': '25 25% 15%',
        '--card': '40 25% 95%',
        '--card-foreground': '25 25% 15%',
        '--primary': '15 60% 50%',
        '--primary-foreground': '40 30% 97%',
        '--secondary': '40 20% 92%',
        '--secondary-foreground': '25 25% 20%',
        '--muted': '40 15% 90%',
        '--muted-foreground': '25 15% 45%',
        '--accent': '150 25% 45%',
        '--accent-foreground': '40 30% 97%',
        '--border': '30 20% 88%',
      },
      dark: {
        '--background': '25 20% 10%',
        '--foreground': '40 20% 92%',
        '--card': '25 18% 14%',
        '--card-foreground': '40 20% 92%',
        '--primary': '15 55% 55%',
        '--primary-foreground': '25 20% 10%',
        '--secondary': '25 15% 18%',
        '--secondary-foreground': '40 20% 92%',
        '--muted': '25 15% 20%',
        '--muted-foreground': '40 15% 60%',
        '--accent': '150 20% 40%',
        '--accent-foreground': '40 20% 92%',
        '--border': '25 15% 20%',
      },
    },
  },
  {
    id: 'ocean-blue',
    name: '海洋蓝',
    description: '清新的海洋蓝色调',
    colors: {
      light: {
        '--background': '210 40% 98%',
        '--foreground': '220 25% 15%',
        '--card': '210 35% 96%',
        '--card-foreground': '220 25% 15%',
        '--primary': '210 80% 50%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '210 25% 92%',
        '--secondary-foreground': '220 25% 20%',
        '--muted': '210 20% 90%',
        '--muted-foreground': '220 15% 45%',
        '--accent': '180 50% 45%',
        '--accent-foreground': '0 0% 100%',
        '--border': '210 25% 88%',
      },
      dark: {
        '--background': '220 25% 10%',
        '--foreground': '210 30% 92%',
        '--card': '220 22% 14%',
        '--card-foreground': '210 30% 92%',
        '--primary': '210 70% 55%',
        '--primary-foreground': '220 25% 10%',
        '--secondary': '220 20% 18%',
        '--secondary-foreground': '210 30% 92%',
        '--muted': '220 18% 20%',
        '--muted-foreground': '210 20% 60%',
        '--accent': '180 40% 40%',
        '--accent-foreground': '210 30% 92%',
        '--border': '220 18% 22%',
      },
    },
  },
  {
    id: 'forest-green',
    name: '森林绿',
    description: '自然的森林绿色调',
    colors: {
      light: {
        '--background': '120 20% 97%',
        '--foreground': '140 25% 15%',
        '--card': '120 18% 95%',
        '--card-foreground': '140 25% 15%',
        '--primary': '150 60% 40%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '120 15% 92%',
        '--secondary-foreground': '140 25% 20%',
        '--muted': '120 12% 90%',
        '--muted-foreground': '140 15% 45%',
        '--accent': '80 50% 45%',
        '--accent-foreground': '0 0% 100%',
        '--border': '120 15% 88%',
      },
      dark: {
        '--background': '140 20% 10%',
        '--foreground': '120 25% 92%',
        '--card': '140 18% 14%',
        '--card-foreground': '120 25% 92%',
        '--primary': '150 50% 45%',
        '--primary-foreground': '140 20% 10%',
        '--secondary': '140 15% 18%',
        '--secondary-foreground': '120 25% 92%',
        '--muted': '140 12% 20%',
        '--muted-foreground': '120 18% 60%',
        '--accent': '80 40% 40%',
        '--accent-foreground': '120 25% 92%',
        '--border': '140 12% 22%',
      },
    },
  },
  {
    id: 'sunset-orange',
    name: '日落橙',
    description: '温暖的日落橙色调',
    colors: {
      light: {
        '--background': '35 40% 97%',
        '--foreground': '25 30% 15%',
        '--card': '35 35% 95%',
        '--card-foreground': '25 30% 15%',
        '--primary': '25 90% 55%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '35 25% 92%',
        '--secondary-foreground': '25 30% 20%',
        '--muted': '35 20% 90%',
        '--muted-foreground': '25 18% 45%',
        '--accent': '45 80% 50%',
        '--accent-foreground': '25 30% 15%',
        '--border': '35 22% 88%',
      },
      dark: {
        '--background': '25 25% 10%',
        '--foreground': '35 30% 92%',
        '--card': '25 22% 14%',
        '--card-foreground': '35 30% 92%',
        '--primary': '25 80% 50%',
        '--primary-foreground': '25 25% 10%',
        '--secondary': '25 18% 18%',
        '--secondary-foreground': '35 30% 92%',
        '--muted': '25 15% 20%',
        '--muted-foreground': '35 22% 60%',
        '--accent': '45 70% 45%',
        '--accent-foreground': '25 25% 10%',
        '--border': '25 15% 22%',
      },
    },
  },
  {
    id: 'lavender-purple',
    name: '薰衣草紫',
    description: '优雅的薰衣草紫色调',
    colors: {
      light: {
        '--background': '270 30% 98%',
        '--foreground': '280 25% 15%',
        '--card': '270 25% 96%',
        '--card-foreground': '280 25% 15%',
        '--primary': '270 60% 55%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '270 20% 92%',
        '--secondary-foreground': '280 25% 20%',
        '--muted': '270 15% 90%',
        '--muted-foreground': '280 15% 45%',
        '--accent': '300 50% 50%',
        '--accent-foreground': '0 0% 100%',
        '--border': '270 18% 88%',
      },
      dark: {
        '--background': '280 22% 10%',
        '--foreground': '270 25% 92%',
        '--card': '280 20% 14%',
        '--card-foreground': '270 25% 92%',
        '--primary': '270 55% 55%',
        '--primary-foreground': '280 22% 10%',
        '--secondary': '280 18% 18%',
        '--secondary-foreground': '270 25% 92%',
        '--muted': '280 15% 20%',
        '--muted-foreground': '270 20% 60%',
        '--accent': '300 40% 45%',
        '--accent-foreground': '270 25% 92%',
        '--border': '280 15% 22%',
      },
    },
  },
  {
    id: 'rose-pink',
    name: '玫瑰粉',
    description: '浪漫的玫瑰粉色调',
    colors: {
      light: {
        '--background': '350 35% 98%',
        '--foreground': '340 25% 15%',
        '--card': '350 30% 96%',
        '--card-foreground': '340 25% 15%',
        '--primary': '340 70% 55%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '350 22% 92%',
        '--secondary-foreground': '340 25% 20%',
        '--muted': '350 18% 90%',
        '--muted-foreground': '340 15% 45%',
        '--accent': '320 60% 50%',
        '--accent-foreground': '0 0% 100%',
        '--border': '350 20% 88%',
      },
      dark: {
        '--background': '340 22% 10%',
        '--foreground': '350 28% 92%',
        '--card': '340 20% 14%',
        '--card-foreground': '350 28% 92%',
        '--primary': '340 60% 50%',
        '--primary-foreground': '340 22% 10%',
        '--secondary': '340 18% 18%',
        '--secondary-foreground': '350 28% 92%',
        '--muted': '340 15% 20%',
        '--muted-foreground': '350 20% 60%',
        '--accent': '320 50% 45%',
        '--accent-foreground': '350 28% 92%',
        '--border': '340 15% 22%',
      },
    },
  },
  {
    id: 'midnight-dark',
    name: '午夜黑',
    description: '深邃的午夜黑色调',
    colors: {
      light: {
        '--background': '0 0% 98%',
        '--foreground': '0 0% 12%',
        '--card': '0 0% 96%',
        '--card-foreground': '0 0% 12%',
        '--primary': '0 0% 20%',
        '--primary-foreground': '0 0% 98%',
        '--secondary': '0 0% 92%',
        '--secondary-foreground': '0 0% 18%',
        '--muted': '0 0% 90%',
        '--muted-foreground': '0 0% 45%',
        '--accent': '0 0% 35%',
        '--accent-foreground': '0 0% 98%',
        '--border': '0 0% 88%',
      },
      dark: {
        '--background': '0 0% 6%',
        '--foreground': '0 0% 92%',
        '--card': '0 0% 10%',
        '--card-foreground': '0 0% 92%',
        '--primary': '0 0% 80%',
        '--primary-foreground': '0 0% 6%',
        '--secondary': '0 0% 14%',
        '--secondary-foreground': '0 0% 92%',
        '--muted': '0 0% 18%',
        '--muted-foreground': '0 0% 60%',
        '--accent': '0 0% 70%',
        '--accent-foreground': '0 0% 6%',
        '--border': '0 0% 20%',
      },
    },
  },
  {
    id: 'sakura-bloom',
    name: '樱花粉',
    description: '清新的樱花粉色调',
    colors: {
      light: {
        '--background': '330 40% 98%',
        '--foreground': '330 20% 15%',
        '--card': '330 35% 96%',
        '--card-foreground': '330 20% 15%',
        '--primary': '330 65% 65%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '330 25% 92%',
        '--secondary-foreground': '330 20% 20%',
        '--muted': '330 20% 90%',
        '--muted-foreground': '330 12% 45%',
        '--accent': '350 55% 60%',
        '--accent-foreground': '0 0% 100%',
        '--border': '330 22% 88%',
      },
      dark: {
        '--background': '330 18% 10%',
        '--foreground': '330 30% 92%',
        '--card': '330 16% 14%',
        '--card-foreground': '330 30% 92%',
        '--primary': '330 55% 60%',
        '--primary-foreground': '330 18% 10%',
        '--secondary': '330 14% 18%',
        '--secondary-foreground': '330 30% 92%',
        '--muted': '330 12% 20%',
        '--muted-foreground': '330 22% 60%',
        '--accent': '350 45% 55%',
        '--accent-foreground': '330 30% 92%',
        '--border': '330 12% 22%',
      },
    },
  },
  {
    id: 'coffee-brown',
    name: '咖啡棕',
    description: '醇厚的咖啡棕色调',
    colors: {
      light: {
        '--background': '30 25% 97%',
        '--foreground': '25 35% 15%',
        '--card': '30 22% 95%',
        '--card-foreground': '25 35% 15%',
        '--primary': '25 50% 40%',
        '--primary-foreground': '30 25% 97%',
        '--secondary': '30 18% 92%',
        '--secondary-foreground': '25 35% 20%',
        '--muted': '30 15% 90%',
        '--muted-foreground': '25 20% 45%',
        '--accent': '35 45% 45%',
        '--accent-foreground': '30 25% 97%',
        '--border': '30 18% 88%',
      },
      dark: {
        '--background': '25 25% 8%',
        '--foreground': '30 22% 92%',
        '--card': '25 22% 12%',
        '--card-foreground': '30 22% 92%',
        '--primary': '25 45% 45%',
        '--primary-foreground': '25 25% 8%',
        '--secondary': '25 18% 16%',
        '--secondary-foreground': '30 22% 92%',
        '--muted': '25 15% 18%',
        '--muted-foreground': '30 18% 58%',
        '--accent': '35 40% 40%',
        '--accent-foreground': '30 22% 92%',
        '--border': '25 15% 20%',
      },
    },
  },
  {
    id: 'mint-fresh',
    name: '薄荷绿',
    description: '清新的薄荷绿色调',
    colors: {
      light: {
        '--background': '165 35% 97%',
        '--foreground': '170 25% 15%',
        '--card': '165 30% 95%',
        '--card-foreground': '170 25% 15%',
        '--primary': '165 55% 45%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '165 22% 92%',
        '--secondary-foreground': '170 25% 20%',
        '--muted': '165 18% 90%',
        '--muted-foreground': '170 15% 45%',
        '--accent': '150 50% 45%',
        '--accent-foreground': '0 0% 100%',
        '--border': '165 20% 88%',
      },
      dark: {
        '--background': '170 22% 10%',
        '--foreground': '165 28% 92%',
        '--card': '170 20% 14%',
        '--card-foreground': '165 28% 92%',
        '--primary': '165 50% 45%',
        '--primary-foreground': '170 22% 10%',
        '--secondary': '170 18% 18%',
        '--secondary-foreground': '165 28% 92%',
        '--muted': '170 15% 20%',
        '--muted-foreground': '165 20% 60%',
        '--accent': '150 45% 40%',
        '--accent-foreground': '165 28% 92%',
        '--border': '170 15% 22%',
      },
    },
  },
];

const STORAGE_KEY = 'site-theme-style';

export const useThemeStyles = () => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'warm-cream';
    }
    return 'warm-cream';
  });

  const applyTheme = useCallback((themeId: string) => {
    const theme = THEME_STYLES.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const colors = isDark ? theme.colors.dark : theme.colors.light;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  const setTheme = useCallback((themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem(STORAGE_KEY, themeId);
    applyTheme(themeId);
  }, [applyTheme]);

  // Apply theme on mount and when dark mode changes
  useEffect(() => {
    applyTheme(currentTheme);

    // Watch for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyTheme(currentTheme);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [currentTheme, applyTheme]);

  return {
    currentTheme,
    setTheme,
    themes: THEME_STYLES,
  };
};
