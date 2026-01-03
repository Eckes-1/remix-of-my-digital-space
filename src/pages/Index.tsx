import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import { posts } from "@/data/posts";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <section id="latest-posts" className="py-16">
          <div className="blog-container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">最新文章</h2>
                <p className="text-muted-foreground">探索我的最新思考与分享</p>
              </div>
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
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
