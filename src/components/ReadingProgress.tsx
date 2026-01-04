import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

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
    setIsClicked(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsClicked(false), 800);
  };

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-muted/30 z-[60]">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back to top button - Clean circular design */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-12 h-12 rounded-full",
          "bg-card/90 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg shadow-primary/10",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:shadow-xl hover:shadow-primary/20",
          "hover:border-primary/50",
          "hover:scale-105",
          "group",
          showButton 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-4 pointer-events-none",
          isClicked && "animate-bounce-up"
        )}
        aria-label="返回顶部"
      >
        {/* Progress ring */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 48 48"
        >
          {/* Background track */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="hsl(var(--muted) / 0.3)"
            strokeWidth="2"
          />
          {/* Progress arc */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-300"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Arrow icon */}
        <ArrowUp 
          className={cn(
            "w-5 h-5 text-muted-foreground",
            "transition-all duration-300",
            "group-hover:text-primary",
            "group-hover:-translate-y-0.5",
            isClicked && "animate-arrow-up"
          )}
        />

        {/* Ripple effect on click */}
        {isClicked && (
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
      </button>

      <style>{`
        @keyframes bounce-up {
          0%, 100% {
            transform: translateY(0) scale(1.05);
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
        }
        @keyframes arrow-up {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-12px);
            opacity: 0;
          }
          51% {
            transform: translateY(12px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-bounce-up {
          animation: bounce-up 0.6s ease-out;
        }
        .animate-arrow-up {
          animation: arrow-up 0.6s ease-out;
        }
      `}</style>
    </>
  );
};

export default ReadingProgress;
