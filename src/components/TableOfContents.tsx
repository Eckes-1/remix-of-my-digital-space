import { useState, useEffect, useMemo, useCallback } from "react";
import { List } from "lucide-react";
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
          "lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-auto",
          "fixed bottom-0 left-0 right-0 z-50 lg:z-auto",
          "bg-card/95 backdrop-blur-xl lg:bg-card rounded-t-3xl lg:rounded-2xl p-6 lg:p-5",
          "transform transition-transform duration-300 lg:transform-none",
          "border-t lg:border border-border/50 shadow-2xl lg:shadow-lg",
          isExpanded ? "translate-y-0" : "translate-y-full lg:translate-y-0"
        )}
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <List className="w-4 h-4 text-primary-foreground" />
          </span>
          <h3 className="font-serif text-base font-semibold text-foreground">文章目录</h3>
        </div>
        <ul className="space-y-1">
          {headings.map((heading, index) => (
            <li key={heading.id} className="relative">
              {/* Active indicator line */}
              <div 
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300",
                  activeId === heading.id 
                    ? "bg-gradient-to-b from-primary to-primary/50" 
                    : "bg-transparent"
                )}
              />
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "text-sm text-left w-full py-2.5 pl-5 pr-3 rounded-xl transition-all duration-300",
                  "hover:bg-primary/10 hover:text-primary hover:translate-x-1",
                  activeId === heading.id
                    ? "bg-gradient-to-r from-primary/15 to-transparent text-primary font-medium shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "inline-flex items-center gap-2",
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
        <div className="mt-5 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>阅读进度</span>
            <span className="font-medium text-primary">
              {headings.findIndex(h => h.id === activeId) + 1} / {headings.length}
            </span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ 
                width: `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </nav>
    </>
  );
};

export default TableOfContents;
