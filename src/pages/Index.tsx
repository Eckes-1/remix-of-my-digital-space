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
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <section id="latest-posts" className="py-16">
          <div className="blog-container">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">最新文章</h2>
                <p className="text-muted-foreground">探索我的最新思考与分享</p>
              </div>
              <div className="w-full md:w-80">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
            
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
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
                  <div className="text-center py-12 text-muted-foreground">暂无文章</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
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
                  <div className="space-y-6">
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
