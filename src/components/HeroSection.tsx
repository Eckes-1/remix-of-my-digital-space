import { ArrowDown } from "lucide-react";
import TypewriterText from "./TypewriterText";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="blog-container text-center py-20">
        <div className="animate-fade-in">
          <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full mb-6">
            欢迎来到我的博客
          </span>
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          <TypewriterText text="墨迹随笔" speed={200} />
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          <TypewriterText 
            text="在这里，我分享关于技术、生活与思考的点滴。每一篇文章，都是一段旅程的记录。" 
            speed={80} 
            delay={1000}
          />
        </p>
        
        <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "3s", animationFillMode: "backwards" }}>
          <a
            href="#latest-posts"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            开始阅读
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
