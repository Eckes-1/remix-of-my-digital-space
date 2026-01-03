import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import { usePost, useIncrementViewCount } from "@/hooks/usePosts";
import coverProgramming from '@/assets/cover-programming.jpg';
import coverReading from '@/assets/cover-reading.jpg';
import coverLife from '@/assets/cover-life.jpg';
import coverTech from '@/assets/cover-tech.jpg';

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

  useEffect(() => {
    if (slug && post) {
      incrementView.mutate(slug);
    }
  }, [slug, post?.id]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 mb-8 overflow-hidden">
          <img
            src={cover}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        
        <article className="blog-container -mt-32 relative">
          <div className="bg-background rounded-xl p-6 md:p-10 shadow-lg">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              返回文章列表
            </Link>
            
            <header className="mb-12">
              <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                {post.category}
              </span>
              
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.read_time}阅读
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {post.view_count} 次阅读
                </span>
              </div>
            </header>
            
            <div className="prose-blog max-w-none">
              {post.content.split("\n\n").map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  const items = paragraph.split("\n").filter(Boolean);
                  return (
                    <ul key={index} className="list-disc list-inside space-y-2 my-4 text-foreground/80">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace("- ", "")}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={index} className="text-foreground/80 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>
            
            {/* Like Button */}
            <div className="flex items-center justify-center mt-10 mb-8">
              <LikeButton postId={post.id} />
            </div>
            
            {/* Comments */}
            <CommentSection postId={post.id} />
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
