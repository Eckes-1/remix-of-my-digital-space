import { Link } from 'react-router-dom';
import { useTags } from '@/hooks/useTags';
import { Tag, Sparkles } from 'lucide-react';

const TagCloud = () => {
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return (
      <div className="blog-card animate-pulse">
        <div className="h-6 bg-muted rounded w-24 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-muted rounded-full w-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="blog-card relative overflow-hidden group/card">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full -translate-y-8 translate-x-8" />
      
      <h3 className="font-serif text-lg font-semibold text-foreground mb-5 flex items-center gap-2 relative">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Tag className="w-4 h-4 text-primary-foreground" />
        </span>
        标签云
        <Sparkles className="w-4 h-4 text-primary/50 animate-pulse ml-auto" />
      </h3>
      <div className="flex flex-wrap gap-2 relative">
        {tags?.map((tag, index) => (
          <Link
            key={tag.id}
            to={`/tags/${tag.slug}`}
            className="group relative px-4 py-2 text-sm bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground rounded-full border border-border/50 hover:border-primary/50 hover:from-primary hover:to-primary/80 hover:text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-primary/10"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="relative z-10">{tag.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;
