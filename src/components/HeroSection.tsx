import { ArrowDown } from "lucide-react";
import TypewriterText from "./TypewriterText";
import { useHeroSettings, useTypewriterSettings } from "@/hooks/useSiteSettings";

const HeroSection = () => {
  const { data: heroSettings } = useHeroSettings();
  const { data: typewriterSettings } = useTypewriterSettings();

  const title = heroSettings?.title || "寒冬随笔";
  const description = heroSettings?.description || "在这里，我分享关于技术、生活与思考的点滴。每一篇文章，都是一段旅程的记录。";
  const badge = heroSettings?.badge || "欢迎来到我的博客";
  const backgroundImage = heroSettings?.backgroundImage;
  const backgroundType = heroSettings?.backgroundType || 'gradient';
  const blur = heroSettings?.blur ?? 70;

  const typewriterEnabled = typewriterSettings?.enabled ?? true;
  const titleSpeed = typewriterSettings?.titleSpeed || 200;
  const descSpeed = typewriterSettings?.descSpeed || 80;
  const loop = typewriterSettings?.loop ?? true;
  const loopDelay = typewriterSettings?.loopDelay || 3000;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {backgroundType === 'image' && backgroundImage ? (
          <>
            <img 
              src={backgroundImage} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundColor: `hsl(var(--background) / ${blur / 100})`,
                backdropFilter: blur > 0 ? `blur(${Math.round(blur / 10)}px)` : 'none'
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </>
        )}
      </div>
      
      <div className="blog-container text-center py-20">
        <div className="animate-fade-in">
          <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full mb-6">
            {badge}
          </span>
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          {typewriterEnabled ? (
            <TypewriterText text={title} speed={titleSpeed} loop={loop} loopDelay={loopDelay} />
          ) : (
            title
          )}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          {typewriterEnabled ? (
            <TypewriterText 
              text={description} 
              speed={descSpeed} 
              delay={1000}
              loop={loop}
              loopDelay={loopDelay - 1000}
            />
          ) : (
            description
          )}
        </p>
        
        <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
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
