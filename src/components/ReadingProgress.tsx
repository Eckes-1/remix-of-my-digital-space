import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-secondary/50 z-[60]">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back to top button with progress ring */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full",
          "bg-card border border-border shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:scale-110 hover:shadow-xl",
          showButton 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="返回顶部"
      >
        {/* SVG progress ring */}
        <svg 
          className="absolute inset-0 w-12 h-12 -rotate-90"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary transition-all duration-150"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
          />
        </svg>
        <ArrowUp className="w-5 h-5 text-foreground relative z-10" />
      </button>
    </>
  );
};

export default ReadingProgress;
