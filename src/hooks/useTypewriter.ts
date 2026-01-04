import { useState, useEffect } from 'react';

interface UseTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  loopDelay?: number;
}

export const useTypewriter = ({ 
  text, 
  speed = 100, 
  delay = 0, 
  loop = false,
  loopDelay = 2000 
}: UseTypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsDeleting(false);
    setIsWaiting(false);
  }, [text]);

  useEffect(() => {
    if (isWaiting) return;

    // Typing phase
    if (!isDeleting && currentIndex < text.length) {
      const delayTimeout = currentIndex === 0 && displayText === '' ? delay : 0;
      
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delayTimeout + speed);

      return () => clearTimeout(timeout);
    }

    // Finished typing - wait before deleting (if loop)
    if (!isDeleting && currentIndex >= text.length && loop) {
      setIsWaiting(true);
      const timeout = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, loopDelay);

      return () => clearTimeout(timeout);
    }

    // Deleting phase
    if (isDeleting && displayText.length > 0) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
      }, speed / 2);

      return () => clearTimeout(timeout);
    }

    // Finished deleting - restart
    if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentIndex(0);
    }
  }, [currentIndex, text, speed, delay, loop, loopDelay, isDeleting, displayText, isWaiting]);

  return { displayText, isComplete: false };
};
