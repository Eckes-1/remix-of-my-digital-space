import { useState, useEffect } from 'react';
import { PartyPopper, Star, Heart, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ReadingCompleteCelebrationProps {
  show: boolean;
  onClose: () => void;
  postTitle: string;
}

interface Confetti {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

const ReadingCompleteCelebration = ({ show, onClose, postTitle }: ReadingCompleteCelebrationProps) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Generate confetti
      const newConfetti: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
      }));
      setConfetti(newConfetti);

      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!show && !isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute animate-confetti-fall"
            style={{
              left: `${c.x}%`,
              top: '-20px',
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          >
            <div
              className="animate-confetti-spin"
              style={{
                width: c.size,
                height: c.size,
                backgroundColor: c.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          </div>
        ))}
      </div>

      {/* Celebration Card */}
      <div 
        className={cn(
          "relative z-10 max-w-md w-full mx-4 bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden",
          "transform transition-all duration-500",
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10" />
        
        {/* Floating icons */}
        <div className="absolute top-6 left-8 animate-float">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        </div>
        <div className="absolute top-12 right-12 animate-float-delayed">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
        </div>
        <div className="absolute top-4 left-1/2 animate-float">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>

        <div className="relative pt-16 pb-8 px-8 text-center">
          {/* Trophy/Party icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-bounce-slow">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            🎉 恭喜完成阅读！
          </h2>
          
          <p className="text-muted-foreground mb-2">
            你已完成阅读
          </p>
          
          <p className="text-lg font-semibold text-foreground mb-6 line-clamp-2">
            《{postTitle}》
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-xs text-muted-foreground">阅读进度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">🏆</div>
              <div className="text-xs text-muted-foreground">完成徽章</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-full px-6"
            >
              继续浏览
            </Button>
            <Button
              onClick={handleClose}
              className="rounded-full px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
            >
              太棒了！
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingCompleteCelebration;