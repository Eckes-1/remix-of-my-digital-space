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
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
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
        "relative w-14 h-8 rounded-full transition-all duration-500 p-1 overflow-hidden",
        isDark ? "bg-indigo-950" : "bg-amber-100"
      )}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {/* Track decoration */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        {/* Stars for dark mode */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isDark ? "opacity-100" : "opacity-0"
        )}>
          <span className="absolute top-1.5 left-2 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
          <span className="absolute top-3 left-4 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        {/* Clouds for light mode */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isDark ? "opacity-0" : "opacity-100"
        )}>
          <span className="absolute top-1 right-2 w-3 h-1.5 bg-white/70 rounded-full" />
          <span className="absolute bottom-1.5 right-4 w-2 h-1 bg-white/50 rounded-full" />
        </div>
      </div>

      {/* Toggle circle with icon */}
      <div
        className={cn(
          "relative w-6 h-6 rounded-full shadow-md transition-all duration-500 ease-out flex items-center justify-center",
          isDark 
            ? "translate-x-6 bg-indigo-200 rotate-[360deg]" 
            : "translate-x-0 bg-amber-400 rotate-0"
        )}
      >
        {/* Moon */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <div className="absolute inset-0 rounded-full bg-indigo-200" />
          <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300/50" />
          <div className="absolute bottom-1.5 right-1 w-1 h-1 rounded-full bg-indigo-300/40" />
        </div>
        
        {/* Sun */}
        <div className={cn(
          "absolute inset-1 rounded-full bg-amber-500 transition-all duration-500",
          isDark ? "opacity-0 scale-50" : "opacity-100 scale-100"
        )}>
          <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/30" style={{ animationDuration: '2s' }} />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
