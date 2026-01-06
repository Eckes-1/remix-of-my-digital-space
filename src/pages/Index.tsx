import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import BlogCardSkeleton from "@/components/BlogCardSkeleton";
import SidebarSkeleton from "@/components/SidebarSkeleton";
import SearchBar from "@/components/SearchBar";
import TagCloud from "@/components/TagCloud";
import PopularPosts from "@/components/PopularPosts";
import SEOHead from "@/components/SEOHead";
import { usePosts, useSearchPosts } from "@/hooks/usePosts";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: posts, isLoading } = usePosts();
  const { data: searchResults } = useSearchPosts(searchQuery);
  const navigate = useNavigate();

  const displayPosts = searchQuery ? searchResults : posts;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      navigate('/blog?search=' + encodeURIComponent(query));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="墨韵文轩 | 技术博客与生活感悟"
        description="一个关于技术探索、编程心得与生活感悟的个人博客。分享前端开发、系统设计、效率提升等实用内容。"
        keywords="技术博客, 前端开发, React, TypeScript, 编程, 生活随笔"
      />
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <section id="latest-posts" className="py-20 relative">
          {/* Section decoration */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-background rounded-full -translate-y-1/2 flex items-center justify-center border border-border shadow-lg">
            <span className="text-2xl">📝</span>
          </div>
          
          <div className="blog-container">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div className="relative">
                <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                  LATEST
                </span>
                <h2 className="font-serif text-4xl font-bold text-foreground mb-2">最新文章</h2>
                <p className="text-muted-foreground">探索我的最新思考与分享</p>
                {/* Decorative line */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full hidden md:block" />
              </div>
              <div className="w-full md:w-80">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
            
            <div className="grid lg:grid-cols-4 gap-10">
              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <BlogCardSkeleton />
                      </div>
                    ))}
                  </div>
                ) : displayPosts?.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                      <span className="text-4xl">📭</span>
                    </div>
                    <p className="text-xl text-muted-foreground">暂无文章</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">新的内容正在路上...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    {displayPosts?.map((post, index) => (
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
              </div>
              
              <aside className="lg:col-span-1">
                {isLoading ? (
                  <SidebarSkeleton />
                ) : (
                  <div className="space-y-8 sticky top-24">
                    <TagCloud />
                    <PopularPosts />
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
