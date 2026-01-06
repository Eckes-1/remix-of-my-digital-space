import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAnimationClasses } from "@/hooks/useAnimationStyle";
import { cn } from "@/lib/utils";
import coverProgramming from '@/assets/cover-programming.jpg';
import coverReading from '@/assets/cover-reading.jpg';
import coverLife from '@/assets/cover-life.jpg';
import coverTech from '@/assets/cover-tech.jpg';

interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  coverImage?: string | null;
}

const categoryCovers: Record<string, string> = {
  '编程': coverProgramming,
  '阅读': coverReading,
  '生活': coverLife,
  '技术': coverTech,
};

const BlogCard = ({ slug, title, excerpt, date, readTime, category, coverImage }: BlogCardProps) => {
  const cover = coverImage || categoryCovers[category] || coverProgramming;
  const formattedDate = date ? format(new Date(date), 'yyyy年M月d日', { locale: zhCN }) : '';
  const { style } = useAnimationClasses();

  // Get card hover class based on animation style
  const getCardHoverClass = () => {
    switch (style) {
      case 'playful':
        return 'card-hover-playful';
      case 'tech':
        return 'card-hover-tech';
      case 'minimal':
        return 'card-hover-minimal';
      case 'neon':
        return 'card-hover-neon';
      case 'retro':
        return 'card-hover-retro';
      case 'aurora':
        return 'card-hover-aurora';
      case 'ink':
        return 'card-hover-ink';
      default:
        return 'card-hover-elegant';
    }
  };

  // Get image hover effect based on style
  const getImageHoverClass = () => {
    switch (style) {
      case 'playful':
        return 'group-hover:scale-115 group-hover:rotate-2';
      case 'tech':
        return 'group-hover:scale-105 group-hover:brightness-125';
      case 'minimal':
        return 'group-hover:scale-102';
      case 'neon':
        return 'group-hover:scale-105 group-hover:saturate-150 group-hover:brightness-110';
      case 'retro':
        return 'group-hover:scale-105 group-hover:hue-rotate-15';
      case 'aurora':
        return 'group-hover:scale-102 group-hover:brightness-110';
      case 'ink':
        return 'group-hover:scale-102 group-hover:grayscale-[20%]';
      default:
        return 'group-hover:scale-110 group-hover:brightness-110';
    }
  };

  // Get category badge style
  const getCategoryBadgeClass = () => {
    switch (style) {
      case 'playful':
        return 'animate-bounce-slow bg-gradient-to-r from-accent to-primary';
      case 'tech':
        return 'bg-gradient-to-r from-cyan-500 to-purple-500 animate-glow-pulse';
      case 'minimal':
        return 'bg-foreground/80';
      case 'neon':
        return 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-neon-flicker shadow-lg shadow-pink-500/30';
      case 'retro':
        return 'bg-gradient-to-r from-fuchsia-500 to-cyan-400';
      case 'aurora':
        return 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400';
      case 'ink':
        return 'bg-foreground text-background';
      default:
        return 'bg-primary/90';
    }
  };

  // Get read more indicator style
  const getReadMoreClass = () => {
    switch (style) {
      case 'playful':
        return 'group-hover:translate-y-0 group-hover:rotate-2';
      case 'tech':
        return 'group-hover:translate-y-0 bg-gradient-to-r from-cyan-500/80 to-purple-500/80';
      default:
        return 'group-hover:translate-y-0';
    }
  };

  return (
    <Link to={`/blog/${slug}`} className="block group perspective-1000">
      <article className={cn(
        "blog-card h-full flex flex-col relative overflow-hidden",
        getCardHoverClass()
      )}>
        {/* Glow effect on hover - style specific */}
        <div className={cn(
          "absolute inset-0 transition-all duration-500 rounded-[var(--radius)]",
          style === 'playful' ? 'bg-gradient-to-br from-accent/0 via-primary/0 to-accent/0 group-hover:from-accent/10 group-hover:via-transparent group-hover:to-primary/10' :
          style === 'tech' ? 'bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10' :
          style === 'minimal' ? '' :
          'bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-accent/5'
        )} />
        
        <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
          <img
            src={cover}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              getImageHoverClass()
            )}
          />
          {/* Image overlay gradient */}
          <div className={cn(
            "absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100",
            style === 'tech' ? 'bg-gradient-to-t from-cyan-900/60 via-transparent to-purple-900/20' :
            'bg-gradient-to-t from-background/60 via-transparent to-transparent'
          )} />
          
          {/* Scan line effect for tech style */}
          {style === 'tech' && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan-line pointer-events-none" />
          )}
          
          {/* Category badge floating on image */}
          <div className="absolute top-3 left-3 z-10">
            <span className={cn(
              "inline-flex items-center text-xs font-semibold text-primary-foreground backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg transition-all duration-300",
              getCategoryBadgeClass(),
              style === 'playful' && "group-hover:scale-110"
            )}>
              {style === 'tech' && <Sparkles className="w-3 h-3 mr-1" />}
              {category}
            </span>
          </div>
          
          {/* Read more indicator */}
          <div className={cn(
            "absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2",
            getReadMoreClass()
          )}>
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium text-white backdrop-blur-sm px-3 py-1.5 rounded-full",
              style === 'tech' ? 'bg-gradient-to-r from-cyan-500/80 to-purple-500/80' : 'bg-black/50'
            )}>
              阅读文章
              <ArrowRight className={cn(
                "w-3 h-3 transition-transform duration-300",
                style === 'playful' && "group-hover:translate-x-1 group-hover:animate-wiggle"
              )} />
            </span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col relative z-10">
          <h3 className={cn(
            "font-serif text-xl font-semibold transition-all duration-300 mb-3 line-clamp-2 leading-tight",
            // Base color - always readable
            "text-foreground",
            // Hover colors based on style
            style === 'playful' && 'group-hover:text-accent group-hover:tracking-wide',
            style === 'tech' && 'group-hover:text-cyan-500 dark:group-hover:text-cyan-400',
            style === 'neon' && 'group-hover:text-pink-500 dark:group-hover:text-pink-400',
            style === 'retro' && 'group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400',
            style === 'aurora' && 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
            style === 'ink' && 'group-hover:text-stone-900 dark:group-hover:text-stone-100',
            !['playful', 'tech', 'neon', 'retro', 'aurora', 'ink'].includes(style) && 'group-hover:text-primary'
          )}>
            {title}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1 transition-colors duration-300">
            {excerpt}
          </p>
          
          <div className={cn(
            "flex items-center justify-between text-xs text-muted-foreground pt-4 border-t transition-colors duration-300",
            style === 'tech' && 'border-cyan-500/20 group-hover:border-cyan-500/40',
            style === 'neon' && 'border-pink-500/20 group-hover:border-pink-500/40',
            style === 'retro' && 'border-fuchsia-500/20 group-hover:border-fuchsia-500/40',
            style === 'aurora' && 'border-emerald-500/20 group-hover:border-emerald-500/40',
            style === 'ink' && 'border-foreground/20 group-hover:border-foreground/40',
            !['tech', 'neon', 'retro', 'aurora', 'ink'].includes(style) && 'border-border/50'
          )}>
            <div className="flex items-center gap-4">
              <span className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-300",
                style === 'tech' && 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
                style === 'neon' && 'bg-pink-500/10 group-hover:bg-pink-500/20',
                style === 'retro' && 'bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20',
                style === 'aurora' && 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
                !['tech', 'neon', 'retro', 'aurora'].includes(style) && 'bg-muted/50'
              )}>
                <Calendar className={cn(
                  "w-3.5 h-3.5",
                  style === 'tech' && 'text-cyan-500 dark:text-cyan-400',
                  style === 'neon' && 'text-pink-500 dark:text-pink-400',
                  style === 'retro' && 'text-fuchsia-500 dark:text-fuchsia-400',
                  style === 'aurora' && 'text-emerald-500 dark:text-emerald-400',
                  !['tech', 'neon', 'retro', 'aurora'].includes(style) && 'text-primary/70'
                )} />
                {formattedDate}
              </span>
              <span className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-300",
                style === 'tech' && 'bg-purple-500/10 group-hover:bg-purple-500/20',
                style === 'neon' && 'bg-purple-500/10 group-hover:bg-purple-500/20',
                style === 'retro' && 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
                style === 'aurora' && 'bg-teal-500/10 group-hover:bg-teal-500/20',
                !['tech', 'neon', 'retro', 'aurora'].includes(style) && 'bg-muted/50'
              )}>
                <Clock className={cn(
                  "w-3.5 h-3.5",
                  style === 'tech' && 'text-purple-500 dark:text-purple-400',
                  style === 'neon' && 'text-purple-500 dark:text-purple-400',
                  style === 'retro' && 'text-cyan-500 dark:text-cyan-400',
                  style === 'aurora' && 'text-teal-500 dark:text-teal-400',
                  !['tech', 'neon', 'retro', 'aurora'].includes(style) && 'text-primary/70'
                )} />
                {readTime}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
