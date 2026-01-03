import { useState, useEffect } from 'react';

interface UseTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
}

export const useTypewriter = ({ text, speed = 50, delay = 0 }: UseTypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
};
