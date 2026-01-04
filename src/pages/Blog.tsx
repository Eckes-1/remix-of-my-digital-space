import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Filter, X } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import SearchBar from "@/components/SearchBar";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { useCategories } from "@/hooks/useCategories";
import { useAdvancedSearch, SearchFilters } from "@/hooks/useAdvancedSearch";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: tags } = useTags();
  const { data: categories } = useCategories();
  
  const filters: SearchFilters = {
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    tagId: selectedTag || undefined,
    dateFrom,
    dateTo,
  };
  
  const hasFilters = searchQuery || selectedCategory || selectedTag || dateFrom || dateTo;
  
  const { data: filteredPosts, isLoading: searchLoading } = useAdvancedSearch(
    hasFilters ? filters : { query: '' }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTag(null);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchParams({});
  };

  const displayPosts = hasFilters ? filteredPosts : posts;
  const isLoading = hasFilters ? searchLoading : postsLoading;

  const allCategories = categories ? ["全部", ...categories.map(c => c.name)] : ["全部"];

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
            <div className="max-w-md mx-auto flex gap-2">
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} placeholder="搜索标题或内容..." />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mb-8 p-4 bg-card rounded-xl border border-border animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">高级筛选</h3>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    清除筛选
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tag Filter */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">标签</label>
                  <select
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  >
                    <option value="">全部标签</option>
                    {tags?.map((tag) => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Date From */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">开始日期</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal text-sm h-10">
                        <Calendar className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {dateFrom ? format(dateFrom, 'yyyy/M/d', { locale: zhCN }) : '选择日期'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        locale={zhCN}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Date To */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">结束日期</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal text-sm h-10">
                        <Calendar className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {dateTo ? format(dateTo, 'yyyy/M/d', { locale: zhCN }) : '选择日期'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        locale={zhCN}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
          
          {/* Category Filter */}
          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            {allCategories.map((category) => (
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
              {hasFilters ? '没有找到符合条件的文章' : "暂无文章"}
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
