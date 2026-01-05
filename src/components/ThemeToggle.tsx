import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    document.documentElement.classList.add('theme-transitioning');
    setTheme(newTheme);
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
  const isSystem = theme === 'system';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative w-16 h-9 rounded-full transition-all duration-500 p-1 overflow-hidden",
            "shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50",
            isDark 
              ? "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" 
              : "bg-gradient-to-br from-sky-200 via-amber-100 to-sky-200"
          )}
          aria-label="切换主题"
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
              isSystem 
                ? "translate-x-3.5 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500"
                : isDark 
                  ? "translate-x-7 bg-gradient-to-br from-slate-200 to-slate-300" 
                  : "translate-x-0 bg-gradient-to-br from-amber-300 to-orange-400"
            )}
          >
            {/* System icon - half sun half moon design */}
            <div className={cn(
              "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden",
              isSystem ? "opacity-100" : "opacity-0"
            )}>
              {/* Split design */}
              <div className="relative w-full h-full">
                {/* Sun half (left) */}
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-amber-300" />
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute w-0.5 h-1 bg-amber-200 rounded-full"
                      style={{
                        left: '25%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-8px)`,
                      }}
                    />
                  ))}
                </div>
                {/* Moon half (right) */}
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 50%)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-200">
                      <div className="absolute top-0.5 left-1 w-1 h-1 rounded-full bg-slate-400/40" />
                    </div>
                  </div>
                </div>
                {/* Center divider */}
                <div className="absolute left-1/2 top-1 bottom-1 w-px bg-white/40" />
              </div>
            </div>

            {/* Moon features */}
            <div className={cn(
              "absolute inset-0 rounded-full transition-all duration-500 overflow-hidden",
              isDark && !isSystem ? "opacity-100" : "opacity-0"
            )}>
              <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-slate-400/40" />
              <div className="absolute bottom-2 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-400/30" />
              <div className="absolute top-3 right-2 w-1 h-1 rounded-full bg-slate-400/20" />
            </div>
            
            {/* Sun rays */}
            <div className={cn(
              "absolute inset-0 transition-all duration-500",
              !isDark && !isSystem ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 rotate-180"
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
              isSystem
                ? "bg-white/0"
                : isDark 
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
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === 'light' && "bg-primary/10 text-primary"
          )}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200" />
          </div>
          浅色模式
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === 'dark' && "bg-primary/10 text-primary"
          )}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
          深色模式
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('system')}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === 'system' && "bg-primary/10 text-primary"
          )}
        >
          {/* Half sun half moon icon */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-slate-600 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0" style={{ clipPath: 'inset(0 50% 0 0)' }}>
              <div className="w-full h-full bg-amber-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-yellow-200" />
              </div>
            </div>
            <div className="absolute inset-0" style={{ clipPath: 'inset(0 0 0 50%)' }}>
              <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
              </div>
            </div>
          </div>
          跟随系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
