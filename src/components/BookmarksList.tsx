import { Link } from 'react-router-dom';
import { Bookmark, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useBookmarks } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const BookmarksList = () => {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-9 h-9 sm:w-10 sm:h-10">
          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          {bookmarks.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {bookmarks.length > 9 ? '9+' : bookmarks.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            我的收藏夹
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              ({bookmarks.length})
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] mt-3 sm:mt-4 pr-2 sm:pr-4">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">收藏夹是空的</p>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
                在文章页面点击收藏按钮添加文章
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.slug}
                  className={cn(
                    "group relative p-3 sm:p-4 rounded-xl",
                    "bg-card border border-border/50",
                    "hover:border-primary/30 hover:shadow-md",
                    "transition-all duration-300"
                  )}
                >
                  <button
                    onClick={() => removeBookmark(bookmark.slug)}
                    className={cn(
                      "absolute top-2 right-2",
                      "p-1.5 rounded-full",
                      "text-muted-foreground/50 hover:text-destructive",
                      "hover:bg-destructive/10",
                      "opacity-100 sm:opacity-0 group-hover:opacity-100",
                      "transition-all duration-200"
                    )}
                    aria-label="移除收藏"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <Link to={`/blog/${bookmark.slug}`} className="block pr-6">
                    <span className="inline-block text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1.5 sm:mb-2">
                      {bookmark.category}
                    </span>
                    <h3 className="font-medium text-foreground line-clamp-2 mb-1 text-sm sm:text-base group-hover:text-primary transition-colors">
                      {bookmark.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-1.5 sm:mb-2">
                      {bookmark.excerpt}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground/70">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(bookmark.addedAt), { 
                          addSuffix: true, 
                          locale: zhCN 
                        })}收藏
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default BookmarksList;
