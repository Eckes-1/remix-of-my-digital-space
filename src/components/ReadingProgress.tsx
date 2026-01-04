import { useState, useEffect } from 'react';
import { ArrowUp, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
      setShowButton(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    setIsLaunching(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLaunching(false), 800);
  };

  return (
    <>
      {/* Progress bar at top - animated gradient */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-secondary/30 z-[60] overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary via-pink-500 to-primary bg-[length:200%_100%] animate-gradient transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back to top button - rocket style with particles */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6 z-50 group",
          "transition-all duration-500 ease-out",
          showButton 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
        aria-label="返回顶部"
      >
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-xl transition-opacity duration-300",
          "bg-gradient-to-br from-primary/60 to-pink-500/60",
          isLaunching ? "opacity-100 scale-150" : "opacity-0 group-hover:opacity-60"
        )} />
        
        {/* Main button container */}
        <div className={cn(
          "relative w-14 h-14 rounded-full overflow-hidden",
          "bg-gradient-to-br from-primary to-pink-500",
          "shadow-lg shadow-primary/25",
          "transition-all duration-300",
          "group-hover:shadow-xl group-hover:shadow-primary/40",
          "group-hover:scale-110",
          isLaunching && "animate-bounce"
        )}>
          {/* Inner circle with progress */}
          <div className="absolute inset-1 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center">
            {/* Circular progress */}
            <svg 
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-secondary/50"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Icon and percentage */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Rocket 
                className={cn(
                  "w-4 h-4 text-primary transition-all duration-300",
                  "group-hover:-translate-y-0.5 group-hover:text-pink-500",
                  isLaunching && "animate-pulse"
                )} 
              />
              <span className="text-[9px] font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent leading-none mt-0.5">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Particle effects on hover */}
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        )}>
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/60 animate-float"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      </button>
    </>
  );
};

export default ReadingProgress;
