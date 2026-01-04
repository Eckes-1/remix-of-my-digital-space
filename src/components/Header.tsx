import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTextReplacer } from "@/components/TextReplacer";
import { Settings, Menu, X, Home, BookOpen, Archive, User } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { data: siteSettings } = useSiteSettings();
  const replaceText = useTextReplacer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const siteName = replaceText(siteSettings?.name || "寒冬随笔");

  const navLinks = [
    { path: "/", label: "首页", icon: Home },
    { path: "/blog", label: "文章", icon: BookOpen },
    { path: "/archive", label: "归档", icon: Archive },
    { path: "/about", label: "关于", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="font-serif text-primary-foreground font-bold text-lg">{siteName.charAt(0)}</span>
            </div>
            <span className="hidden sm:block font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {siteName}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <ul className="flex items-center bg-secondary/50 rounded-full px-1.5 py-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-background text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
                管理
              </Link>
            )}
            {!user && (
              <Link
                to="/auth"
                className="hidden md:block px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors"
              >
                登录
              </Link>
            )}
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary"
                  >
                    <Settings className="w-5 h-5" />
                    管理后台
                  </Link>
                </li>
              )}
              {!user && (
                <li>
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mx-4 mt-2 py-3 rounded-xl text-sm font-medium text-primary-foreground bg-primary"
                  >
                    登录 / 注册
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
