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
    <Link to={`/blog/${slug}`} className="block group">
      <article className="blog-card h-full flex flex-col p-3 sm:p-6">
        <div className="relative overflow-hidden rounded-lg mb-3 sm:mb-4 aspect-video">
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/5 group-hover:bg-transparent transition-colors" />
        </div>
        
        <div className="flex-1 flex flex-col">
          <span className="inline-block text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit mb-2 sm:mb-3">
            {category}
          </span>
          
          <h3 className="font-serif text-base sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5 sm:mb-2 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
            {excerpt}
          </p>
          
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-3 sm:pt-4 border-t border-border">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {readTime}
              </span>
            </div>
            
            <span className="hidden sm:flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              阅读更多
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
