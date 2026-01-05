import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Eye, X } from "lucide-react";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";
import BookmarkButton from "@/components/BookmarkButton";
import TableOfContents from "@/components/TableOfContents";
import RelatedPosts from "@/components/RelatedPosts";
import ReadingModeButton from "@/components/ReadingModeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePost, useIncrementViewCount } from "@/hooks/usePosts";
import { useAuthor } from "@/hooks/useAuthors";
import { useReadingProgress, getLastReadProgress } from "@/hooks/useReadingProgress";
import { useReadingMode } from "@/hooks/useReadingMode";
import { cn } from "@/lib/utils";
import coverProgramming from '@/assets/cover-programming.jpg';
import coverReading from '@/assets/cover-reading.jpg';
import coverLife from '@/assets/cover-life.jpg';
import coverTech from '@/assets/cover-tech.jpg';
import { BookOpen } from "lucide-react";

const categoryCovers: Record<string, string> = {
  '编程': coverProgramming,
  '阅读': coverReading,
  '生活': coverLife,
  '技术': coverTech,
};

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, isLoading, error } = usePost(slug || '');
  const incrementView = useIncrementViewCount();
  const { data: author } = useAuthor((post as any)?.author_id || null);
  const { getSavedProgress } = useReadingProgress(slug);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState<number | null>(null);
  
  // Use reading mode hook with font size control
  const {
    isReadingMode,
    toggleReadingMode,
    exitReadingMode,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    minFontSize,
    maxFontSize,
  } = useReadingMode();

  // Check for saved reading progress on mount
  useEffect(() => {
    if (slug) {
      const savedPos = getSavedProgress(slug);
      if (savedPos && savedPos > 300) {
        setSavedScrollPosition(savedPos);
        setShowResumePrompt(true);
      }
    }
  }, [slug, getSavedProgress]);

  // Increment view count when post loads
  useEffect(() => {
    if (slug && post) {
      incrementView.mutate(slug);
    }
  }, [slug, post?.id]);

  // Exit reading mode on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isReadingMode) {
        exitReadingMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingMode, exitReadingMode]);

  const handleResumeReading = () => {
    if (savedScrollPosition) {
      window.scrollTo({ top: savedScrollPosition, behavior: 'smooth' });
    }
    setShowResumePrompt(false);
  };

  const handleStartFromBeginning = () => {
    setShowResumePrompt(false);
  };

  // Parse content with heading IDs
  const parsedContent = useMemo(() => {
    if (!post?.content) return [];
    
    const paragraphs = post.content.split("\n\n");
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.startsWith("## ")) {
        const id = `heading-${index}`;
        return { type: 'heading', content: paragraph.replace("## ", ""), id };
      }
      if (paragraph.startsWith("- ")) {
        const items = paragraph.split("\n").filter(Boolean);
        return { type: 'list', items: items.map(item => item.replace("- ", "")), id: null };
      }
      return { type: 'paragraph', content: paragraph, id: null };
    });
  }, [post?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">加载中...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
              文章未找到
            </h1>
            <Link to="/blog" className="text-primary hover:underline">
              返回文章列表
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cover = post.cover_image || categoryCovers[post.category] || coverProgramming;
  const formattedDate = post.published_at 
    ? format(new Date(post.published_at), 'yyyy年M月d日', { locale: zhCN })
    : format(new Date(post.created_at), 'yyyy年M月d日', { locale: zhCN });

  const lastReadInfo = slug ? getLastReadProgress(slug) : null;

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-all duration-500",
      isReadingMode && "bg-[#f9f7f1] dark:bg-[#1a1a1a]"
    )}>
      {!isReadingMode && <Header />}
      
      {/* Resume Reading Prompt - mobile optimized */}
      {showResumePrompt && (
        <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-card border border-border rounded-xl shadow-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1 sm:flex-initial">
                <p className="font-medium text-foreground text-sm sm:text-base">继续上次阅读？</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {lastReadInfo && `上次阅读到 ${Math.round(lastReadInfo.progress)}%`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm" variant="outline" onClick={handleStartFromBeginning} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                从头开始
              </Button>
              <Button size="sm" onClick={handleResumeReading} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                继续阅读
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reading Mode Controls - mobile optimized */}
      {isReadingMode && (
        <div className="fixed top-2 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 animate-fade-in">
          <div className="flex justify-end">
            <ReadingModeButton 
              isActive={isReadingMode}
              onToggle={toggleReadingMode}
              fontSize={fontSize}
              onIncreaseFontSize={increaseFontSize}
              onDecreaseFontSize={decreaseFontSize}
              onResetFontSize={resetFontSize}
              minFontSize={minFontSize}
              maxFontSize={maxFontSize}
            />
          </div>
        </div>
      )}
      
      <main className={cn(
        "flex-1 transition-all duration-500",
        isReadingMode ? "py-12" : "py-8"
      )}>
        {/* Hero Image - hidden in reading mode */}
        {!isReadingMode && (
          <div className="relative h-64 md:h-96 mb-8 overflow-hidden">
            <img
              src={cover}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        )}
        
        <div className={cn(
          "mx-auto px-4 sm:px-6 transition-all duration-500",
          isReadingMode 
            ? "max-w-3xl" 
            : "max-w-6xl -mt-32 relative"
        )}>
          <div className={cn(
            "transition-all duration-500",
            isReadingMode 
              ? "" 
              : "grid lg:grid-cols-[1fr_220px] gap-8"
          )}>
            {/* Main content */}
            <article className={cn(
              "rounded-xl transition-all duration-500",
              isReadingMode 
                ? "bg-transparent p-0" 
                : "bg-background p-6 md:p-10 shadow-lg"
            )}>
              {!isReadingMode && (
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回文章列表
                </Link>
              )}
              
              <header className={cn(
                "transition-all duration-500",
                isReadingMode ? "mb-16 text-center" : "mb-12"
              )}>
                <span className={cn(
                  "inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4",
                  isReadingMode && "mb-6"
                )}>
                  {post.category}
                </span>
                
                <h1 className={cn(
                  "font-serif font-bold text-foreground leading-tight transition-all duration-500",
                  isReadingMode 
                    ? "text-4xl md:text-5xl lg:text-6xl mb-8" 
                    : "text-3xl md:text-4xl lg:text-5xl mb-6"
                )}>
                  {post.title}
                </h1>
                
                {/* Author info */}
                {author && (
                  <div className={cn(
                    "flex items-center gap-3 mb-4",
                    isReadingMode && "justify-center"
                  )}>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={author.avatar_url || undefined} alt={author.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {author.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={isReadingMode ? "text-center" : ""}>
                      <div className="font-medium text-foreground">{author.name}</div>
                      {author.bio && (
                        <div className="text-xs text-muted-foreground line-clamp-1">{author.bio}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className={cn(
                  "flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
                  isReadingMode && "justify-center"
                )}>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.read_time}阅读
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {post.view_count} 次阅读
                  </span>
                  {/* Reading mode toggle button - only show when not in reading mode */}
                  {!isReadingMode && (
                    <ReadingModeButton 
                      isActive={isReadingMode}
                      onToggle={toggleReadingMode}
                      fontSize={fontSize}
                      onIncreaseFontSize={increaseFontSize}
                      onDecreaseFontSize={decreaseFontSize}
                      onResetFontSize={resetFontSize}
                      minFontSize={minFontSize}
                      maxFontSize={maxFontSize}
                    />
                  )}
                </div>
              </header>
              
              <div 
                className={cn(
                  "prose-blog max-w-none transition-all duration-500",
                  isReadingMode && "leading-loose [&_p]:mb-6 [&_h2]:mt-16 [&_h2]:mb-8"
                )}
                style={isReadingMode ? { fontSize: `${fontSize}px` } : undefined}
              >
                {parsedContent.map((item, index) => {
                  if (item.type === 'heading') {
                    return (
                      <h2 
                        key={index} 
                        id={item.id!}
                        className={cn(
                          "font-serif font-semibold text-foreground scroll-mt-24",
                          isReadingMode 
                            ? "text-3xl mt-16 mb-8" 
                            : "text-2xl mt-10 mb-4"
                        )}
                      >
                        {item.content}
                      </h2>
                    );
                  }
                  if (item.type === 'list') {
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 my-4 text-foreground/80">
                        {item.items!.map((listItem, i) => (
                          <li key={i}>{listItem}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={index} className={cn(
                      "text-foreground/80 leading-relaxed mb-4",
                      isReadingMode && "leading-loose mb-6"
                    )}>
                      {item.content}
                    </p>
                  );
                })}
              </div>
              
              {/* Like, Share & Bookmark Buttons - mobile optimized */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-10 mb-6 sm:mb-8 flex-wrap">
                <LikeButton postId={post.id} />
                <ShareButton title={post.title} />
                <BookmarkButton 
                  post={{
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt,
                    category: post.category,
                    coverImage: post.cover_image || undefined,
                  }}
                  showLabel
                />
              </div>

              {/* Related Posts - hidden in reading mode */}
              {!isReadingMode && <RelatedPosts currentPostId={post.id} category={post.category} />}
              
              {/* Comments */}
              <CommentSection postId={post.id} />
            </article>

            {/* Sidebar with TOC - hidden in reading mode */}
            {!isReadingMode && (
              <aside className="hidden lg:block">
                <TableOfContents content={post.content} />
              </aside>
            )}
          </div>
        </div>
      </main>
      
      {!isReadingMode && <Footer />}
    </div>
  );
};

export default BlogPost;
