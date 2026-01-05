import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Github, Twitter, MapPin, Briefcase, Globe, Coffee, BookOpen, Code2, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="blog-container">
          <div className="max-w-2xl mx-auto">
            {/* Profile Section */}
            <div className="text-center mb-12">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary animate-spin-slow opacity-20" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-background shadow-xl">
                  <span className="font-serif text-4xl font-bold text-primary">墨</span>
                </div>
              </div>
              
              <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
                寒冬
              </h1>
              <p className="text-lg text-primary font-medium mb-4">
                全栈开发工程师 / 技术博主
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                热爱技术与写作，相信代码可以改变世界
              </p>
            </div>
            
            {/* Bio Card */}
            <div className="blog-card mb-8">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                关于我
              </h2>
              <div className="prose-blog space-y-4 text-foreground/80">
                <p>
                  👋 你好！我是一名热爱技术的全栈开发者，拥有多年的软件开发经验。
                  我相信技术的力量可以改变世界，也相信分享知识是程序员最美好的品质。
                </p>
                <p>
                  这个博客是我记录技术探索、生活感悟和阅读心得的地方。
                  在这里，你会发现关于前端开发、系统设计、效率提升等多方面的内容。
                </p>
                <p>
                  当我不在写代码的时候，你可能会发现我在阅读、旅行或者尝试新的咖啡。
                  我相信持续学习和保持好奇心是成长的关键。
                </p>
              </div>
            </div>
            
            {/* Skills & Interests */}
            <div className="blog-card mb-8">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                技能专长
              </h2>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS', 'Next.js', 'GraphQL'].map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="blog-card group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">位置</span>
                </div>
                <p className="text-muted-foreground">中国 · 北京</p>
              </div>
              
              <div className="blog-card group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">职业</span>
                </div>
                <p className="text-muted-foreground">全栈开发工程师</p>
              </div>
              
              <div className="blog-card group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">爱好</span>
                </div>
                <p className="text-muted-foreground">咖啡、阅读、旅行</p>
              </div>
              
              <div className="blog-card group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">座右铭</span>
                </div>
                <p className="text-muted-foreground">Stay hungry, stay foolish</p>
              </div>
            </div>
            
            {/* Contact Section */}
            <div className="blog-card">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                联系方式
              </h2>
              <p className="text-muted-foreground mb-4">
                欢迎通过以下方式与我联系，期待与你交流！
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hello@example.com"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  <Mail className="w-4 h-4" />
                  邮件联系
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  <Globe className="w-4 h-4" />
                  个人网站
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
