import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Settings, Menu, X, Home, BookOpen, Archive, User, Rss } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import BookmarksList from "./BookmarksList";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { data: siteSettings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const siteName = siteSettings?.name || "寒冬随笔";

  const navLinks = [
    { path: "/", label: "首页", icon: Home },
    { path: "/blog", label: "文章", icon: BookOpen },
    { path: "/archive", label: "归档", icon: Archive },
    { path: "/about", label: "关于", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all group-hover:scale-105">
                <span className="font-serif text-primary-foreground font-bold text-xl">{siteName.charAt(0)}</span>
              </div>
            </div>
            <span className="hidden sm:block font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {siteName}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center bg-card/80 backdrop-blur-sm rounded-2xl px-2 py-2 border border-border/50 shadow-sm">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* RSS Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rss-feed`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl border border-border/50 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                    aria-label="RSS 订阅"
                  >
                    <Rss className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border">
                  <p>订阅 RSS</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Bookmarks */}
            <div className="hidden sm:block">
              <BookmarksList />
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Settings className="w-4 h-4" />
                管理
              </Link>
            )}
            {!user && (
              <Link
                to="/auth"
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
              >
                登录
              </Link>
            )}
            <ThemeToggle />
            
            {/* Mobile/Tablet menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border/50 text-foreground hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile/Tablet Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 animate-fade-in">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 shadow-lg">
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
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted/50"
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
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50"
                    >
                      <Settings className="w-5 h-5" />
                      管理后台
                    </Link>
                  </li>
                )}
              </ul>
              {!user && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
                  >
                    登录 / 注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
