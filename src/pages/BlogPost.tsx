import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";
import TableOfContents from "@/components/TableOfContents";
import RelatedPosts from "@/components/RelatedPosts";
import { usePost, useIncrementViewCount } from "@/hooks/usePosts";
import { useTextReplacer } from "@/components/TextReplacer";
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
  const replaceText = useTextReplacer();

  useEffect(() => {
    if (slug && post) {
      incrementView.mutate(slug);
    }
  }, [slug, post?.id]);

  // Parse content with heading IDs and text replacement
  const parsedContent = useMemo(() => {
    if (!post?.content) return [];
    
    const paragraphs = post.content.split("\n\n");
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.startsWith("## ")) {
        const id = `heading-${index}`;
        return { type: 'heading', content: replaceText(paragraph.replace("## ", "")), id };
      }
      if (paragraph.startsWith("- ")) {
        const items = paragraph.split("\n").filter(Boolean);
        return { type: 'list', items: items.map(item => replaceText(item.replace("- ", ""))), id: null };
      }
      return { type: 'paragraph', content: replaceText(paragraph), id: null };
    });
  }, [post?.content, replaceText]);

  const replacedTitle = useMemo(() => {
    return post?.title ? replaceText(post.title) : '';
  }, [post?.title, replaceText]);

  const replacedExcerpt = useMemo(() => {
    return post?.excerpt ? replaceText(post.excerpt) : '';
  }, [post?.excerpt, replaceText]);

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
            alt={replacedTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-32 relative">
          <div className="grid lg:grid-cols-[1fr_220px] gap-8">
            {/* Main content */}
            <article className="bg-background rounded-xl p-6 md:p-10 shadow-lg">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                返回文章列表
              </Link>
              
              <header className="mb-12">
                <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                  {replaceText(post.category)}
                </span>
                
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  {replacedTitle}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                {parsedContent.map((item, index) => {
                  if (item.type === 'heading') {
                    return (
                      <h2 
                        key={index} 
                        id={item.id!}
                        className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4 scroll-mt-24"
                      >
                        {item.content}
                      </h2>
                    );
                  }
                  if (item.type === 'list') {
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 my-4 text-foreground/80">
                        {item.items!.map((listItem, i) => (
                          <li key={i}>{listItem}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={index} className="text-foreground/80 leading-relaxed mb-4">
                      {item.content}
                    </p>
                  );
                })}
              </div>
              
              {/* Like & Share Buttons */}
              <div className="flex items-center justify-center gap-4 mt-10 mb-8">
                <LikeButton postId={post.id} />
                <ShareButton title={replacedTitle} />
              </div>

              {/* Related Posts */}
              <RelatedPosts currentPostId={post.id} category={post.category} />
              
              {/* Comments */}
              <CommentSection postId={post.id} />
            </article>

            {/* Sidebar with TOC */}
            <aside className="hidden lg:block">
              <TableOfContents content={replaceText(post.content)} />
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
