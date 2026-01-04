import { useState, useCallback } from 'react';

export const useReadingMode = () => {
  const [isReadingMode, setIsReadingMode] = useState(false);

  const toggleReadingMode = useCallback(() => {
    setIsReadingMode(prev => !prev);
    document.body.classList.toggle('reading-mode', !isReadingMode);
  }, [isReadingMode]);

  const exitReadingMode = useCallback(() => {
    setIsReadingMode(false);
    document.body.classList.remove('reading-mode');
  }, []);

  return {
    isReadingMode,
    toggleReadingMode,
    exitReadingMode,
  };
};
