import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  coverImage?: string;
}

const BlogCard = ({ id, title, excerpt, date, readTime, category, coverImage }: BlogCardProps) => {
  return (
    <Link to={`/blog/${id}`} className="block group">
      <article className="blog-card h-full flex flex-col">
        {coverImage && (
          <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/5 group-hover:bg-transparent transition-colors" />
          </div>
        )}
        
        <div className="flex-1 flex flex-col">
          <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-3">
            {category}
          </span>
          
          <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
            {excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readTime}
              </span>
            </div>
            
            <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
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
