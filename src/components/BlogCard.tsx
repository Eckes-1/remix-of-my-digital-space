import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
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

  return (
    <Link to={`/blog/${slug}`} className="block group perspective-1000">
      <article className="blog-card h-full flex flex-col relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-500 rounded-[var(--radius)]" />
        
        <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          />
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Category badge floating on image */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center text-xs font-semibold text-primary-foreground bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              {category}
            </span>
          </div>
          
          {/* Read more indicator */}
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              阅读文章
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col relative z-10">
          <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-3 line-clamp-2 leading-tight">
            {title}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
            {excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 text-primary/70" />
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
