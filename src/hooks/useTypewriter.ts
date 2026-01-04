import { useState, useEffect } from 'react';

interface UseTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
}

export const useTypewriter = ({ text, speed = 100, delay = 0 }: UseTypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsTypingComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex >= text.length) {
      setIsTypingComplete(true);
      return;
    }

    const delayTimeout = currentIndex === 0 ? delay : 0;
    
    const timeout = setTimeout(() => {
      setDisplayText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, delayTimeout + speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, delay]);

  // isComplete is always false to keep cursor blinking
  return { displayText, isComplete: false, isTypingComplete };
};
