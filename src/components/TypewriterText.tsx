import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  loop?: boolean;
  loopDelay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const TypewriterText = ({ 
  text, 
  speed = 50, 
  delay = 0,
  loop = false,
  loopDelay = 2000,
  className = '',
  as: Component = 'span'
}: TypewriterTextProps) => {
  const { displayText } = useTypewriter({ text, speed, delay, loop, loopDelay });

  return (
    <Component className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </Component>
  );
};

export default TypewriterText;
