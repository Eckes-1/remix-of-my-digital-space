import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAnimationClasses } from "@/hooks/useAnimationStyle";
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
  const { style, settings } = useAnimationClasses();
  
  const siteName = siteSettings?.name || "墨韵文轩";

  const navLinks = [
    { path: "/", label: "首页", icon: Home },
    { path: "/blog", label: "文章", icon: BookOpen },
    { path: "/archive", label: "归档", icon: Archive },
    { path: "/about", label: "关于", icon: User },
  ];

  // Get animation classes based on style
  const getLogoHoverClass = () => {
    switch (style) {
      case 'playful':
        return 'group-hover:scale-110 group-hover:rotate-6';
      case 'tech':
        return 'group-hover:scale-105 group-hover:shadow-cyan-500/50';
      case 'minimal':
        return 'group-hover:opacity-80';
      case 'neon':
        return 'group-hover:scale-105 group-hover:shadow-pink-500/50 group-hover:shadow-lg';
      case 'retro':
        return 'group-hover:scale-110 group-hover:rotate-3 group-hover:hue-rotate-15';
      case 'aurora':
        return 'group-hover:scale-105 group-hover:shadow-emerald-500/50';
      case 'ink':
        return 'group-hover:scale-102';
      default:
        return 'group-hover:scale-105';
    }
  };

  const getNavLinkClass = (isActive: boolean) => {
    const baseClass = "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium";
    const activeClass = "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20";
    const inactiveClass = "text-muted-foreground hover:text-foreground hover:bg-muted/50";
    
    let transitionClass = "transition-all duration-300";
    if (style === 'playful') {
      transitionClass = "transition-all duration-200 hover:scale-105 active:scale-95";
    } else if (style === 'tech') {
      transitionClass = "transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20";
    } else if (style === 'minimal') {
      transitionClass = "transition-all duration-150";
    }
    
    return cn(baseClass, transitionClass, isActive ? activeClass : inactiveClass);
  };

  const getIconAnimation = (isActive: boolean) => {
    if (!isActive) return "";
    switch (style) {
      case 'playful':
        return 'animate-bounce-slow';
      case 'tech':
        return 'animate-glow-pulse';
      case 'minimal':
        return '';
      default:
        return 'animate-pulse';
    }
  };

  const getButtonHoverClass = () => {
    switch (style) {
      case 'playful':
        return 'hover:scale-110 active:scale-95 hover:rotate-3';
      case 'tech':
        return 'hover:shadow-cyan-500/30 hover:border-cyan-400/50';
      case 'minimal':
        return 'hover:opacity-70';
      default:
        return 'hover:scale-105';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-18 py-3">
          {/* Logo with enhanced animation */}
          <Link 
            to="/" 
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <div className={cn(
                "absolute inset-0 bg-primary/20 rounded-xl transition-all",
                style === 'playful' ? 'blur-xl group-hover:blur-2xl' : 
                style === 'tech' ? 'blur-lg group-hover:blur-xl group-hover:bg-cyan-500/20' : 
                'blur-lg group-hover:blur-xl',
                "opacity-0 group-hover:opacity-100"
              )} />
              <div className={cn(
                "relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300",
                getLogoHoverClass()
              )}>
                <span className={cn(
                  "font-serif text-primary-foreground font-bold text-xl transition-transform duration-300",
                  style === 'playful' && "group-hover:scale-110"
                )}>
                  {siteName.charAt(0)}
                </span>
              </div>
            </div>
            <span className={cn(
              "hidden sm:block font-serif text-xl font-semibold text-foreground transition-all duration-300",
              style === 'playful' ? 'group-hover:text-primary group-hover:tracking-wide' :
              style === 'tech' ? 'group-hover:text-cyan-400' :
              'group-hover:text-primary'
            )}>
              {siteName}
            </span>
          </Link>
          
          {/* Desktop Navigation - Full labels */}
          <div className="hidden lg:flex items-center">
            <ul className={cn(
              "flex items-center bg-card/80 backdrop-blur-sm rounded-2xl px-2 py-2 border border-border/50 shadow-sm",
              style === 'tech' && "hover:border-cyan-500/30 transition-colors duration-300"
            )}>
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <li 
                    key={link.path}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      to={link.path}
                      className={getNavLinkClass(isActive)}
                    >
                      <Icon className={cn("w-4 h-4", getIconAnimation(isActive))} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tablet Navigation - Icon only with tooltip */}
          <div className="hidden md:flex lg:hidden items-center">
            <ul className="flex items-center bg-card/80 backdrop-blur-sm rounded-2xl px-2 py-2 border border-border/50 shadow-sm gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={link.path}
                            className={cn(
                              "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                              isActive
                                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                              style === 'playful' && !isActive && "hover:scale-110 active:scale-95"
                            )}
                          >
                            <Icon className={cn("w-5 h-5", getIconAnimation(isActive))} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card border-border">
                          <p>{link.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    className={cn(
                      "hidden lg:flex w-10 h-10 items-center justify-center rounded-xl border border-border/50 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300",
                      getButtonHoverClass()
                    )}
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
            <BookmarksList />

            {isAdmin && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/admin"
                      className={cn(
                        "hidden md:flex items-center justify-center w-10 h-10 lg:w-auto lg:px-4 lg:py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300",
                        getButtonHoverClass()
                      )}
                    >
                      <Settings className={cn(
                        "w-4 h-4 lg:mr-2",
                        style === 'tech' && "hover:animate-spin-slow"
                      )} />
                      <span className="hidden lg:inline">管理</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="lg:hidden bg-card border-border">
                    <p>管理后台</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/auth"
                      className={cn(
                        "hidden md:flex items-center justify-center w-10 h-10 lg:w-auto lg:px-5 lg:py-2.5 text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300",
                        style === 'playful' && "hover:scale-105 active:scale-95 hover:rotate-1",
                        style === 'tech' && "hover:shadow-cyan-500/30"
                      )}
                    >
                      <User className="w-4 h-4 lg:hidden" />
                      <span className="hidden lg:inline">登录</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="lg:hidden bg-card border-border">
                    <p>登录</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-card border border-border/50 text-foreground hover:bg-muted transition-all duration-300",
                style === 'playful' && "active:scale-95 hover:rotate-3",
                style === 'tech' && "hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:shadow-lg"
              )}
            >
              <div className={cn(
                "transition-transform duration-300",
                mobileMenuOpen && "rotate-90"
              )}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation with enhanced animation */}
        {mobileMenuOpen && (
          <div className={cn(
            "md:hidden pb-6",
            style === 'playful' ? 'animate-bounce-in' :
            style === 'tech' ? 'animate-glitch-in' :
            'animate-fade-in'
          )}>
            <div className={cn(
              "bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 shadow-lg",
              style === 'tech' && "border-cyan-500/30"
            )}>
              <ul className="space-y-1">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <li 
                      key={link.path}
                      className={cn(
                        style === 'playful' ? 'animate-slide-up-bounce' :
                        style === 'tech' ? 'animate-slide-up-tech' :
                        'animate-slide-up'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted/50",
                          style === 'playful' && !isActive && "active:scale-95"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
                {isAdmin && (
                  <li className="animate-slide-up" style={{ animationDelay: '200ms' }}>
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
                <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in" style={{ animationDelay: '250ms' }}>
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 transition-all",
                      style === 'playful' && "active:scale-95"
                    )}
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
