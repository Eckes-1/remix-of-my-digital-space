import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { posts } from "@/data/posts";

const BlogPost = () => {
  const { id } = useParams();
  const post = posts.find((p) => p.id === id);

  if (!post) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <article className="blog-container">
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
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}阅读
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
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
