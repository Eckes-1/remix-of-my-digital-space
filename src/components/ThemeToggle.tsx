import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    // Add transition class to html element
    document.documentElement.classList.add('theme-transitioning');
    
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
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
      onClick={handleToggle}
      className={cn(
        "relative w-16 h-9 rounded-full transition-all duration-500 p-1 overflow-hidden",
        "shadow-inner",
        isDark 
          ? "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" 
          : "bg-gradient-to-br from-sky-200 via-amber-100 to-sky-200"
      )}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {/* Background effects */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        {/* Stars for dark mode */}
        <div className={cn(
          "absolute inset-0 transition-all duration-700",
          isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        
        {/* Clouds for light mode */}
        <div className={cn(
          "absolute inset-0 transition-all duration-700",
          isDark ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
        )}>
          <span className="absolute top-1 right-3 w-4 h-2 bg-white/80 rounded-full blur-[1px]" />
          <span className="absolute bottom-2 right-1 w-3 h-1.5 bg-white/60 rounded-full blur-[1px]" />
          <span className="absolute top-2.5 left-8 w-2 h-1 bg-white/40 rounded-full blur-[1px]" />
        </div>
      </div>

      {/* Toggle circle */}
      <div
        className={cn(
          "relative w-7 h-7 rounded-full transition-all duration-500 ease-out",
          "shadow-lg flex items-center justify-center",
          isDark 
            ? "translate-x-7 bg-gradient-to-br from-slate-200 to-slate-300" 
            : "translate-x-0 bg-gradient-to-br from-amber-300 to-orange-400"
        )}
      >
        {/* Moon features */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-500 overflow-hidden",
          isDark ? "opacity-100" : "opacity-0"
        )}>
          <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-slate-400/40" />
          <div className="absolute bottom-2 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-400/30" />
          <div className="absolute top-3 right-2 w-1 h-1 rounded-full bg-slate-400/20" />
        </div>
        
        {/* Sun rays */}
        <div className={cn(
          "absolute inset-0 transition-all duration-500",
          isDark ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"
        )}>
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute w-0.5 h-1.5 bg-orange-400 rounded-full origin-center"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-12px)`,
              }}
            />
          ))}
        </div>
        
        {/* Inner glow */}
        <div className={cn(
          "w-4 h-4 rounded-full transition-all duration-300",
          isDark 
            ? "bg-slate-100" 
            : "bg-gradient-to-br from-yellow-200 to-orange-300"
        )} />
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
