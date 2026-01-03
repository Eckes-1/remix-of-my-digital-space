import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Get button position for ripple effect
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create ripple element
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: ${resolvedTheme === 'dark' ? 'hsl(40 30% 97%)' : 'hsl(25 20% 10%)'};
        transform: translate(-50%, -50%);
        z-index: 9999;
        pointer-events: none;
        transition: width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out;
      `;
      document.body.appendChild(ripple);
      
      // Calculate max size needed to cover screen
      const maxSize = Math.max(
        Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) * 2,
        2000
      );
      
      // Trigger animation
      requestAnimationFrame(() => {
        ripple.style.width = `${maxSize}px`;
        ripple.style.height = `${maxSize}px`;
      });
      
      // Switch theme partway through animation
      setTimeout(() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }, 200);
      
      // Remove ripple after animation
      setTimeout(() => {
        ripple.style.opacity = '0';
        setTimeout(() => {
          ripple.remove();
          setIsAnimating(false);
        }, 300);
      }, 400);
    }
  };

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
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
        "relative w-10 h-10 rounded-full transition-all duration-500",
        "bg-secondary hover:bg-secondary/80",
        "flex items-center justify-center overflow-hidden",
        isAnimating && "scale-110"
      )}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {/* Sun icon */}
      <svg
        className={cn(
          "absolute w-5 h-5 text-amber-500 transition-all duration-500",
          isDark 
            ? "rotate-90 scale-0 opacity-0" 
            : "rotate-0 scale-100 opacity-100"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          strokeLinecap="round"
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        />
      </svg>
      
      {/* Moon icon */}
      <svg
        className={cn(
          "absolute w-5 h-5 text-indigo-400 transition-all duration-500",
          isDark 
            ? "rotate-0 scale-100 opacity-100" 
            : "-rotate-90 scale-0 opacity-0"
        )}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
      
      {/* Decorative stars for dark mode */}
      {isDark && (
        <>
          <span className="absolute top-1.5 right-2 w-1 h-1 bg-indigo-300 rounded-full animate-pulse" />
          <span className="absolute bottom-2 left-1.5 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
