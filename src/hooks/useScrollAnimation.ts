import { useEffect, useRef, useState, RefObject } from 'react';
import { useAnimationSettings } from './useAnimationStyle';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export const useScrollAnimation = <T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T>, boolean] => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { data: settings } = useAnimationSettings();

  useEffect(() => {
    // If scroll animations are disabled, just show the element
    if (settings && !settings.enableScrollAnimations) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, delay, settings]);

  return [ref, isVisible];
};

// Hook for staggered animations (for lists)
export const useStaggeredAnimation = (
  itemCount: number,
  baseDelay: number = 100
) => {
  const { data: settings } = useAnimationSettings();
  
  const getDelay = (index: number) => {
    if (settings && !settings.enableScrollAnimations) {
      return 0;
    }
    const speedMultiplier = settings?.animationSpeed === 'slow' ? 1.5 : 
                            settings?.animationSpeed === 'fast' ? 0.6 : 1;
    return index * baseDelay * speedMultiplier;
  };

  return { getDelay };
};
