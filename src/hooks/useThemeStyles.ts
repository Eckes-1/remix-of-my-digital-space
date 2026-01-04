import { useEffect, useState, useCallback } from 'react';

export interface ThemeStyle {
  id: string;
  name: string;
  description: string;
  // Visual style properties
  fontFamily: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  spacing: 'compact' | 'normal' | 'spacious';
  shadows: 'none' | 'subtle' | 'medium' | 'dramatic';
  animations: 'none' | 'minimal' | 'smooth' | 'playful';
  cardStyle: 'flat' | 'elevated' | 'bordered' | 'glass';
  buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient';
  // Color palette
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

// 10 distinctly different theme styles with real layout/typography/visual differences
export const THEME_STYLES: ThemeStyle[] = [
  {
    id: 'classic-editorial',
    name: '经典报刊',
    description: '传统报刊风格，衬线字体，优雅大气',
    fontFamily: {
      heading: "'Noto Serif SC', 'Georgia', serif",
      body: "'Noto Serif SC', 'Georgia', serif",
    },
    borderRadius: '0.25rem',
    spacing: 'spacious',
    shadows: 'none',
    animations: 'minimal',
    cardStyle: 'bordered',
    buttonStyle: 'outline',
    colors: {
      light: {
        '--background': '45 30% 96%',
        '--foreground': '30 10% 15%',
        '--card': '45 25% 94%',
        '--card-foreground': '30 10% 15%',
        '--primary': '30 40% 35%',
        '--primary-foreground': '45 30% 96%',
        '--secondary': '45 15% 90%',
        '--secondary-foreground': '30 10% 20%',
        '--muted': '45 10% 88%',
        '--muted-foreground': '30 8% 45%',
        '--accent': '15 50% 45%',
        '--accent-foreground': '45 30% 96%',
        '--border': '30 15% 80%',
      },
      dark: {
        '--background': '30 15% 10%',
        '--foreground': '45 20% 90%',
        '--card': '30 12% 14%',
        '--card-foreground': '45 20% 90%',
        '--primary': '40 35% 55%',
        '--primary-foreground': '30 15% 10%',
        '--secondary': '30 10% 18%',
        '--secondary-foreground': '45 20% 90%',
        '--muted': '30 8% 22%',
        '--muted-foreground': '45 12% 60%',
        '--accent': '15 40% 50%',
        '--accent-foreground': '45 20% 90%',
        '--border': '30 10% 25%',
      },
    },
  },
  {
    id: 'modern-minimal',
    name: '现代极简',
    description: '无衬线字体，大量留白，极简主义',
    fontFamily: {
      heading: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      body: "'Inter', 'SF Pro Text', system-ui, sans-serif",
    },
    borderRadius: '0',
    spacing: 'spacious',
    shadows: 'none',
    animations: 'minimal',
    cardStyle: 'flat',
    buttonStyle: 'solid',
    colors: {
      light: {
        '--background': '0 0% 100%',
        '--foreground': '0 0% 8%',
        '--card': '0 0% 98%',
        '--card-foreground': '0 0% 8%',
        '--primary': '0 0% 12%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '0 0% 94%',
        '--secondary-foreground': '0 0% 15%',
        '--muted': '0 0% 92%',
        '--muted-foreground': '0 0% 45%',
        '--accent': '0 0% 20%',
        '--accent-foreground': '0 0% 100%',
        '--border': '0 0% 90%',
      },
      dark: {
        '--background': '0 0% 4%',
        '--foreground': '0 0% 95%',
        '--card': '0 0% 8%',
        '--card-foreground': '0 0% 95%',
        '--primary': '0 0% 90%',
        '--primary-foreground': '0 0% 4%',
        '--secondary': '0 0% 12%',
        '--secondary-foreground': '0 0% 95%',
        '--muted': '0 0% 15%',
        '--muted-foreground': '0 0% 55%',
        '--accent': '0 0% 85%',
        '--accent-foreground': '0 0% 4%',
        '--border': '0 0% 18%',
      },
    },
  },
  {
    id: 'soft-rounded',
    name: '柔和圆润',
    description: '大圆角，柔和阴影，温馨可爱',
    fontFamily: {
      heading: "'Nunito', 'Rounded Mplus 1c', sans-serif",
      body: "'Nunito', 'Rounded Mplus 1c', sans-serif",
    },
    borderRadius: '1.5rem',
    spacing: 'normal',
    shadows: 'medium',
    animations: 'smooth',
    cardStyle: 'elevated',
    buttonStyle: 'solid',
    colors: {
      light: {
        '--background': '280 30% 98%',
        '--foreground': '270 20% 20%',
        '--card': '0 0% 100%',
        '--card-foreground': '270 20% 20%',
        '--primary': '280 60% 60%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '280 25% 94%',
        '--secondary-foreground': '270 20% 25%',
        '--muted': '280 20% 92%',
        '--muted-foreground': '270 12% 50%',
        '--accent': '320 55% 55%',
        '--accent-foreground': '0 0% 100%',
        '--border': '280 20% 88%',
      },
      dark: {
        '--background': '270 20% 12%',
        '--foreground': '280 25% 92%',
        '--card': '270 18% 16%',
        '--card-foreground': '280 25% 92%',
        '--primary': '280 55% 60%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '270 15% 20%',
        '--secondary-foreground': '280 25% 92%',
        '--muted': '270 12% 24%',
        '--muted-foreground': '280 18% 60%',
        '--accent': '320 50% 55%',
        '--accent-foreground': '0 0% 100%',
        '--border': '270 12% 28%',
      },
    },
  },
  {
    id: 'brutalist',
    name: '粗野主义',
    description: '粗犷边框，强对比，反传统设计',
    fontFamily: {
      heading: "'JetBrains Mono', 'Courier New', monospace",
      body: "'Space Mono', 'Courier New', monospace",
    },
    borderRadius: '0',
    spacing: 'compact',
    shadows: 'dramatic',
    animations: 'none',
    cardStyle: 'bordered',
    buttonStyle: 'solid',
    colors: {
      light: {
        '--background': '60 10% 95%',
        '--foreground': '0 0% 5%',
        '--card': '60 15% 92%',
        '--card-foreground': '0 0% 5%',
        '--primary': '0 0% 0%',
        '--primary-foreground': '60 10% 95%',
        '--secondary': '60 8% 88%',
        '--secondary-foreground': '0 0% 8%',
        '--muted': '60 6% 85%',
        '--muted-foreground': '0 0% 35%',
        '--accent': '45 100% 50%',
        '--accent-foreground': '0 0% 0%',
        '--border': '0 0% 0%',
      },
      dark: {
        '--background': '0 0% 5%',
        '--foreground': '60 10% 95%',
        '--card': '0 0% 10%',
        '--card-foreground': '60 10% 95%',
        '--primary': '60 10% 95%',
        '--primary-foreground': '0 0% 5%',
        '--secondary': '0 0% 15%',
        '--secondary-foreground': '60 10% 95%',
        '--muted': '0 0% 20%',
        '--muted-foreground': '60 5% 60%',
        '--accent': '45 100% 50%',
        '--accent-foreground': '0 0% 0%',
        '--border': '60 10% 95%',
      },
    },
  },
  {
    id: 'glass-modern',
    name: '玻璃拟态',
    description: '毛玻璃效果，透明层次，科技感',
    fontFamily: {
      heading: "'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
      body: "'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
    },
    borderRadius: '1rem',
    spacing: 'normal',
    shadows: 'subtle',
    animations: 'smooth',
    cardStyle: 'glass',
    buttonStyle: 'ghost',
    colors: {
      light: {
        '--background': '220 25% 97%',
        '--foreground': '220 20% 15%',
        '--card': '0 0% 100%',
        '--card-foreground': '220 20% 15%',
        '--primary': '220 80% 55%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '220 20% 94%',
        '--secondary-foreground': '220 20% 20%',
        '--muted': '220 15% 91%',
        '--muted-foreground': '220 12% 48%',
        '--accent': '260 70% 55%',
        '--accent-foreground': '0 0% 100%',
        '--border': '220 15% 88%',
      },
      dark: {
        '--background': '220 25% 8%',
        '--foreground': '220 20% 92%',
        '--card': '220 22% 12%',
        '--card-foreground': '220 20% 92%',
        '--primary': '220 75% 60%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '220 18% 16%',
        '--secondary-foreground': '220 20% 92%',
        '--muted': '220 15% 20%',
        '--muted-foreground': '220 15% 58%',
        '--accent': '260 65% 60%',
        '--accent-foreground': '0 0% 100%',
        '--border': '220 15% 22%',
      },
    },
  },
  {
    id: 'nature-organic',
    name: '自然有机',
    description: '自然色调，有机形状，回归本真',
    fontFamily: {
      heading: "'Playfair Display', 'Georgia', serif",
      body: "'Source Sans Pro', 'Helvetica Neue', sans-serif",
    },
    borderRadius: '2rem 0.5rem',
    spacing: 'spacious',
    shadows: 'subtle',
    animations: 'smooth',
    cardStyle: 'elevated',
    buttonStyle: 'solid',
    colors: {
      light: {
        '--background': '80 25% 96%',
        '--foreground': '100 20% 18%',
        '--card': '80 20% 94%',
        '--card-foreground': '100 20% 18%',
        '--primary': '140 45% 40%',
        '--primary-foreground': '80 25% 96%',
        '--secondary': '80 18% 90%',
        '--secondary-foreground': '100 20% 22%',
        '--muted': '80 12% 88%',
        '--muted-foreground': '100 12% 45%',
        '--accent': '30 60% 50%',
        '--accent-foreground': '0 0% 100%',
        '--border': '80 15% 82%',
      },
      dark: {
        '--background': '100 18% 10%',
        '--foreground': '80 20% 90%',
        '--card': '100 15% 14%',
        '--card-foreground': '80 20% 90%',
        '--primary': '140 40% 45%',
        '--primary-foreground': '100 18% 10%',
        '--secondary': '100 12% 18%',
        '--secondary-foreground': '80 20% 90%',
        '--muted': '100 10% 22%',
        '--muted-foreground': '80 15% 58%',
        '--accent': '30 55% 50%',
        '--accent-foreground': '0 0% 100%',
        '--border': '100 10% 25%',
      },
    },
  },
  {
    id: 'neon-cyberpunk',
    name: '霓虹朋克',
    description: '霓虹色彩，赛博朋克，未来科技',
    fontFamily: {
      heading: "'Orbitron', 'Rajdhani', sans-serif",
      body: "'Rajdhani', 'Exo 2', sans-serif",
    },
    borderRadius: '0.5rem',
    spacing: 'compact',
    shadows: 'dramatic',
    animations: 'playful',
    cardStyle: 'bordered',
    buttonStyle: 'gradient',
    colors: {
      light: {
        '--background': '260 20% 95%',
        '--foreground': '280 30% 15%',
        '--card': '260 25% 92%',
        '--card-foreground': '280 30% 15%',
        '--primary': '300 90% 50%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '260 20% 88%',
        '--secondary-foreground': '280 30% 20%',
        '--muted': '260 15% 85%',
        '--muted-foreground': '280 15% 45%',
        '--accent': '180 100% 45%',
        '--accent-foreground': '0 0% 0%',
        '--border': '300 50% 70%',
      },
      dark: {
        '--background': '280 30% 5%',
        '--foreground': '300 20% 92%',
        '--card': '280 25% 10%',
        '--card-foreground': '300 20% 92%',
        '--primary': '300 100% 55%',
        '--primary-foreground': '0 0% 0%',
        '--secondary': '280 20% 15%',
        '--secondary-foreground': '300 20% 92%',
        '--muted': '280 18% 18%',
        '--muted-foreground': '300 15% 55%',
        '--accent': '180 100% 50%',
        '--accent-foreground': '0 0% 0%',
        '--border': '300 60% 40%',
      },
    },
  },
  {
    id: 'warm-cozy',
    name: '暖意融融',
    description: '暖色调，舒适感，温馨氛围',
    fontFamily: {
      heading: "'Noto Serif SC', 'Georgia', serif",
      body: "'Inter', system-ui, sans-serif",
    },
    borderRadius: '0.75rem',
    spacing: 'normal',
    shadows: 'medium',
    animations: 'smooth',
    cardStyle: 'elevated',
    buttonStyle: 'solid',
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
    id: 'ocean-breeze',
    name: '海风清新',
    description: '蓝绿色调，清爽通透，海洋气息',
    fontFamily: {
      heading: "'Poppins', 'Helvetica Neue', sans-serif",
      body: "'Open Sans', 'Helvetica Neue', sans-serif",
    },
    borderRadius: '1rem',
    spacing: 'normal',
    shadows: 'subtle',
    animations: 'smooth',
    cardStyle: 'elevated',
    buttonStyle: 'solid',
    colors: {
      light: {
        '--background': '195 40% 97%',
        '--foreground': '200 25% 15%',
        '--card': '0 0% 100%',
        '--card-foreground': '200 25% 15%',
        '--primary': '195 75% 45%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '195 25% 92%',
        '--secondary-foreground': '200 25% 20%',
        '--muted': '195 18% 90%',
        '--muted-foreground': '200 15% 45%',
        '--accent': '165 60% 40%',
        '--accent-foreground': '0 0% 100%',
        '--border': '195 22% 86%',
      },
      dark: {
        '--background': '200 28% 10%',
        '--foreground': '195 25% 92%',
        '--card': '200 24% 14%',
        '--card-foreground': '195 25% 92%',
        '--primary': '195 70% 50%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '200 20% 18%',
        '--secondary-foreground': '195 25% 92%',
        '--muted': '200 18% 22%',
        '--muted-foreground': '195 18% 58%',
        '--accent': '165 55% 45%',
        '--accent-foreground': '0 0% 100%',
        '--border': '200 18% 25%',
      },
    },
  },
  {
    id: 'luxury-gold',
    name: '奢华金韵',
    description: '金色点缀，高端大气，尊贵典雅',
    fontFamily: {
      heading: "'Cinzel', 'Times New Roman', serif",
      body: "'Lato', 'Helvetica Neue', sans-serif",
    },
    borderRadius: '0.25rem',
    spacing: 'spacious',
    shadows: 'medium',
    animations: 'minimal',
    cardStyle: 'bordered',
    buttonStyle: 'gradient',
    colors: {
      light: {
        '--background': '40 15% 96%',
        '--foreground': '40 10% 15%',
        '--card': '40 12% 94%',
        '--card-foreground': '40 10% 15%',
        '--primary': '45 80% 45%',
        '--primary-foreground': '40 10% 10%',
        '--secondary': '40 10% 90%',
        '--secondary-foreground': '40 10% 20%',
        '--muted': '40 8% 88%',
        '--muted-foreground': '40 8% 45%',
        '--accent': '25 70% 40%',
        '--accent-foreground': '40 15% 96%',
        '--border': '45 40% 75%',
      },
      dark: {
        '--background': '40 15% 8%',
        '--foreground': '40 15% 92%',
        '--card': '40 12% 12%',
        '--card-foreground': '40 15% 92%',
        '--primary': '45 75% 50%',
        '--primary-foreground': '40 15% 8%',
        '--secondary': '40 10% 16%',
        '--secondary-foreground': '40 15% 92%',
        '--muted': '40 8% 20%',
        '--muted-foreground': '40 12% 58%',
        '--accent': '25 65% 45%',
        '--accent-foreground': '40 15% 92%',
        '--border': '45 35% 30%',
      },
    },
  },
];

const STORAGE_KEY = 'site-theme-style';

export const useThemeStyles = () => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'warm-cozy';
    }
    return 'warm-cozy';
  });

  const applyTheme = useCallback((themeId: string) => {
    const theme = THEME_STYLES.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const colors = isDark ? theme.colors.dark : theme.colors.light;

    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply typography
    root.style.setProperty('--font-heading', theme.fontFamily.heading);
    root.style.setProperty('--font-body', theme.fontFamily.body);

    // Apply border radius
    root.style.setProperty('--radius', theme.borderRadius);

    // Apply spacing class
    root.dataset.spacing = theme.spacing;

    // Apply shadow intensity class
    root.dataset.shadows = theme.shadows;

    // Apply animation class
    root.dataset.animations = theme.animations;

    // Apply card style class
    root.dataset.cardStyle = theme.cardStyle;

    // Apply button style class
    root.dataset.buttonStyle = theme.buttonStyle;

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
