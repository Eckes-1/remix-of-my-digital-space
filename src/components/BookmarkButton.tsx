import { Bookmark, BookmarkCheck } from 'lucide-react';
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
        "group inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-300",
        "px-2.5 sm:px-3 py-2 rounded-lg text-sm sm:text-base",
        bookmarked 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:text-primary hover:bg-primary/5",
        className
      )}
      aria-label={bookmarked ? "取消收藏" : "添加收藏"}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
      ) : (
        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
      )}
      {showLabel && (
        <span className="text-xs sm:text-sm font-medium">
          {bookmarked ? '已收藏' : '收藏'}
        </span>
      )}
    </button>
  );
};

export default BookmarkButton;
