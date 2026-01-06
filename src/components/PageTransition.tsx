import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnimationSettings } from '@/hooks/useAnimationStyle';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const { data: settings } = useAnimationSettings();

  const isEnabled = settings?.enablePageTransitions ?? true;
  const style = settings?.style || 'elegant';

  useEffect(() => {
    if (!isEnabled) {
      setDisplayChildren(children);
      return;
    }

    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, style === 'minimal' ? 150 : style === 'playful' ? 400 : 300);

    return () => clearTimeout(timer);
  }, [location.pathname, children, isEnabled, style]);

  if (!isEnabled) {
    return <>{children}</>;
  }

  const getTransitionClasses = () => {
    switch (style) {
      case 'playful':
        return isTransitioning 
          ? 'opacity-0 scale-95 rotate-1' 
          : 'opacity-100 scale-100 rotate-0';
      case 'tech':
        return isTransitioning 
          ? 'opacity-0 translate-x-4 skew-x-1' 
          : 'opacity-100 translate-x-0 skew-x-0';
      case 'minimal':
        return isTransitioning 
          ? 'opacity-0' 
          : 'opacity-100';
      case 'neon':
        return isTransitioning 
          ? 'opacity-0 scale-98 blur-sm brightness-150' 
          : 'opacity-100 scale-100 blur-0 brightness-100';
      case 'retro':
        return isTransitioning 
          ? 'opacity-0 scale-105 -rotate-1 hue-rotate-30' 
          : 'opacity-100 scale-100 rotate-0 hue-rotate-0';
      case 'aurora':
        return isTransitioning 
          ? 'opacity-0 translate-y-8 scale-98' 
          : 'opacity-100 translate-y-0 scale-100';
      case 'ink':
        return isTransitioning 
          ? 'opacity-0 scale-99' 
          : 'opacity-100 scale-100';
      default: // elegant
        return isTransitioning 
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0';
    }
  };

  const getDuration = () => {
    let baseDuration = 300;
    switch (style) {
      case 'minimal':
        baseDuration = 150;
        break;
      case 'playful':
      case 'neon':
        baseDuration = 400;
        break;
      case 'retro':
        baseDuration = 500;
        break;
      case 'aurora':
      case 'ink':
        baseDuration = 600;
        break;
    }
    const multiplier = settings?.animationSpeed === 'slow' ? 1.5 : 
                       settings?.animationSpeed === 'fast' ? 0.6 : 1;
    return baseDuration * multiplier;
  };

  return (
    <div
      className={cn(
        'transition-all',
        getTransitionClasses()
      )}
      style={{ transitionDuration: `${getDuration()}ms` }}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
