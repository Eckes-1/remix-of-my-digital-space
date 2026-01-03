import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePosts } from "@/hooks/usePosts";
import { Calendar, FileText } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface MonthGroup {
  month: string;
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    date: string;
    category: string;
  }>;
}

const Archive = () => {
  const { data: posts, isLoading } = usePosts();

  const groupedPosts = useMemo(() => {
    if (!posts) return [];
    
    const groups: Record<string, MonthGroup> = {};
    
    posts.forEach(post => {
      const date = post.published_at || post.created_at;
      const monthKey = format(parseISO(date), 'yyyy年MM月', { locale: zhCN });
      
      if (!groups[monthKey]) {
        groups[monthKey] = { month: monthKey, posts: [] };
      }
      
      groups[monthKey].posts.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        date: date,
        category: post.category,
      });
    });
    
    return Object.values(groups).sort((a, b) => b.month.localeCompare(a.month));
  }, [posts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="blog-container">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
              文章归档
            </h1>
            <p className="text-muted-foreground">
              共 {posts?.length || 0} 篇文章
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : groupedPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无文章</div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {groupedPosts.map((group) => (
                <div key={group.month} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {group.month}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({group.posts.length} 篇)
                    </span>
                  </h2>
                  
                  <div className="space-y-3 pl-7 border-l-2 border-border">
                    {group.posts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="block group py-2"
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-foreground group-hover:text-primary transition-colors font-medium">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{format(parseISO(post.date), 'M月d日', { locale: zhCN })}</span>
                              <span className="px-2 py-0.5 bg-secondary rounded">{post.category}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Archive;
