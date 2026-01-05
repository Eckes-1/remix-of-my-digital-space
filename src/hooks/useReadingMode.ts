import { useState, useCallback, useEffect } from 'react';

const FONT_SIZE_KEY = 'reading-mode-font-size';
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 24;
const DEFAULT_FONT_SIZE = 18;

export const useReadingMode = () => {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
    }
    return DEFAULT_FONT_SIZE;
  });

  // Apply font size to reading mode
  useEffect(() => {
    if (isReadingMode) {
      document.documentElement.style.setProperty('--reading-font-size', `${fontSize}px`);
    }
  }, [fontSize, isReadingMode]);

  const toggleReadingMode = useCallback(() => {
    setIsReadingMode(prev => {
      const newValue = !prev;
      document.body.classList.toggle('reading-mode', newValue);
      if (newValue) {
        document.documentElement.style.setProperty('--reading-font-size', `${fontSize}px`);
      }
      return newValue;
    });
  }, [fontSize]);

  const exitReadingMode = useCallback(() => {
    setIsReadingMode(false);
    document.body.classList.remove('reading-mode');
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const newSize = Math.min(prev + 1, MAX_FONT_SIZE);
      localStorage.setItem(FONT_SIZE_KEY, String(newSize));
      return newSize;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const newSize = Math.max(prev - 1, MIN_FONT_SIZE);
      localStorage.setItem(FONT_SIZE_KEY, String(newSize));
      return newSize;
    });
  }, []);

  const resetFontSize = useCallback(() => {
    setFontSize(DEFAULT_FONT_SIZE);
    localStorage.setItem(FONT_SIZE_KEY, String(DEFAULT_FONT_SIZE));
  }, []);

  return {
    isReadingMode,
    toggleReadingMode,
    exitReadingMode,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    minFontSize: MIN_FONT_SIZE,
    maxFontSize: MAX_FONT_SIZE,
  };
};
