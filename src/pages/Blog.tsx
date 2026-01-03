import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { posts } from "@/data/posts";

const Blog = () => {
  const categories = ["全部", ...new Set(posts.map((post) => post.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="blog-container">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
              所有文章
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              浏览我的所有文章，涵盖技术、生活、阅读等多个主题
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BlogCard
                  id={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  date={post.date}
                  readTime={post.readTime}
                  category={post.category}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
