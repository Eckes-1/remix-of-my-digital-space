import { useState, useEffect } from 'react';
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
    setTimeout(() => setIsLaunching(false), 1200);
  };

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-secondary/30 z-[60] overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary via-pink-500 to-primary bg-[length:200%_100%] animate-gradient transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back to top button - Spaceship style */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6 z-50 group",
          "transition-all duration-500 ease-out",
          showButton 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-16 pointer-events-none"
        )}
        aria-label="返回顶部"
      >
        {/* Launch trail effect */}
        <div className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 transition-all duration-300",
          isLaunching ? "opacity-100" : "opacity-0"
        )}>
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className={cn(
                "absolute w-1.5 h-1.5 rounded-full",
                i % 3 === 0 ? "bg-orange-400" : i % 3 === 1 ? "bg-yellow-400" : "bg-red-400"
              )}
              style={{
                left: `${30 + Math.random() * 40}%`,
                animation: isLaunching 
                  ? `launchTrail ${0.3 + Math.random() * 0.4}s ease-out ${i * 0.05}s forwards` 
                  : 'none',
              }}
            />
          ))}
        </div>

        {/* Outer glow ring */}
        <div className={cn(
          "absolute inset-[-4px] rounded-full transition-all duration-500",
          "bg-gradient-to-br from-cyan-400/30 via-primary/20 to-purple-500/30",
          "blur-md",
          isLaunching ? "scale-150 opacity-0" : "group-hover:scale-110 opacity-0 group-hover:opacity-100"
        )} />
        
        {/* Main container */}
        <div className={cn(
          "relative w-14 h-14 rounded-full",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border-2 border-cyan-400/50",
          "shadow-lg shadow-cyan-500/20",
          "transition-all duration-300",
          "group-hover:border-cyan-400 group-hover:shadow-xl group-hover:shadow-cyan-500/40",
          isLaunching && "animate-[rocketLaunch_0.8s_ease-out_forwards]"
        )}>
          {/* Inner ring with progress */}
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 56 56"
          >
            {/* Track */}
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="3"
              opacity="0.3"
            />
            {/* Progress */}
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="url(#spaceGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-300"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
            />
            <defs>
              <linearGradient id="spaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Spaceship icon */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            "transition-transform duration-300",
            "group-hover:-translate-y-0.5",
            isLaunching && "animate-[shipShake_0.1s_ease-in-out_5]"
          )}>
            <svg 
              viewBox="0 0 24 24" 
              className={cn(
                "w-6 h-6 transition-all duration-300",
                "text-cyan-400 group-hover:text-cyan-300",
                isLaunching && "text-orange-400"
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Rocket body */}
              <path d="M12 2L8 8v6l4 4 4-4V8L12 2z" />
              {/* Flames */}
              <path 
                className={cn(
                  "transition-all duration-300 origin-top",
                  isLaunching ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                )}
                d="M10 18l2 4 2-4"
                stroke={isLaunching ? "#f97316" : "#fbbf24"}
                strokeWidth="2"
              />
              {/* Wings */}
              <path d="M8 11l-2 2v2l2-1" />
              <path d="M16 11l2 2v2l-2-1" />
              {/* Window */}
              <circle cx="12" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </div>
          
          {/* Percentage */}
          <span className={cn(
            "absolute -bottom-6 left-1/2 -translate-x-1/2",
            "text-[10px] font-bold whitespace-nowrap",
            "bg-gradient-to-r from-cyan-400 via-primary to-purple-400 bg-clip-text text-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )}>
            {Math.round(progress)}%
          </span>
        </div>

        {/* Hover particles */}
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        )}>
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/60 animate-[sparkle_1.5s_ease-in-out_infinite]"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </button>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes launchTrail {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(60px) scale(0);
            opacity: 0;
          }
        }
        @keyframes rocketLaunch {
          0% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(5px);
          }
          100% {
            transform: translateY(-20px);
          }
        }
        @keyframes shipShake {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default ReadingProgress;
