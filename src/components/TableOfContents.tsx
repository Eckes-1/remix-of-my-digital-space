import { useState, useEffect, useMemo, useCallback } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const paragraphs = content.split("\n\n");
    
    paragraphs.forEach((p, index) => {
      if (p.startsWith("## ")) {
        const title = p.replace("## ", "");
        items.push({
          id: `heading-${index}`,
          title,
          level: 2,
        });
      }
    });
    
    return items;
  }, [content]);

  // Enhanced scroll-based active heading detection
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 150;
    
    // Find the current active heading based on scroll position
    let currentActive = "";
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        const { top } = element.getBoundingClientRect();
        const absoluteTop = top + window.scrollY;
        
        if (absoluteTop <= scrollPosition) {
          currentActive = heading.id;
        }
      }
    }
    
    if (currentActive && currentActive !== activeId) {
      setActiveId(currentActive);
    }
  }, [headings, activeId]);

  useEffect(() => {
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsExpanded(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile floating button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isExpanded && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* TOC Panel */}
      <nav
        className={cn(
          "lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-hidden",
          "fixed bottom-0 left-0 right-0 z-50 lg:z-auto",
          "bg-card/95 backdrop-blur-xl lg:bg-card rounded-t-3xl lg:rounded-2xl",
          "transform transition-all duration-500 ease-out lg:transform-none",
          "border-t lg:border border-border/50 shadow-2xl lg:shadow-lg",
          isExpanded ? "translate-y-0" : "translate-y-full lg:translate-y-0"
        )}
      >
        {/* Header with collapse toggle */}
        <div 
          className="flex items-center justify-between p-5 cursor-pointer group"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <span className={cn(
              "w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center",
              "transition-transform duration-300",
              isCollapsed ? "rotate-0" : "rotate-0"
            )}>
              <List className="w-4 h-4 text-primary-foreground" />
            </span>
            <h3 className="font-serif text-base font-semibold text-foreground">文章目录</h3>
          </div>
          <button 
            className={cn(
              "w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center",
              "transition-all duration-300 hover:bg-primary/10 hover:text-primary",
              "group-hover:scale-105"
            )}
          >
            <ChevronUp className={cn(
              "w-4 h-4 transition-transform duration-300",
              isCollapsed ? "rotate-180" : "rotate-0"
            )} />
          </button>
        </div>

        {/* Collapsible content */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-500 ease-out",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
          )}
        >
          <ul className="space-y-1 px-5 pb-2">
            {headings.map((heading, index) => (
              <li 
                key={heading.id} 
                className="relative"
                style={{
                  transitionDelay: `${index * 30}ms`
                }}
              >
                {/* Active indicator line */}
                <div 
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300",
                    activeId === heading.id 
                      ? "bg-gradient-to-b from-primary to-primary/50 scale-y-100" 
                      : "bg-transparent scale-y-0"
                  )}
                />
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    "text-sm text-left w-full py-2.5 pl-5 pr-3 rounded-xl transition-all duration-300",
                    "hover:bg-primary/10 hover:text-primary hover:translate-x-1",
                    activeId === heading.id
                      ? "bg-gradient-to-r from-primary/15 to-transparent text-primary font-medium shadow-sm translate-x-1"
                      : "text-muted-foreground"
                  )}
                >
                  <span className={cn(
                    "inline-flex items-center gap-2 transition-all duration-300",
                    activeId === heading.id && "animate-fade-in"
                  )}>
                    {activeId === heading.id && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                    {heading.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          
          {/* Progress indicator */}
          <div className="px-5 pb-5 pt-3 border-t border-border/50 mx-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>阅读进度</span>
              <span className="font-medium text-primary">
                {headings.findIndex(h => h.id === activeId) + 1} / {headings.length}
              </span>
            </div>
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Collapsed summary */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300",
            isCollapsed ? "max-h-20 opacity-100 px-5 pb-4" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>共 {headings.length} 个章节</span>
            <span className="mx-1">·</span>
            <span className="text-primary font-medium">
              {headings.findIndex(h => h.id === activeId) + 1} / {headings.length}
            </span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default TableOfContents;
