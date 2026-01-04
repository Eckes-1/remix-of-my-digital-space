import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'reading-progress';

interface ReadingProgressData {
  [slug: string]: {
    progress: number;
    scrollPosition: number;
    lastRead: string;
  };
}

export const useReadingProgress = (slug: string | undefined) => {
  // Get saved progress for a specific post
  const getSavedProgress = useCallback((postSlug: string): number | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed: ReadingProgressData = JSON.parse(data);
      return parsed[postSlug]?.scrollPosition || null;
    } catch {
      return null;
    }
  }, []);

  // Save current reading progress
  const saveProgress = useCallback((postSlug: string, scrollPosition: number, progress: number) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed: ReadingProgressData = data ? JSON.parse(data) : {};
      
      parsed[postSlug] = {
        progress,
        scrollPosition,
        lastRead: new Date().toISOString(),
      };
      
      // Keep only last 50 posts to avoid localStorage bloat
      const entries = Object.entries(parsed);
      if (entries.length > 50) {
        const sorted = entries.sort((a, b) => 
          new Date(b[1].lastRead).getTime() - new Date(a[1].lastRead).getTime()
        );
        const trimmed = Object.fromEntries(sorted.slice(0, 50));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      // Silent fail for localStorage errors
    }
  }, []);

  // Clear progress for a post
  const clearProgress = useCallback((postSlug: string) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return;
      const parsed: ReadingProgressData = JSON.parse(data);
      delete parsed[postSlug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      // Silent fail
    }
  }, []);

  // Auto-save progress on scroll
  useEffect(() => {
    if (!slug) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        
        // Only save if user has scrolled past 5%
        if (progress > 5) {
          saveProgress(slug, scrollTop, progress);
        }
        
        // Clear progress if user finished reading (95%+)
        if (progress >= 95) {
          clearProgress(slug);
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [slug, saveProgress, clearProgress]);

  return {
    getSavedProgress,
    saveProgress,
    clearProgress,
  };
};

export const getLastReadProgress = (slug: string): { progress: number; lastRead: string } | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed: ReadingProgressData = JSON.parse(data);
    const entry = parsed[slug];
    if (!entry) return null;
    return { progress: entry.progress, lastRead: entry.lastRead };
  } catch {
    return null;
  }
};

