import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Search, ArrowLeft, Compass, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePopularPosts } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: popularPosts, isLoading } = usePopularPosts(4);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Animated 404 Number */}
          <div className="relative">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float opacity-30"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + i * 0.5}s`,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>

            {/* 404 Text with gradient */}
            <h1 className="text-[120px] sm:text-[180px] font-bold leading-none tracking-tighter relative">
              <span className="bg-gradient-to-br from-primary via-primary/70 to-accent bg-clip-text text-transparent animate-pulse">
                4
              </span>
              <span className="relative inline-block mx-2">
                <Compass 
                  className="w-20 h-20 sm:w-28 sm:h-28 text-primary animate-spin-slow" 
                  style={{ animationDuration: '8s' }}
                />
              </span>
              <span className="bg-gradient-to-br from-accent via-primary/70 to-primary bg-clip-text text-transparent animate-pulse" style={{ animationDelay: '0.5s' }}>
                4
              </span>
            </h1>
          </div>

          {/* Message */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground">
              哎呀，页面迷路了
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              看起来这个页面去了一个我们找不到的地方。不过别担心，让我们帮你找到正确的方向！
            </p>
          </div>

          {/* Search Box */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索你想找的内容..."
                    className="pl-11 pr-4 py-5 bg-card/80 backdrop-blur-sm border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <Button type="submit" size="lg" className="rounded-xl px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="rounded-xl gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              返回上一页
            </Button>
            <Button
              asChild
              className="rounded-xl gap-2 shadow-lg shadow-primary/20"
            >
              <Link to="/">
                <Home className="w-4 h-4" />
                回到首页
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-xl gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
            >
              <Link to="/blog">
                <BookOpen className="w-4 h-4" />
                浏览博客
              </Link>
            </Button>
          </div>

          {/* Popular Posts Recommendation */}
          {popularPosts && popularPosts.length > 0 && (
            <div className="pt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                <span className="text-sm font-medium text-muted-foreground px-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  也许你会喜欢这些文章
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-card/50 rounded-xl animate-pulse" />
                  ))
                ) : (
                  popularPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className={cn(
                        "group flex items-center gap-3 p-3 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all duration-300",
                        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                      )}
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <span className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        index === 0 && "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
                        index === 1 && "bg-gradient-to-br from-slate-400 to-slate-500 text-white",
                        index === 2 && "bg-gradient-to-br from-amber-700 to-amber-800 text-white",
                        index === 3 && "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-left">
                        {post.title}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
