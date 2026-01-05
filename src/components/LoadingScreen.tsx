import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 模拟加载进度
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    // 检测页面是否已加载完成
    const handleLoad = () => {
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
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // 当进度达到100%时，延迟隐藏
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Logo 和标题 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 动态 Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-logo-pulse">
            <span className="text-4xl font-serif font-bold text-primary-foreground">墨</span>
          </div>
          {/* 光晕效果 */}
          <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
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
                className="text-primary/30"
              />
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2 animate-fade-in">
          墨韵文轩
        </h1>
        <p className="text-muted-foreground text-sm mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          记录思考，分享生活
        </p>

        {/* 进度条 */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* 加载提示 */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <span className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            正在加载...
          </span>
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-8 text-xs text-muted-foreground/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        以文会友，以墨传情
      </div>
    </div>
  );
};

export default LoadingScreen;
