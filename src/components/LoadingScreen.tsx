import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

type SeasonTheme = 'spring' | 'summer' | 'autumn' | 'winter';

const seasonThemes: Record<SeasonTheme, {
  name: string;
  emoji: string;
  gradient: string;
  accent: string;
  particles: string[];
  bgColors: [string, string];
  subtitle: string;
}> = {
  spring: {
    name: '春樱',
    emoji: '🌸',
    gradient: 'from-pink-400 to-rose-300',
    accent: 'bg-pink-400',
    particles: ['🌸', '🌷', '🌺', '💮', '🌼'],
    bgColors: ['rgba(244, 114, 182, 0.1)', 'rgba(251, 207, 232, 0.1)'],
    subtitle: '春风十里，不如读你'
  },
  summer: {
    name: '夏荷',
    emoji: '🪷',
    gradient: 'from-emerald-400 to-cyan-300',
    accent: 'bg-emerald-400',
    particles: ['🪷', '🌿', '🍃', '💧', '🌊'],
    bgColors: ['rgba(52, 211, 153, 0.1)', 'rgba(103, 232, 249, 0.1)'],
    subtitle: '接天莲叶，映日荷花'
  },
  autumn: {
    name: '秋枫',
    emoji: '🍁',
    gradient: 'from-orange-400 to-amber-300',
    accent: 'bg-orange-400',
    particles: ['🍁', '🍂', '🌾', '🎃', '🌰'],
    bgColors: ['rgba(251, 146, 60, 0.1)', 'rgba(252, 211, 77, 0.1)'],
    subtitle: '霜叶红于二月花'
  },
  winter: {
    name: '冬雪',
    emoji: '❄️',
    gradient: 'from-blue-300 to-slate-200',
    accent: 'bg-blue-300',
    particles: ['❄️', '🌨️', '⛄', '🧊', '💎'],
    bgColors: ['rgba(147, 197, 253, 0.1)', 'rgba(226, 232, 240, 0.1)'],
    subtitle: '忽如一夜春风来，千树万树梨花开'
  }
};

const getSeasonByMonth = (): SeasonTheme => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [season, setSeason] = useState<SeasonTheme>(getSeasonByMonth());
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; left: number; delay: number; duration: number }>>([]);

  const theme = seasonThemes[season];

  // 生成飘落粒子
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: theme.particles[Math.floor(Math.random() * theme.particles.length)],
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4
    }));
    setParticles(newParticles);
  }, [season, theme.particles]);

  const startLoading = useCallback(() => {
    setProgress(0);
    setHasError(false);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    // 超时检测
    const timeout = setTimeout(() => {
      if (progress < 50) {
        clearInterval(progressInterval);
        setHasError(true);
      }
    }, 10000);

    const handleLoad = () => {
      clearTimeout(timeout);
      setProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    };

    if (document.readyState === 'complete') {
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => setIsLoading(false), 500);
      }, 800);
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
      window.removeEventListener('load', handleLoad);
    };
  }, [progress]);

  useEffect(() => {
    const cleanup = startLoading();
    return cleanup;
  }, [retryCount]);

  useEffect(() => {
    if (progress >= 100 && !hasError) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, hasError]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const cycleSeason = () => {
    const seasons: SeasonTheme[] = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(season);
    setSeason(seasons[(currentIndex + 1) % 4]);
  };

  if (!isLoading && !hasError) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        progress >= 100 && !hasError ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 飘落粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute text-2xl animate-particle-fall"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          >
            {particle.emoji}
          </span>
        ))}
      </div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: theme.bgColors[0] }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: theme.bgColors[1], animationDelay: '0.5s' }}
        />
      </div>

      {/* Logo 和标题 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 季节选择器 */}
        <button
          onClick={cycleSeason}
          className="absolute -top-16 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <span>{theme.emoji}</span>
          <span>{theme.name}主题</span>
        </button>

        {/* 动态 Logo */}
        <div className="relative mb-8">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center animate-logo-pulse`}>
            <span className="text-4xl font-serif font-bold text-white drop-shadow-lg">墨</span>
          </div>
          {/* 光晕效果 */}
          <div className={`absolute inset-0 w-20 h-20 rounded-2xl ${theme.accent}/30 blur-xl animate-pulse`} />
          {/* 旋转装饰 */}
          <div className="absolute -inset-4">
            <svg className="w-28 h-28 animate-spin-slow" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                strokeDasharray="8 12"
                className="text-foreground/20"
              />
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2 animate-fade-in">
          墨韵文轩
        </h1>
        <p className="text-muted-foreground text-sm mb-8 animate-fade-in text-center max-w-xs" style={{ animationDelay: '0.2s' }}>
          {theme.subtitle}
        </p>

        {hasError ? (
          /* 错误状态 */
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">加载遇到问题</span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              网络连接可能不稳定，请检查您的网络后重试
            </p>
            <button
              onClick={handleRetry}
              className={`flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-medium text-sm hover:opacity-90 transition-opacity`}
            >
              <RefreshCw className="w-4 h-4" />
              重新加载
            </button>
          </div>
        ) : (
          <>
            {/* 进度条 */}
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full transition-all duration-300 ease-out`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* 加载提示 */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span 
                    key={i}
                    className={`w-1.5 h-1.5 ${theme.accent} rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                正在加载...
              </span>
            </div>
          </>
        )}
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-8 text-xs text-muted-foreground/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        以文会友，以墨传情
      </div>
    </div>
  );
};

export default LoadingScreen;
