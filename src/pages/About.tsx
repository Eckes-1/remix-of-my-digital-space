import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Github, Twitter, MapPin, Briefcase } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="blog-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="font-serif text-4xl font-bold text-primary">墨</span>
              </div>
              
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                关于我
              </h1>
              
              <p className="text-muted-foreground">
                一个热爱技术与写作的开发者
              </p>
            </div>
            
            <div className="blog-card mb-8">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                👋 你好！
              </h2>
              <div className="prose-blog space-y-4">
                <p>
                  我是一名热爱技术的全栈开发者，拥有多年的软件开发经验。
                  我相信技术的力量可以改变世界，也相信分享知识是程序员最美好的品质。
                </p>
                <p>
                  这个博客是我记录技术探索、生活感悟和阅读心得的地方。
                  在这里，你会发现关于前端开发、系统设计、效率提升等多方面的内容。
                </p>
                <p>
                  当我不在写代码的时候，你可能会发现我在阅读、旅行或者尝试新的咖啡。
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="blog-card">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">位置</span>
                </div>
                <p className="text-muted-foreground">中国 · 北京</p>
              </div>
              
              <div className="blog-card">
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">职业</span>
                </div>
                <p className="text-muted-foreground">全栈开发工程师</p>
              </div>
            </div>
            
            <div className="blog-card">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                联系方式
              </h2>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  邮件
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
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
