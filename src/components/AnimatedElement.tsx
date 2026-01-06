import { ReactNode, CSSProperties, forwardRef } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useAnimationClasses, AnimationStyle } from '@/hooks/useAnimationStyle';

type AnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'none';

interface AnimatedElementProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  style?: CSSProperties;
}

const getAnimationStyles = (
  animation: AnimationType,
  isVisible: boolean,
  animStyle: AnimationStyle,
  delay: number,
  duration: number
): CSSProperties => {
  const baseStyles: CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: animStyle === 'playful' ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' :
                               animStyle === 'tech' ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' :
                               'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: `${delay}ms`,
  };

  if (!isVisible) {
    switch (animation) {
      case 'fadeIn':
        return { ...baseStyles, opacity: 0, transform: 'translateY(20px)' };
      case 'slideUp':
        return { ...baseStyles, opacity: 0, transform: 'translateY(40px)' };
      case 'slideLeft':
        return { ...baseStyles, opacity: 0, transform: 'translateX(40px)' };
      case 'slideRight':
        return { ...baseStyles, opacity: 0, transform: 'translateX(-40px)' };
      case 'scaleIn':
        return { ...baseStyles, opacity: 0, transform: 'scale(0.9)' };
      default:
        return baseStyles;
    }
  }

  return {
    ...baseStyles,
    opacity: 1,
    transform: 'translateY(0) translateX(0) scale(1)',
  };
};

const AnimatedElement = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 600,
  className,
  threshold = 0.1,
  triggerOnce = true,
  style: propStyle,
}: AnimatedElementProps) => {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold,
    triggerOnce,
    delay: 0,
  });
  const { style: animStyle, settings } = useAnimationClasses();

  // Adjust duration based on speed setting
  const adjustedDuration = settings.animationSpeed === 'slow' ? duration * 1.5 :
                           settings.animationSpeed === 'fast' ? duration * 0.6 :
                           duration;

  const animationStyles = animation !== 'none' 
    ? getAnimationStyles(animation, isVisible, animStyle, delay, adjustedDuration)
    : {};

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...animationStyles, ...propStyle }}
    >
      {children}
    </div>
  );
};

export default AnimatedElement;
