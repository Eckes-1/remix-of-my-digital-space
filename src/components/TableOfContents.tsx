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
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isExpanded && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* TOC Panel */}
      <nav
        className={cn(
          "lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-auto",
          "fixed bottom-0 left-0 right-0 z-50 lg:z-auto",
          "bg-card lg:bg-transparent rounded-t-2xl lg:rounded-none p-6 lg:p-0",
          "transform transition-transform duration-300 lg:transform-none",
          isExpanded ? "translate-y-0" : "translate-y-full lg:translate-y-0"
        )}
      >
        <h3 className="font-serif text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <List className="w-4 h-4" />
          文章目录
        </h3>
        <ul className="space-y-1">
          {headings.map((heading, index) => (
            <li key={heading.id} className="relative">
              {/* Active indicator line */}
              <div 
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-0.5 rounded-full transition-all duration-300",
                  activeId === heading.id 
                    ? "bg-primary scale-y-100" 
                    : "bg-transparent scale-y-0"
                )}
              />
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "text-sm text-left w-full py-2 pl-4 pr-3 rounded-r-lg transition-all duration-300",
                  "hover:bg-primary/10 hover:text-primary hover:translate-x-1",
                  activeId === heading.id
                    ? "bg-gradient-to-r from-primary/15 to-transparent text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "inline-flex items-center gap-2",
                  activeId === heading.id && "animate-fade-in"
                )}>
                  {activeId === heading.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {heading.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default TableOfContents;
