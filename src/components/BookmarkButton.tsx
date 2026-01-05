import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookmarks, BookmarkItem } from '@/hooks/useBookmarks';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  post: Omit<BookmarkItem, 'addedAt'>;
  className?: string;
  showLabel?: boolean;
}

const BookmarkButton = ({ post, className, showLabel = false }: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(post.slug);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [prevBookmarked, setPrevBookmarked] = useState(bookmarked);

  // Detect bookmark state change for animation
  useEffect(() => {
    if (bookmarked && !prevBookmarked) {
      setIsAnimating(true);
      setShowSparkles(true);
      
      const timer1 = setTimeout(() => setIsAnimating(false), 600);
      const timer2 = setTimeout(() => setShowSparkles(false), 800);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
    setPrevBookmarked(bookmarked);
  }, [bookmarked, prevBookmarked]);

  const handleClick = () => {
    toggleBookmark(post);
    if (!bookmarked) {
      toast.success('已添加到收藏夹');
    } else {
      toast.info('已从收藏夹移除');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-300 overflow-visible",
        "px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border-2 whitespace-nowrap text-sm sm:text-base",
        bookmarked 
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 text-amber-500 dark:text-amber-400" 
          : "bg-card border-border hover:border-amber-300 text-muted-foreground hover:text-amber-500",
        isAnimating && "scale-110",
        className
      )}
      aria-label={bookmarked ? "取消收藏" : "添加收藏"}
    >
      {/* Sparkle effects */}
      {showSparkles && (
        <>
          <Sparkles className="absolute -top-2 -right-1 w-4 h-4 text-amber-400 animate-ping" />
          <Sparkles className="absolute -bottom-1 -left-2 w-3 h-3 text-orange-400 animate-ping" />
          <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 text-yellow-400 animate-ping" />
        </>
      )}

      {/* Ring pulse effect */}
      {isAnimating && (
        <span className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
      )}

      {bookmarked ? (
        <BookmarkCheck 
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 fill-current transition-all duration-300",
            isAnimating && "animate-bookmark-pop"
          )} 
        />
      ) : (
        <Bookmark 
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300",
            "group-hover:scale-110"
          )} 
        />
      )}
      {showLabel && (
        <span className={cn(
          "font-semibold transition-all duration-300",
          isAnimating && "scale-110"
        )}>
          {bookmarked ? '已收藏' : '收藏'}
        </span>
      )}
    </button>
  );
};

export default BookmarkButton;