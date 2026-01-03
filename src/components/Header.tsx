import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navLinks = [
    { path: "/", label: "首页" },
    { path: "/blog", label: "文章" },
    { path: "/archive", label: "归档" },
    { path: "/about", label: "关于" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="blog-container">
        <nav className="flex items-center justify-between h-16">
          <Link to="/" className="font-serif text-xl font-semibold text-foreground hover:text-primary transition-colors">
            墨迹随笔
          </Link>
          
          <ul className="flex items-center gap-6 md:gap-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-sm font-medium transition-colors link-underline ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline">管理</span>
                </Link>
              </li>
            )}
            {!user && (
              <li>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  登录
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
