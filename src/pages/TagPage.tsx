import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { Tag } from "lucide-react";
import { useTags } from '@/hooks/useTags';

const TagPage = () => {
  const { slug } = useParams();
  const { data: tags } = useTags();
  
  const tag = tags?.find(t => t.slug === slug);
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'tag', slug],
    queryFn: async () => {
      // First get post IDs associated with this tag
      const { data: tagData } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!tagData) return [];
      
      const { data: postTags } = await supabase
        .from('post_tags')
        .select('post_id')
        .eq('tag_id', tagData.id);
      
      if (!postTags || postTags.length === 0) return [];
      
      const postIds = postTags.map(pt => pt.post_id);
      
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .in('id', postIds)
        .order('published_at', { ascending: false });
      
      return posts || [];
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="blog-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Tag className="w-5 h-5" />
              标签
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
              {tag?.name || slug}
            </h1>
            <p className="text-muted-foreground">
              {posts?.length || 0} 篇相关文章
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">暂无相关文章</p>
              <Link to="/blog" className="text-primary hover:underline">
                浏览所有文章
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts?.map((post: any, index: number) => (
                <div
                  key={post.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BlogCard
                    id={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    date={post.published_at || post.created_at}
                    readTime={post.read_time}
                    category={post.category}
                    coverImage={post.cover_image}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Other Tags */}
          {tags && tags.length > 1 && (
            <div className="mt-16 pt-12 border-t border-border">
              <h2 className="font-serif text-xl font-semibold text-foreground text-center mb-6">
                其他标签
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {tags.filter(t => t.slug !== slug).map((t) => (
                  <Link
                    key={t.id}
                    to={`/tags/${t.slug}`}
                    className="px-4 py-2 text-sm bg-card hover:bg-primary hover:text-primary-foreground rounded-full transition-colors border border-border"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TagPage;
