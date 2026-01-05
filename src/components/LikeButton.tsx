import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";
import { useLikePost } from "@/hooks/useLikes";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  className?: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

const LikeButton = ({ postId, className }: LikeButtonProps) => {
  const { hasLiked, likeCount, toggleLike, isLoading } = useLikePost(postId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [showSparkle, setShowSparkle] = useState(false);
  const [prevLiked, setPrevLiked] = useState(hasLiked);

  // Detect when like status changes to trigger animation
  useEffect(() => {
    if (hasLiked && !prevLiked) {
      // Just liked - trigger celebration
      setIsAnimating(true);
      setShowSparkle(true);
      
      // Create floating hearts
      const newHearts: FloatingHeart[] = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 60 - 30,
        y: Math.random() * -40 - 20,
      }));
      setFloatingHearts(newHearts);

      // Clear animations
      const timer1 = setTimeout(() => setIsAnimating(false), 600);
      const timer2 = setTimeout(() => setShowSparkle(false), 800);
      const timer3 = setTimeout(() => setFloatingHearts([]), 1000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
    setPrevLiked(hasLiked);
  }, [hasLiked, prevLiked]);

  const handleClick = () => {
    if (isLoading) return;
    toggleLike();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300",
        "border-2 overflow-visible",
        hasLiked 
          ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-400/50 text-rose-500 dark:text-rose-400" 
          : "bg-card border-border hover:border-rose-300 text-muted-foreground hover:text-rose-500",
        isAnimating && "scale-110",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Floating hearts animation */}
      {floatingHearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute pointer-events-none animate-float-up"
          style={{
            left: `calc(50% + ${heart.x}px)`,
            top: '50%',
            transform: `translate(-50%, -50%)`,
          }}
        >
          <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
        </span>
      ))}

      {/* Sparkle effect */}
      {showSparkle && (
        <>
          <Sparkles className="absolute -top-2 -right-1 w-4 h-4 text-yellow-400 animate-ping" />
          <Sparkles className="absolute -bottom-1 -left-2 w-3 h-3 text-rose-400 animate-ping" />
        </>
      )}

      {/* Ring pulse effect */}
      {isAnimating && (
        <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-75" />
      )}

      <Heart 
        className={cn(
          "w-5 h-5 transition-all duration-300",
          hasLiked && "fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400",
          isAnimating && "animate-heartbeat",
          !isLoading && !hasLiked && "group-hover:scale-110"
        )} 
      />
      <span className={cn(
        "font-semibold tabular-nums transition-all duration-300",
        isAnimating && "scale-110"
      )}>
        {likeCount}
      </span>
    </button>
  );
};

export default LikeButton;
