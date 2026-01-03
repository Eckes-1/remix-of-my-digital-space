import { Link } from 'react-router-dom';
import { Eye, TrendingUp } from 'lucide-react';
import { usePopularPosts } from '@/hooks/usePosts';

const PopularPosts = () => {
  const { data: posts, isLoading } = usePopularPosts(5);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">热门文章</h3>
        </div>
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold text-foreground">热门文章</h3>
      </div>
      <ul className="space-y-3">
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex items-start gap-3"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Eye className="w-3 h-3" />
                  {post.view_count} 阅读
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularPosts;
