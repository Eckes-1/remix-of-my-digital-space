import { Link } from 'react-router-dom';
import { Eye, TrendingUp, Flame, ArrowRight } from 'lucide-react';
import { usePopularPosts } from '@/hooks/usePosts';

const PopularPosts = () => {
  const { data: posts, isLoading } = usePopularPosts(5);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-muted rounded-lg" />
          <div className="h-5 bg-muted rounded w-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-amber-500 to-orange-500 text-white shadow-amber-500/30';
    if (index === 1) return 'from-slate-400 to-slate-500 text-white shadow-slate-400/30';
    if (index === 2) return 'from-amber-700 to-amber-800 text-white shadow-amber-700/30';
    return 'from-muted to-muted text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-xl p-5 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tl from-primary/10 to-transparent rounded-full" />
      
      <div className="flex items-center gap-2 mb-5 relative">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <Flame className="w-4 h-4 text-white" />
        </span>
        <h3 className="font-serif text-lg font-semibold text-foreground">热门文章</h3>
        <TrendingUp className="w-4 h-4 text-primary/50 ml-auto animate-pulse" />
      </div>
      <ul className="space-y-4 relative">
        {posts.map((post, index) => (
          <li key={post.id} className="group">
            <Link
              to={`/blog/${post.slug}`}
              className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-all duration-300"
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${getRankColor(index)} text-xs font-bold flex items-center justify-center shadow-lg`}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3" />
                    {post.view_count}
                  </span>
                  <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularPosts;
