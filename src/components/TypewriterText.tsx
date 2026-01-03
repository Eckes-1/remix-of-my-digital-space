import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const TypewriterText = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = '',
  as: Component = 'span'
}: TypewriterTextProps) => {
  const { displayText, isComplete } = useTypewriter({ text, speed, delay });

  return (
    <Component className={className}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </Component>
  );
};

export default TypewriterText;
