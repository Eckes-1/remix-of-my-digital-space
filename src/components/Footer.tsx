import { Github, Twitter, Mail } from "lucide-react";
import RssButton from "./RssButton";

const Footer = () => {
  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="border-t border-border mt-20">
      <div className="blog-container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-serif text-lg font-semibold text-foreground">墨迹随笔</p>
            <p className="text-sm text-muted-foreground mt-1">记录生活，分享思考</p>
          </div>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
            <RssButton variant="icon" />
          </div>
        </div>
        
        {/* RSS Subscribe Link */}
        <div className="mt-6 flex justify-center">
          <RssButton variant="link" />
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} 墨迹随笔. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
