import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import SearchBar from "@/components/SearchBar";
import { usePosts, useSearchPosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: posts, isLoading } = usePosts();
  const { data: searchResults } = useSearchPosts(searchQuery);
  const { data: tags } = useTags();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const categories = posts 
    ? ["全部", ...new Set(posts.map((post) => post.category))]
    : ["全部"];

  let displayPosts = searchQuery ? searchResults : posts;
  
  if (selectedCategory && selectedCategory !== "全部" && displayPosts) {
    displayPosts = displayPosts.filter(post => post.category === selectedCategory);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="blog-container">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
              所有文章
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              浏览我的所有文章，涵盖技术、生活、阅读等多个主题
            </p>
            <div className="max-w-md mx-auto">
              <SearchBar onSearch={handleSearch} placeholder="搜索标题或内容..." />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === "全部" ? null : category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  (category === "全部" && !selectedCategory) || category === selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : displayPosts?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? `没有找到与 "${searchQuery}" 相关的文章` : "暂无文章"}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          
          {/* Tags Section */}
          {tags && tags.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border">
              <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-6">
                按标签浏览
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tags/${tag.slug}`}
                    className="px-4 py-2 text-sm bg-card hover:bg-primary hover:text-primary-foreground rounded-full transition-colors border border-border"
                  >
                    {tag.name}
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

export default Blog;
