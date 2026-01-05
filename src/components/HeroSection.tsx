import { ArrowDown, Sparkles } from "lucide-react";
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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {backgroundType === 'image' && backgroundImage ? (
          <>
            <img 
              src={backgroundImage} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
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
            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl animate-float-orb" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-accent/20 via-accent/5 to-transparent rounded-full blur-3xl animate-float-orb-delayed" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow" />
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${5 + Math.random() * 10}s`
                  }}
                />
              ))}
            </div>
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </>
        )}
      </div>
      
      <div className="blog-container text-center py-20 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-5 py-2.5 rounded-full mb-8 border border-primary/20 backdrop-blur-sm shadow-lg shadow-primary/5">
            <Sparkles className="w-4 h-4 animate-pulse" />
            {badge}
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
        </div>
        
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight">
          <span className="relative inline-block">
            {typewriterEnabled ? (
              <TypewriterText text={title} speed={titleSpeed} loop={loop} loopDelay={loopDelay} />
            ) : (
              title
            )}
            {/* Decorative underline */}
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
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
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-full font-medium overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-105"
          >
            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">开始阅读</span>
            <ArrowDown className="w-4 h-4 relative animate-bounce" />
          </a>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full mt-2 animate-scroll-indicator" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
