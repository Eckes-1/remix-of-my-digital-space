import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [phase, setPhase] = useState<'delay' | 'typing' | 'waiting' | 'deleting'>('delay');
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    // Reset on text change
    clearTimer();
    setDisplayText('');
    setPhase('delay');
    indexRef.current = 0;
  }, [text, clearTimer]);

  useEffect(() => {
    clearTimer();

    if (phase === 'delay') {
      timeoutRef.current = setTimeout(() => {
        setPhase('typing');
      }, delay);
      return;
    }

    if (phase === 'typing') {
      if (indexRef.current < text.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(text.slice(0, indexRef.current + 1));
          indexRef.current += 1;
        }, speed);
      } else {
        // Finished typing
        if (loop) {
          setPhase('waiting');
        }
      }
      return;
    }

    if (phase === 'waiting') {
      timeoutRef.current = setTimeout(() => {
        setPhase('deleting');
      }, loopDelay);
      return;
    }

    if (phase === 'deleting') {
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, speed / 2);
      } else {
        // Finished deleting, restart
        indexRef.current = 0;
        setPhase('typing');
      }
      return;
    }

    return clearTimer;
  }, [phase, text, speed, delay, loop, loopDelay, displayText.length, clearTimer]);

  return { displayText, isComplete: !loop && phase === 'typing' && indexRef.current >= text.length };
};
