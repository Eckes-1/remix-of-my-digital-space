import { useEffect } from 'react';
import { THEME_STYLES } from '@/hooks/useThemeStyles';

const STORAGE_KEY = 'site-theme-style';

// Initialize theme styles on app load
const ThemeStyleInitializer = () => {
  useEffect(() => {
    const applyStoredTheme = () => {
      const storedThemeId = localStorage.getItem(STORAGE_KEY) || 'warm-cozy';
      const theme = THEME_STYLES.find(t => t.id === storedThemeId);
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

      // Apply data attributes for CSS hooks
      root.dataset.spacing = theme.spacing;
      root.dataset.shadows = theme.shadows;
      root.dataset.animations = theme.animations;
      root.dataset.cardStyle = theme.cardStyle;
      root.dataset.buttonStyle = theme.buttonStyle;
    };

    // Apply on mount
    applyStoredTheme();

    // Watch for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyStoredTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default ThemeStyleInitializer;
