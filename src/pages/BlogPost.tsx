import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
import ReadingCompleteCelebration from "@/components/ReadingCompleteCelebration";
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
  const [showCelebration, setShowCelebration] = useState(false);
  const hasShownCelebrationRef = useRef(false);
  
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

  // Track reading completion
  useEffect(() => {
    if (!slug || !post) return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      // Show celebration when user reaches 95% and hasn't seen it yet
      if (progress >= 95 && !hasShownCelebrationRef.current) {
        hasShownCelebrationRef.current = true;
        setShowCelebration(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, post]);

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
      
      {/* Reading Complete Celebration */}
      <ReadingCompleteCelebration 
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        postTitle={post?.title || ''}
      />
      
      {/* Resume Reading Prompt */}
      {showResumePrompt && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-5 flex items-center gap-5">
            {/* Progress ring */}
            <div className="relative">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(lastReadInfo?.progress || 0) * 1.51} 151`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">继续上次阅读？</p>
              <p className="text-sm text-muted-foreground">
                已阅读 <span className="font-medium text-primary">{Math.round(lastReadInfo?.progress || 0)}%</span>
                {lastReadInfo?.lastRead && (
                  <span className="ml-1">
                    · {new Date(lastReadInfo.lastRead).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleStartFromBeginning}
                className="text-muted-foreground hover:text-foreground"
              >
                从头开始
              </Button>
              <Button 
                size="sm" 
                onClick={handleResumeReading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
              >
                继续阅读
              </Button>
            </div>
            <button 
              onClick={handleStartFromBeginning}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Reading Mode Controls */}
      {isReadingMode && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
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
      )}
      
      <main className={cn(
        "flex-1 transition-all duration-500",
        isReadingMode ? "py-12" : "py-8"
      )}>
        {/* Hero Image - hidden in reading mode */}
        {!isReadingMode && (
          <div className="relative h-72 md:h-[28rem] mb-8 overflow-hidden">
            <img
              src={cover}
              alt={post.title}
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
            />
            {/* Multiple gradient overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
            
            {/* Floating category badge */}
            <div className="absolute top-6 left-6 z-10">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg shadow-primary/25">
                <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                {post.category}
              </span>
            </div>
          </div>
        )}
        
        <div className={cn(
          "mx-auto px-4 sm:px-6 transition-all duration-500",
          isReadingMode 
            ? "max-w-3xl" 
            : "max-w-6xl -mt-40 relative"
        )}>
          <div className={cn(
            "transition-all duration-500",
            isReadingMode 
              ? "" 
              : "grid lg:grid-cols-[1fr_220px] gap-8"
          )}>
            {/* Main content */}
            <article className={cn(
              "rounded-2xl transition-all duration-500",
              isReadingMode 
                ? "bg-transparent p-0" 
                : "bg-background/95 backdrop-blur-sm p-8 md:p-12 shadow-2xl shadow-black/5 border border-border/50"
            )}>
              {!isReadingMode && (
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 mb-8 group"
                >
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                  返回文章列表
                </Link>
              )}
              
              <header className={cn(
                "transition-all duration-500",
                isReadingMode ? "mb-16 text-center" : "mb-12"
              )}>
                {!isReadingMode && (
                  <span className={cn(
                    "inline-flex items-center gap-2 text-xs font-medium text-primary bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-1.5 rounded-full mb-6 border border-primary/20"
                  )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {post.category}
                  </span>
                )}
                
                <h1 className={cn(
                  "font-serif font-bold text-foreground leading-tight transition-all duration-500",
                  isReadingMode 
                    ? "text-4xl md:text-5xl lg:text-6xl mb-8" 
                    : "text-3xl md:text-4xl lg:text-5xl mb-8"
                )}>
                  {post.title}
                </h1>
                
                {/* Author info */}
                {author && (
                  <div className={cn(
                    "flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted/30",
                    isReadingMode && "justify-center bg-transparent"
                  )}>
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <AvatarImage src={author.avatar_url || undefined} alt={author.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                        {author.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={isReadingMode ? "text-center" : ""}>
                      <div className="font-semibold text-foreground">{author.name}</div>
                      {author.bio && (
                        <div className="text-sm text-muted-foreground line-clamp-1">{author.bio}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className={cn(
                  "flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
                  isReadingMode && "justify-center"
                )}>
                  <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 text-primary/70" />
                    {post.read_time}阅读
                  </span>
                  <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                    <Eye className="w-4 h-4 text-primary/70" />
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
              
              {/* Like, Share & Bookmark Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 mt-12 mb-10 py-8 border-t border-b border-border/50">
                <p className="text-sm text-muted-foreground mb-2">觉得文章不错？支持一下 👇</p>
                <div className="flex items-center gap-4">
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
