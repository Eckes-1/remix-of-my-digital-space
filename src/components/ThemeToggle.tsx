import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create ripple overlay
      const ripple = document.createElement('div');
      const isDark = resolvedTheme === 'dark';
      const newBg = isDark ? 'hsl(40, 30%, 97%)' : 'hsl(25, 20%, 10%)';
      
      ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: ${newBg};
        transform: translate(-50%, -50%);
        z-index: 9990;
        pointer-events: none;
      `;
      document.body.appendChild(ripple);
      
      // Calculate size to cover entire viewport
      const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2.5;
      
      // Animate ripple expansion
      const animation = ripple.animate([
        { width: '0px', height: '0px', opacity: 1 },
        { width: `${maxSize}px`, height: `${maxSize}px`, opacity: 1 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });
      
      // Switch theme at peak of animation
      setTimeout(() => {
        setTheme(isDark ? 'light' : 'dark');
      }, 300);
      
      // Fade out and remove ripple after theme switch
      animation.onfinish = () => {
        ripple.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], {
          duration: 200,
          easing: 'ease-out',
          fill: 'forwards'
        }).onfinish = () => {
          ripple.remove();
          setIsAnimating(false);
        };
      };
    } else {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      setIsAnimating(false);
    }
  };

  if (!mounted) {
    return (
      <button className="w-14 h-8 rounded-full bg-secondary flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      disabled={isAnimating}
      className={cn(
        "relative w-14 h-8 rounded-full transition-colors duration-300 p-1",
        isDark ? "bg-indigo-950" : "bg-amber-100"
      )}
      style={{ zIndex: 9999 }}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {/* Track decoration */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        {/* Stars for dark mode */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isDark ? "opacity-100" : "opacity-0"
        )}>
          <span className="absolute top-1.5 left-2 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
          <span className="absolute top-3 left-4 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        {/* Clouds for light mode */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isDark ? "opacity-0" : "opacity-100"
        )}>
          <span className="absolute top-1 right-2 w-3 h-1.5 bg-white/70 rounded-full" />
          <span className="absolute bottom-1.5 right-4 w-2 h-1 bg-white/50 rounded-full" />
        </div>
      </div>

      {/* Toggle circle with icon */}
      <div
        className={cn(
          "relative w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center",
          isDark 
            ? "translate-x-6 bg-indigo-200" 
            : "translate-x-0 bg-amber-400"
        )}
      >
        {/* Moon */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <div className="absolute inset-0 rounded-full bg-indigo-200" />
          <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300/50" />
          <div className="absolute bottom-1.5 right-1 w-1 h-1 rounded-full bg-indigo-300/40" />
        </div>
        
        {/* Sun */}
        <div className={cn(
          "absolute inset-1 rounded-full bg-amber-500 transition-all duration-300",
          isDark ? "opacity-0 scale-50" : "opacity-100 scale-100"
        )}>
          <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/30" style={{ animationDuration: '2s' }} />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
