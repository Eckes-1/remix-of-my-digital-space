import { useEffect } from 'react';
import { THEME_STYLES } from '@/hooks/useThemeStyles';

const STORAGE_KEY = 'site-theme-style';

// Initialize theme styles on app load
const ThemeStyleInitializer = () => {
  useEffect(() => {
    const applyStoredTheme = () => {
      const storedThemeId = localStorage.getItem(STORAGE_KEY) || 'warm-cream';
      const theme = THEME_STYLES.find(t => t.id === storedThemeId);
      if (!theme) return;

      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      const colors = isDark ? theme.colors.dark : theme.colors.light;

      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
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
